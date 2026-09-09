const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');
const smsService = require('../utils/smsService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://zenivio.it.com';

const formatBangladeshNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  let cleaned = phoneNumber.toString().replace(/[^0-9]/g, '');

  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('88') && cleaned.length === 13) {
    cleaned = cleaned.substring(2);
  }

  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
};

const maskIdentifier = (type, value) => {
  if (!value) return '';
  if (type === 'email') {
    const parts = value.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      const maskedName = name.length > 2 
        ? name[0] + '*'.repeat(Math.min(name.length - 2, 4)) + name.slice(-1)
        : name[0] + '***';
      return `${maskedName}@${domain}`;
    }
    return value;
  } else {
    // Phone masking (e.g. 017••••89)
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length >= 8) {
      return clean.slice(0, 3) + '••••' + clean.slice(-2);
    }
    return value;
  }
};

// POST /api/auth/forgot-password/send-code
exports.sendResetCode = async (req, res) => {
  try {
    const { identifier, countryCode = '+880' } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ message: 'Email address or mobile number is required.' });
    }

    const cleanInput = identifier.trim();
    const isEmail = cleanInput.includes('@');
    const isPhoneCandidate = !isEmail && /^[\d\s+()-]{6,20}$/.test(cleanInput);

    let user = null;
    let deliveryType = 'email';
    let targetDestination = '';

    if (isEmail) {
      const emailLower = cleanInput.toLowerCase();
      user = await User.findOne({
        $or: [
          { phoneOrEmail: emailLower },
          { verifiedEmail: emailLower },
          { username: emailLower }
        ]
      });
      deliveryType = 'email';
      targetDestination = user ? (user.verifiedEmail || user.phoneOrEmail) : emailLower;
    } else if (isPhoneCandidate) {
      const rawDigits = cleanInput.replace(/[^0-9]/g, '');
      const bdFormat = formatBangladeshNumber(cleanInput);
      const fullPhoneWithCode = `${countryCode.startsWith('+') ? countryCode : `+${countryCode}`}${rawDigits}`;

      user = await User.findOne({
        $or: [
          { phoneOrEmail: cleanInput },
          { phoneOrEmail: rawDigits },
          { phoneOrEmail: bdFormat },
          { verifiedPhone: cleanInput },
          { verifiedPhone: fullPhoneWithCode },
          { verifiedPhone: `+880${bdFormat.replace(/^0/, '')}` },
          { verifiedPhone: bdFormat },
        ]
      });
      deliveryType = 'phone';
      targetDestination = user ? (user.verifiedPhone || user.phoneOrEmail) : cleanInput;
    } else {
      // Try search as username
      const usernameLower = cleanInput.toLowerCase();
      user = await User.findOne({
        $or: [
          { username: usernameLower },
          { phoneOrEmail: cleanInput }
        ]
      });
      if (user) {
        if (user.verifiedPhone) {
          deliveryType = 'phone';
          targetDestination = user.verifiedPhone;
        } else if (user.verifiedEmail || (user.phoneOrEmail && user.phoneOrEmail.includes('@'))) {
          deliveryType = 'email';
          targetDestination = user.verifiedEmail || user.phoneOrEmail;
        } else {
          deliveryType = 'phone';
          targetDestination = user.phoneOrEmail;
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        message: 'No registered account found with this email or mobile number.'
      });
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetCode = code;
    user.passwordResetCodeExpiry = expiry;
    await user.save();

    if (deliveryType === 'phone') {
      try {
        await smsService.sendPhoneOTP(targetDestination, code);
      } catch (smsErr) {
        console.error('Failed to send reset SMS OTP:', smsErr.message);
        return res.status(500).json({
          message: smsErr.message || 'Failed to send SMS code. Please try again or use your registered email.'
        });
      }
    } else {
      try {
        await sendPasswordResetOTPEmail(targetDestination, code);
      } catch (mailErr) {
        console.error('Failed to send reset email OTP:', mailErr.message);
        return res.status(500).json({
          message: 'Failed to send reset code to your email. Please try again later.'
        });
      }
    }

    const maskedTarget = maskIdentifier(deliveryType, targetDestination);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${maskedTarget}`,
      type: deliveryType,
      maskedTarget,
      userId: user._id
    });
  } catch (err) {
    console.error('Send reset code error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// POST /api/auth/forgot-password/verify-code
exports.verifyResetCode = async (req, res) => {
  try {
    const { userId, identifier, code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: '6-digit verification code is required.' });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (identifier) {
      const clean = identifier.trim();
      user = await User.findOne({
        $or: [
          { phoneOrEmail: clean },
          { phoneOrEmail: clean.toLowerCase() },
          { verifiedEmail: clean.toLowerCase() },
          { verifiedPhone: clean },
          { username: clean.toLowerCase() }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (!user.passwordResetCode) {
      return res.status(400).json({ message: 'No active verification code found. Please request a new code.' });
    }

    if (user.passwordResetCodeExpiry && new Date() > user.passwordResetCodeExpiry) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.passwordResetCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    // Generate secure temporary reset token valid for 15 minutes
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    user.passwordResetCode = null;
    user.passwordResetCodeExpiry = null;
    await user.save();

    res.json({
      success: true,
      resetToken,
      message: 'Code verified successfully! You can now set a new password.'
    });
  } catch (err) {
    console.error('Verify reset code error:', err);
    res.status(500).json({ message: 'Failed to verify code. Please try again.' });
  }
};

// POST /api/auth/forgot-password/reset-password OR /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, resetToken, password, newPassword } = req.body;
    const effectiveToken = token || resetToken;
    const effectivePassword = password || newPassword;

    if (!effectiveToken || !effectivePassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    if (effectivePassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({
      passwordResetToken: effectiveToken,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset session. Please try again.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(effectivePassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    user.passwordResetCode = null;
    user.passwordResetCodeExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Legacy backward-compatibility for /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  return exports.sendResetCode(req, res);
};
