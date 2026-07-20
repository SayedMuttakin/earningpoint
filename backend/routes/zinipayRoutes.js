const express = require('express');
const router = express.Router();
const zinipayController = require('../controllers/zinipayController');
const { protect } = require('../middleware/authMiddleware');

// 1. Create Invoice (Auth required)
router.post('/create', protect, zinipayController.createInvoice);

// 2. Redirect Callback (Public - GET & POST)
router.get('/redirect', zinipayController.handleRedirect);
router.post('/redirect', zinipayController.handleRedirect);

// 3. Webhook Callback (Public - GET & POST)
router.get('/webhook', zinipayController.handleWebhook);
router.post('/webhook', zinipayController.handleWebhook);

// 4. Check Status (Auth required)
router.post('/check-status', protect, zinipayController.checkStatus);

module.exports = router;
