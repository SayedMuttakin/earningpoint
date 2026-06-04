const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get all posts (Public)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post (Admin)
// @route   POST /api/admin/posts
// @access  Private/Admin
exports.createPost = async (req, res) => {
  try {
    const { content, title, image, authorName, isVerified } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.create({
      content,
      title: title || null,
      image: image || null,
      authorName: authorName || 'Zenivio',
      isVerified: isVerified !== undefined ? isVerified : true
    });

    // Notify all users about the new post
    try {
      const users = await User.find({}, '_id');
      const notificationPromises = users.map(user => 
        createNotification(
          user._id, 
          'New Post Updated! 📢', 
          `${authorName || 'Zenivio'} has shared a new update. Check it out now!`, 
          'post'
        )
      );
      await Promise.all(notificationPromises);
    } catch (notifyError) {
      console.error('Error sending post notifications:', notifyError);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a post (Admin)
// @route   PUT /api/admin/posts/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
  try {
    const { content, title, image, authorName, isVerified } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.content = content || post.content;
    post.title = title !== undefined ? title : post.title;
    post.image = image !== undefined ? image : post.image;
    post.authorName = authorName || post.authorName;
    post.isVerified = isVerified !== undefined ? isVerified : post.isVerified;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get custom home page feed for authenticated user (Followed posts + Recommended posts)
// @route   GET /api/posts/feed
// @access  Private
exports.getPostsFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const followingIds = req.user.following || [];

    // 1. Fetch posts from followed users and current user
    const followedPosts = await Post.find({
      authorId: { $in: [...followingIds, currentUserId] }
    }).sort({ createdAt: -1 }).limit(30);

    // 2. Fetch some posts from non-followed users (recommended posts)
    // Exclude followed users, the current user, and admin posts
    const nonFollowedPosts = await Post.find({
      authorId: { $nin: [...followingIds, currentUserId, null] }
    }).sort({ createdAt: -1 }).limit(15);

    // 3. Combine and sort by createdAt descending
    const feedPosts = [...followedPosts, ...nonFollowedPosts];
    feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 4. Map with isFollowing and isOwnPost indicators
    const postsWithStatus = feedPosts.map(post => {
      const isFollowing = post.authorId ? followingIds.includes(post.authorId.toString()) : false;
      const isOwnPost = post.authorId ? post.authorId.toString() === currentUserId.toString() : false;
      return {
        ...post.toObject(),
        isFollowing,
        isOwnPost
      };
    });

    res.json(postsWithStatus);
  } catch (error) {
    console.error('Error fetching posts feed:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post by user
// @route   POST /api/posts
// @access  Private
exports.createUserPost = async (req, res) => {
  try {
    const { content, title } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/api/image?file=${req.file.filename}`;
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.create({
      content,
      title: title || null,
      image: imageUrl,
      authorId: req.user._id,
      authorName: req.user.name || 'User',
      isVerified: req.user.isEmailVerified || false
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ message: error.message });
  }
};

