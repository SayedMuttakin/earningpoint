const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendOTP, verifyOTP, getEmailVerifyStatus } = require('../controllers/emailVerifyController');

router.get('/status', protect, getEmailVerifyStatus);
router.post('/send', protect, sendOTP);
router.post('/verify', protect, verifyOTP);

module.exports = router;
