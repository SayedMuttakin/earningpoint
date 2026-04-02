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
      authorName: authorName || 'Zenvio',
      isVerified: isVerified !== undefined ? isVerified : true
    });

    // Notify all users about the new post
    try {
      const users = await User.find({}, '_id');
      const notificationPromises = users.map(user => 
        createNotification(
          user._id, 
          'New Post Updated! 📢', 
          `${authorName || 'Zenvio'} has shared a new update. Check it out now!`, 
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
