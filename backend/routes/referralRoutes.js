const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReferrals, applyReferralCode, claimCampaignReward } = require('../controllers/referralController');

router.get('/', protect, getReferrals);
router.post('/apply', protect, applyReferralCode);
router.post('/claim-campaign', protect, claimCampaignReward);

module.exports = router;
