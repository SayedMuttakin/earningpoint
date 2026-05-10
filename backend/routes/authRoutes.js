const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getReferrerName } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/referrer/:code', getReferrerName);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
