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

router.post('/task-claim', protect, earningController.claimTask);

router.get('/scratch-status', protect, earningController.getScratchStatus);
router.post('/scratch-claim', protect, earningController.claimScratch);

router.get('/quiz-status', protect, earningController.getQuizStatus);
router.post('/quiz-claim', protect, earningController.claimQuiz);
router.post('/gk-claim', protect, earningController.claimGkQuiz);

router.get('/mystery-status', protect, earningController.getMysteryBoxStatus);
router.post('/mystery-claim', protect, earningController.claimMysteryBox);

router.get('/articles', protect, earningController.getArticles);
router.post('/article-claim', protect, earningController.claimArticleReward);

router.post('/convert-coins', protect, earningController.convertCoins);
router.post('/withdraw', protect, earningController.submitWithdrawal);
router.get('/withdrawals', protect, earningController.getWithdrawals);
router.get('/all-withdrawals', protect, earningController.getAllWithdrawals);
router.post('/premium-order', protect, earningController.submitPremiumOrder);

router.get('/settings', earningController.getGlobalSettings);
router.get('/products', protect, earningController.getProducts);

module.exports = router;

