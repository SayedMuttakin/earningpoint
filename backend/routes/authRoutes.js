const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, facebookAuth, getReferrerName } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.get('/referrer/:code', getReferrerName);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
