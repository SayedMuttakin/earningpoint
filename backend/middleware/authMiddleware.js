const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Fields needed across all controllers — only fetch these to avoid loading the entire document
const AUTH_SELECT_FIELDS = [
  '_id', 'name', 'phoneOrEmail', 'googleAvatar', 'profilePic', 'coverPic',
  'isEmailVerified', 'isBanned', 'isPremium', 'premiumExpiry',
  'balance', 'points', 'lifetimePoints',
  'referralCode', 'darkMode', 'following', 'followers',
  'role'
].join(' ');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    // lean() returns a plain JS object (not Mongoose Document) — 40% faster, less memory
    req.user = await User.findById(decoded.id).select(AUTH_SELECT_FIELDS).lean();

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
