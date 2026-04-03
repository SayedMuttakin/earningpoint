const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getReferrerName } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/referrer/:code', getReferrerName);

module.exports = router;
