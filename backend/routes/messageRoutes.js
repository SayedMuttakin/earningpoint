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
  uploadFile,
  addStory,
  deleteStory,
  getStories
} = require('../controllers/messageController');

router.get('/users', protect, getUsers);
router.get('/history/:otherUserId', protect, getChatHistory);
router.post('/groups', protect, createGroup);
router.get('/history/group/:groupId', protect, getGroupHistory);
router.put('/note', protect, updateNote);
router.get('/notes', protect, getNotes);
router.post('/upload', protect, upload.single('file'), uploadFile);

// Story routes
router.get('/stories', protect, getStories);
router.post('/story', protect, upload.single('image'), addStory);
router.delete('/story/:storyId', protect, deleteStory);

module.exports = router;
