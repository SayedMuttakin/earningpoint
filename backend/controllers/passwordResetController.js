const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://earningpoint.netlify.app';

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email (phoneOrEmail field)
    const user = await User.findOne({ phoneOrEmail: email.trim().toLowerCase() });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = token;
    user.passwordResetExpiry = expiry;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.phoneOrEmail, resetLink);

    res.json({ message: 'If this email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
