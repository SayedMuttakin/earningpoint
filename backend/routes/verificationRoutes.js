const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getVerificationStatus, submitVerification } = require('../controllers/verificationController');

router.get('/', protect, getVerificationStatus);
router.post('/', protect, submitVerification);

module.exports = router;
