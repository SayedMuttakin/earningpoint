const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  googleAuth, 
  facebookAuth, 
  getReferrerName, 
  checkUsernameAvailability,
  sendRegistrationOTP,
  verifyRegistrationOTP
} = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');

router.post('/register', registerUser);
router.post('/send-registration-otp', sendRegistrationOTP);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.get('/referrer/:code', getReferrerName);
router.get('/check-username/:username', checkUsernameAvailability);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
