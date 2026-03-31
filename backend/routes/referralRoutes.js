const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReferrals, applyReferralCode } = require('../controllers/referralController');

router.get('/', protect, getReferrals);
router.post('/apply', protect, applyReferralCode);

module.exports = router;
