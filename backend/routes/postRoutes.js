const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getPosts);

// @route   GET /api/posts/videos
// @desc    Get all video posts (reels)
// @access  Public
router.get('/videos', postController.getVideoPosts);

// @route   GET /api/posts/feed
// @desc    Get follow-aware homepage feed
// @access  Private
router.get('/feed', protect, postController.getPostsFeed);

// @route   GET /api/posts/saved
// @desc    Get saved posts for authenticated user
// @access  Private
router.get('/saved', protect, postController.getSavedPosts);

router.get('/:id', postController.getPostById);

// @route   POST /api/posts
// @desc    Create a user post (with optional image or video)
// @access  Private
router.post('/', protect, upload.single('image'), postController.createUserPost);

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:id/like', protect, postController.toggleLikePost);

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, postController.commentPost);

// @route   POST /api/posts/:id/save
// @desc    Toggle save post
// @access  Private
router.post('/:id/save', protect, postController.toggleSavePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post by user
// @access  Private
router.delete('/:id', protect, postController.deleteUserPost);

// @route   POST /api/posts/:id/report
// @desc    Report a post (UGC)
// @access  Private
router.post('/:id/report', protect, postController.reportPost);

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete a comment on a post
// @access  Private
router.delete('/:postId/comment/:commentId', protect, postController.deleteComment);

module.exports = router;
