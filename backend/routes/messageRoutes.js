const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getUsers, 
  getChatHistory, 
  createGroup, 
  getGroupHistory, 
  updateNote, 
  getNotes 
} = require('../controllers/messageController');

router.get('/users', protect, getUsers);
router.get('/history/:otherUserId', protect, getChatHistory);
router.post('/groups', protect, createGroup);
router.get('/history/group/:groupId', protect, getGroupHistory);
router.put('/note', protect, updateNote);
router.get('/notes', protect, getNotes);

module.exports = router;
