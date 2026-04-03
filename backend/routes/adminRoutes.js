const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');
const postController = require('../controllers/postController');

// Auth (public)
router.post('/login', adminController.adminLogin);

// Dashboard
router.get('/stats', adminProtect, adminController.getDashboardStats);

// Users
router.get('/users', adminProtect, adminController.getUsers);
router.get('/users/:id', adminProtect, adminController.getUser);
router.put('/users/:id', adminProtect, adminController.updateUser);
router.delete('/users/:id', adminProtect, adminController.deleteUser);

// Transactions
router.get('/transactions', adminProtect, adminController.getTransactions);
router.put('/transactions/:id', adminProtect, adminController.updateTransaction);

// Support
router.get('/support', adminProtect, adminController.getSupportTickets);
router.get('/support/:id', adminProtect, adminController.getSupportTicket);
router.put('/support/:id', adminProtect, adminController.replyToTicket);

// Live Chat Sessions
router.get('/chat-sessions', adminProtect, adminController.getChatSessions);
router.get('/chat-sessions/:id', adminProtect, adminController.getChatSession);

// Referrals
router.get('/referrals', adminProtect, adminController.getReferrals);

// Premium Orders
router.get('/premium-orders', adminProtect, adminController.getPremiumOrders);
router.put('/premium-orders/:id', adminProtect, adminController.updatePremiumOrder);

// Verifications (email status only)
router.get('/verifications', adminProtect, adminController.getVerifications);

// Posts Management
router.get('/posts', adminProtect, postController.getPosts);
router.post('/posts', adminProtect, postController.createPost);
router.put('/posts/:id', adminProtect, postController.updatePost);
router.delete('/posts/:id', adminProtect, postController.deletePost);

module.exports = router;
