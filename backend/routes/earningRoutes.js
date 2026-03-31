const express = require('express');
const router = express.Router();
const earningController = require('../controllers/earningController');
const { protect } = require('../middleware/authMiddleware');

router.get('/daily-status', protect, earningController.getDailyStatus);
router.post('/daily-checkin', protect, earningController.claimDailyCheckin);

router.get('/video-status', protect, earningController.getVideoAdStatus);
router.post('/video-claim', protect, earningController.claimVideoAd);

router.get('/spin-status', protect, earningController.getSpinStatus);
router.post('/spin-claim', protect, earningController.claimSpin);

router.get('/scratch-status', protect, earningController.getScratchStatus);
router.post('/scratch-claim', protect, earningController.claimScratch);

router.get('/quiz-status', protect, earningController.getQuizStatus);
router.post('/quiz-claim', protect, earningController.claimQuiz);

router.post('/convert-coins', protect, earningController.convertCoins);
router.post('/withdraw', protect, earningController.submitWithdrawal);
router.post('/premium-order', protect, earningController.submitPremiumOrder);

module.exports = router;

