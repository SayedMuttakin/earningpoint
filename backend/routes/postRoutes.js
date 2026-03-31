const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getPosts);

module.exports = router;
