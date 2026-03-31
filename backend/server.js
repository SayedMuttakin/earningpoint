const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

// Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.get('Origin')}`);
  next();
});

app.use(express.json({ limit: '10mb' }));

// Database Connection
const startServer = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully!');
    
    // Routes
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);

    const profileRoutes = require('./routes/profileRoutes');
    app.use('/api/profile', profileRoutes);

    const transactionRoutes = require('./routes/transactionRoutes');
    app.use('/api/transactions', transactionRoutes);

    const referralRoutes = require('./routes/referralRoutes');
    app.use('/api/referrals', referralRoutes);

    const verificationRoutes = require('./routes/verificationRoutes');
    app.use('/api/verification', verificationRoutes);

    const leaderboardRoutes = require('./routes/leaderboardRoutes');
    app.use('/api/leaderboard', leaderboardRoutes);

    const supportRoutes = require('./routes/supportRoutes');
    app.use('/api/support', supportRoutes);

    const earningRoutes = require('./routes/earningRoutes');
    app.use('/api/earning', earningRoutes);

    const adminRoutes = require('./routes/adminRoutes');
    app.use('/api/admin', adminRoutes);

    const postRoutes = require('./routes/postRoutes');
    app.use('/api/posts', postRoutes);

    const notificationRoutes = require('./routes/notificationRoutes');
    app.use('/api/notifications', notificationRoutes);

    // Basic Route
    app.get('/', (req, res) => {
      res.send('Zenvio API is running...');
    });

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

startServer();
