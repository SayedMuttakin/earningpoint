const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { 
  getUsers, 
  getChatHistory, 
  createGroup, 
  getGroupHistory, 
  updateNote, 
  getNotes,
  uploadFile
} = require('../controllers/messageController');

router.get('/users', protect, getUsers);
router.get('/history/:otherUserId', protect, getChatHistory);
router.post('/groups', protect, createGroup);
router.get('/history/group/:groupId', protect, getGroupHistory);
router.put('/note', protect, updateNote);
router.get('/notes', protect, getNotes);
router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;
