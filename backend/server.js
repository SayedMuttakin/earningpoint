const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ── Gzip Compression ─────────────────────────────────────────────────
// Reduces response payload by 60-80% — speeds up all API responses significantly
app.use(compression({ level: 6, threshold: 1024 }));

// CORS - Allow all origins (safe since JWT is used, not cookies)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Request Logger — disabled in production to reduce CPU/IO overhead
// Only enable for debugging — comment this out in production
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images via API route using query param to avoid Nginx static file interception
app.get('/api/image', (req, res) => {
  const filename = req.query.file;
  if (!filename) return res.status(400).json({ message: 'Missing file parameter' });
  // Sanitize filename to prevent directory traversal
  const safeName = path.basename(filename);
  const filePath = path.join(__dirname, 'uploads', safeName);
  if (fs.existsSync(filePath)) {
    // Cache statically uploaded media (images and videos) permanently on user devices to make load speeds instant
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }
  res.status(404).json({ message: 'Image not found', requested: safeName });
});

// Database Connection
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool: allow up to 10 concurrent DB connections
      maxPoolSize: 10,
      // Don't wait more than 5s to find a server
      serverSelectionTimeoutMS: 5000,
      // Socket timeout — drop slow queries after 45s
      socketTimeoutMS: 45000,
    });
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

    const emailVerifyRoutes = require('./routes/emailVerifyRoutes');
    app.use('/api/email-verify', emailVerifyRoutes);

    const messageRoutes = require('./routes/messageRoutes');
    app.use('/api/messages', messageRoutes);

    // Basic Route
    app.get('/', (req, res) => {
      res.send('Zenivio API is running...');
    });

    // Debug Route
    app.get('/api/debug/uploads', (req, res) => {
      const fs = require('fs');
      const uploadDir = path.join(__dirname, 'uploads');
      const backendDir = __dirname;
      
      let debugInfo = {
        backendDir,
        uploadDir,
        exists: fs.existsSync(uploadDir),
        files: []
      };

      if (debugInfo.exists) {
        debugInfo.files = fs.readdirSync(uploadDir);
        try {
          const stats = fs.statSync(uploadDir);
          debugInfo.permissions = stats.mode.toString(8);
        } catch (e) {
          debugInfo.error = e.message;
        }
      }
      
      res.json(debugInfo);
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error('Global Error Handler:', err);
      res.status(500).json({ 
        message: 'Internal Server Error', 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    const PORT = process.env.PORT || 5001;
    
    // Setup HTTP server and Socket.IO
    const http = require('http');
    const server = http.createServer(app);
    const socketIo = require('./socket');
    socketIo.init(server);

    if (isNaN(PORT)) {
      server.listen(PORT, () => {
        console.log(`🚀 Server running on Unix Socket/Pipe: ${PORT}`);
      });
    } else {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT} at http://0.0.0.0:${PORT}`);
      });
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

startServer();
