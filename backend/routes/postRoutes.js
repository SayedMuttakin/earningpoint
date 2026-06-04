const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getPosts);
// @route   GET /api/posts/feed
// @desc    Get follow-aware homepage feed
// @access  Private
router.get('/feed', protect, postController.getPostsFeed);

router.get('/:id', postController.getPostById);

// @route   POST /api/posts
// @desc    Create a user post (with optional image)
// @access  Private
router.post('/', protect, upload.single('image'), postController.createUserPost);

module.exports = router;
