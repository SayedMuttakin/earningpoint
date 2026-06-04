const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUsers, getChatHistory } = require('../controllers/messageController');

router.get('/users', protect, getUsers);
router.get('/history/:otherUserId', protect, getChatHistory);

module.exports = router;
