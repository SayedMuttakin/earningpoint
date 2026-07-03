const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  toggleDarkMode,
  followUser,
  searchUsers,
  getPublicProfile,
  blockUser,
  reportUser,
} = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.get('/search', protect, searchUsers);
router.put('/update', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/', protect, deleteAccount);
router.put('/darkmode', protect, toggleDarkMode);
router.post('/follow/:userId', protect, followUser);
router.post('/block/:userId', protect, blockUser);
router.post('/report/:userId', protect, reportUser);
router.get('/:userId', protect, getPublicProfile);

module.exports = router;
