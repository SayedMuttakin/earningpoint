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
} = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.get('/search', protect, searchUsers);
router.put('/update', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/', protect, deleteAccount);
router.put('/darkmode', protect, toggleDarkMode);
router.post('/follow/:userId', protect, followUser);

module.exports = router;
