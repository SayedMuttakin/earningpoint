const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get all posts (Public)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('authorId', 'name profilePic googleAvatar isEmailVerified').sort({ createdAt: -1 });
    const mapped = posts.map(post => {
      const postObj = post.toObject();
      const authorObj = postObj.authorId;
      return {
        ...postObj,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          isEmailVerified: authorObj.isEmailVerified
        } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('authorId', 'name profilePic googleAvatar isEmailVerified');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const postObj = post.toObject();
    const authorObj = postObj.authorId;
    res.json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        isEmailVerified: authorObj.isEmailVerified
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post (Admin)
// @route   POST /api/admin/posts
// @access  Private/Admin
exports.createPost = async (req, res) => {
  try {
    const { content, title, image, video, authorName, isVerified } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.create({
      content,
      title: title || null,
      image: image || null,
      video: video || null,
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
    const { content, title, image, video, authorName, isVerified } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.content = content || post.content;
    post.title = title !== undefined ? title : post.title;
    post.image = image !== undefined ? image : post.image;
    post.video = video !== undefined ? video : post.video;
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
    }).populate('authorId', 'name profilePic googleAvatar isEmailVerified').sort({ createdAt: -1 }).limit(30);

    // 2. Fetch some posts from non-followed users (recommended posts)
    // Exclude followed users, the current user, and admin posts
    const nonFollowedPosts = await Post.find({
      authorId: { $nin: [...followingIds, currentUserId, null] }
    }).populate('authorId', 'name profilePic googleAvatar isEmailVerified').sort({ createdAt: -1 }).limit(15);

    // 3. Combine and sort by createdAt descending
    const feedPosts = [...followedPosts, ...nonFollowedPosts];
    feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 4. Map with isFollowing and isOwnPost indicators
    const postsWithStatus = feedPosts.map(post => {
      const isFollowing = post.authorId ? followingIds.includes(post.authorId._id.toString()) : false;
      const isOwnPost = post.authorId ? post.authorId._id.toString() === currentUserId.toString() : false;
      
      const postObj = post.toObject();
      const authorObj = postObj.authorId;
      
      return {
        ...postObj,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          isEmailVerified: authorObj.isEmailVerified
        } : null,
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
    const { content, title, privacy, feeling, location, taggedFriends, bgGradient } = req.body;
    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      const fileUrl = `/api/image?file=${req.file.filename}`;
      if (req.file.mimetype.startsWith('video/')) {
        videoUrl = fileUrl;
      } else {
        imageUrl = fileUrl;
      }
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let parsedFriends = [];
    if (taggedFriends) {
      try {
        parsedFriends = typeof taggedFriends === 'string' ? JSON.parse(taggedFriends) : taggedFriends;
      } catch (e) {
        parsedFriends = typeof taggedFriends === 'string' ? taggedFriends.split(',').map(f => f.trim()) : taggedFriends;
      }
    }

    const post = await Post.create({
      content,
      title: title || null,
      image: imageUrl,
      video: videoUrl,
      authorId: req.user._id,
      authorName: req.user.name || 'User',
      isVerified: req.user.isEmailVerified || false,
      privacy: privacy || 'public',
      feeling: feeling || null,
      location: location || null,
      taggedFriends: parsedFriends,
      bgGradient: bgGradient || null
    });

    const populatedPost = await Post.findById(post._id).populate('authorId', 'name profilePic googleAvatar isEmailVerified');
    const postObj = populatedPost.toObject();
    const authorObj = postObj.authorId;

    res.status(201).json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        isEmailVerified: authorObj.isEmailVerified
      } : null
    });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all video posts (reels)
// @route   GET /api/posts/videos
// @access  Public
exports.getVideoPosts = async (req, res) => {
  try {
    const posts = await Post.find({ video: { $ne: null } })
      .populate('authorId', 'name profilePic googleAvatar isEmailVerified')
      .sort({ createdAt: -1 });
    const mapped = posts.map(post => {
      const postObj = post.toObject();
      const authorObj = postObj.authorId;
      return {
        ...postObj,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          _id: authorObj._id.toString(),
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          isEmailVerified: authorObj.isEmailVerified
        } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
      // Trigger notification for post author (if not own post)
      if (post.authorId && post.authorId.toString() !== userId.toString()) {
        try {
          await createNotification(
            post.authorId,
            'New Like! ❤️',
            `${req.user.name || 'A user'} liked your post: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
            'post',
            post._id
          );
        } catch (err) {
          console.error('Failed to create like notification:', err);
        }
      }
    }

    await post.save();
    
    res.json({ 
      likesCount: post.likes.length, 
      isLiked: !isLiked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      userName: req.user.name || 'User',
      userAvatar: req.user.profilePic || req.user.googleAvatar || '',
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Trigger notification for post author (if not own post)
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      try {
        await createNotification(
          post.authorId,
          'New Comment! 💬',
          `${req.user.name || 'A user'} commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          'post',
          post._id
        );
      } catch (err) {
        console.error('Failed to create comment notification:', err);
      }
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

