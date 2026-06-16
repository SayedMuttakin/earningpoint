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
router.get('/withdrawals', adminProtect, adminController.getAllWithdrawals);
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
router.put('/verifications/:id', adminProtect, adminController.updateVerificationStatus);

// Posts Management
router.get('/posts', adminProtect, postController.getPosts);
router.post('/posts', adminProtect, postController.createPost);
router.put('/posts/:id', adminProtect, postController.updatePost);
router.delete('/posts/:id', adminProtect, postController.deletePost);

// Articles Management
router.get('/articles', adminProtect, adminController.getArticles);
router.post('/articles', adminProtect, adminController.createArticle);
router.put('/articles/:id', adminProtect, adminController.updateArticle);
router.delete('/articles/:id', adminProtect, adminController.deleteArticle);

// Global App Settings
router.get('/settings/global', adminProtect, adminController.getGlobalSettings);
router.put('/settings/global', adminProtect, adminController.updateGlobalSettings);

// Weekly Missions Management
router.get('/weekly-missions', adminProtect, adminController.getWeeklyMissions);
router.post('/weekly-missions', adminProtect, adminController.createWeeklyMission);
router.put('/weekly-missions/:id', adminProtect, adminController.updateWeeklyMission);
router.delete('/weekly-missions/:id', adminProtect, adminController.deleteWeeklyMission);

// Announcements Management
router.post('/announcements', adminProtect, adminController.sendAnnouncement);


const upload = require('../middleware/uploadMiddleware');

// Products Management
const uploadMiddleware = (req, res, next) => {
  // Only apply multer if the content-type is multipart/form-data
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('imageFile')(req, res, (err) => {
      if (err) {
        console.error('Multer Error:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }
  next();
};

router.get('/products', adminProtect, adminController.getProducts);
router.post('/products', adminProtect, uploadMiddleware, adminController.createProduct);
router.put('/products/:id', adminProtect, uploadMiddleware, adminController.updateProduct);
router.delete('/products/:id', adminProtect, adminController.deleteProduct);

module.exports = router;
