const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  toggleDarkMode,
} = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/', protect, deleteAccount);
router.put('/darkmode', protect, toggleDarkMode);

module.exports = router;
