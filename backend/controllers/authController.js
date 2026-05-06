const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Get referrer name
exports.getReferrerName = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Referral code is required' });
    }
    const referrer = await User.findOne({ referralCode: code.toUpperCase() }).select('name phoneOrEmail');
    if (!referrer) {
      return res.status(404).json({ message: 'Referrer not found' });
    }
    res.json({ name: referrer.name || 'Anonymous User' });
  } catch (error) {
    console.error('Fetch Referrer Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate JWT tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Register User
exports.registerUser = async (req, res) => {
  const { name, phoneOrEmail, password, referCode, country, username } = req.body;

  try {
    const userExists = await User.findOne({ phoneOrEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username (referralCode) already exists
    if (username) {
      const usernameExists = await User.findOne({ referralCode: username.toUpperCase() });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User first
    const user = await User.create({
      name,
      phoneOrEmail,
      password: hashedPassword,
      country: country || '',
      ...(username && { referralCode: username.toUpperCase() }),
    });

    if (user) {
      // Handle Referral Bonus if referCode provided
      if (referCode) {
        const referrer = await User.findOne({ referralCode: referCode.trim().toUpperCase() });
        
        // Don't allow self-referral (though unlikely with manual entry)
        if (referrer && referrer._id.toString() !== user._id.toString()) {
          // 1. Award bonus to referrer
          referrer.balance = (referrer.balance || 0) + 60;
          await referrer.save();

          // 2. Create Transaction for referrer
          await Transaction.create({
            userId: referrer._id,
            type: 'referral_bonus',
            amount: 60,
            description: `Referral bonus for ${user.name || user.phoneOrEmail}`,
            status: 'completed'
          });

          // 3. Create Referral record
          await Referral.create({
            referrerId: referrer._id,
            referredUserId: user._id,
            bonusAwarded: 60,
            status: 'completed'
          });

          // 4. Create Notification for referrer
          await Notification.create({
            userId: referrer._id,
            title: 'Referral Bonus Received! 🎁',
            message: `Congratulations! You've earned 60 TK bonus for referring ${user.name || 'a new friend'}.`,
            type: 'earning'
          });
        }
      }

      res.status(201).json({
        _id: user._id,
        phoneOrEmail: user.phoneOrEmail,
        name: user.name || '',
        darkMode: user.darkMode || false,
        referralCode: user.referralCode || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { phoneOrEmail, password } = req.body;

  try {
    const user = await User.findOne({ phoneOrEmail });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        phoneOrEmail: user.phoneOrEmail,
        name: user.name || '',
        darkMode: user.darkMode || false,
        referralCode: user.referralCode || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// Google OAuth
exports.googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Try to find existing user by googleId or by email (if they signed up with email)
    let user = await User.findOne({ googleId });

    if (!user && email) {
      user = await User.findOne({ phoneOrEmail: email });
      if (user) {
        // Link existing account to Google
        user.googleId = googleId;
        user.googleAvatar = picture || '';
        await user.save();
      }
    }

    if (!user) {
      // Create new user via Google
      user = await User.create({
        googleId,
        name: name || '',
        phoneOrEmail: email || null,
        googleAvatar: picture || '',
      });
    }

    res.json({
      _id: user._id,
      phoneOrEmail: user.phoneOrEmail,
      name: user.name || '',
      darkMode: user.darkMode || false,
      referralCode: user.referralCode || '',
      googleAvatar: user.googleAvatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google credential' });
  }
};
