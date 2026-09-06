const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const accountVerifyController = require('../controllers/accountVerifyController');

router.get('/status', protect, accountVerifyController.getVerificationStatus);
router.post('/phone/save', protect, accountVerifyController.savePhone);
router.post('/phone/send-otp', protect, accountVerifyController.sendPhoneOTP);
router.post('/phone/verify-otp', protect, accountVerifyController.verifyPhoneOTP);
router.post('/email/send-otp', protect, accountVerifyController.sendEmailOTP);
router.post('/email/verify-otp', protect, accountVerifyController.verifyEmailOTP);

module.exports = router;
