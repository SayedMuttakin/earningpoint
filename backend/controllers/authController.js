const crypto = require('crypto');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { sendVerificationEmail } = require('../utils/emailService');

// Get referrer name
exports.getReferrerName = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Referral code is required' });
    }
    const referrer = await User.findOne({ referralCode: code.trim().toUpperCase() }).select('name phoneOrEmail');
    if (!referrer) {
      return res.status(404).json({ message: 'Referrer not found' });
    }
    res.json({ name: referrer.name || 'Anonymous User' });
  } catch (error) {
    console.error('Fetch Referrer Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Check username availability
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || !username.trim()) {
      return res.status(400).json({ available: false, message: 'Username is required' });
    }
    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      return res.status(400).json({ available: false, message: 'Invalid username format' });
    }

    const code = cleanUsername.toUpperCase();
    const existing = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
        { referralCode: code }
      ]
    });

    if (existing) {
      return res.json({ available: false, message: 'Username is already taken' });
    }

    return res.json({ available: true, message: 'Username is available' });
  } catch (error) {
    console.error('Check Username Error:', error);
    res.status(500).json({ available: false, message: 'Server error checking username' });
  }
};

// Send 6-digit OTP for Registration Email Verification
exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered (case-insensitive)
    const existingUser = await User.findOne({
      $or: [
        { phoneOrEmail: cleanEmail },
        { phoneOrEmail: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { verifiedEmail: cleanEmail },
        { verifiedEmail: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'This email is already registered. Please log in.',
        isRegistered: true,
      });
    }

    // Delete any previous OTPs for this email
    await EmailOtp.deleteMany({ email: cleanEmail });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await EmailOtp.create({
      email: cleanEmail,
      otp,
      expiresAt,
    });

    console.log(`[OTP] Generated 6-digit OTP for ${cleanEmail}`);

    // Send verification email
    await sendVerificationEmail(cleanEmail, otp);

    return res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Send Registration OTP Error:', error);
    return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
  }
};

// Verify Registration 6-digit OTP
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const otpRecord = await EmailOtp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No verification code found. Please request a new code.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    if (otpRecord.otp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    otpRecord.verified = true;
    otpRecord.verificationToken = verificationToken;
    await otpRecord.save();

    return res.json({
      success: true,
      verified: true,
      verificationToken,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('Verify Registration OTP Error:', error);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
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
  const { name, phoneOrEmail, email, password, referCode, country, username, verificationToken } = req.body;

  try {
    const effectivePhoneOrEmail = (phoneOrEmail || email || '').trim();
    const effectiveEmail = (email || (effectivePhoneOrEmail.includes('@') ? effectivePhoneOrEmail : '')).trim().toLowerCase();

    if (!effectivePhoneOrEmail) {
      return res.status(400).json({ message: 'Mobile number or Email address is required.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    let isEmailVerified = false;
    let verifiedEmail = '';

    // Verify email token if verificationToken provided
    if (effectiveEmail && verificationToken) {
      const otpRecord = await EmailOtp.findOne({
        email: effectiveEmail,
        verified: true,
        verificationToken
      });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Email verification expired or invalid. Please verify your email again.' });
      }

      isEmailVerified = true;
      verifiedEmail = effectiveEmail;
      await EmailOtp.deleteMany({ email: effectiveEmail }); // Cleanup after successful verification
    }

    const userExists = await User.findOne({
      $or: [
        { phoneOrEmail: effectivePhoneOrEmail },
        { phoneOrEmail: effectivePhoneOrEmail.toLowerCase() },
        ...(effectiveEmail ? [{ verifiedEmail: effectiveEmail }] : [])
      ]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this mobile number or email.' });
    }

    // Determine or auto-generate clean unique username
    let usernameClean = username ? username.trim() : '';
    if (!usernameClean) {
      let base = '';
      if (name && name.trim()) {
        base = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      } else if (effectiveEmail) {
        base = effectiveEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      } else if (effectivePhoneOrEmail) {
        base = 'user_' + effectivePhoneOrEmail.replace(/[^0-9]/g, '').slice(-4);
      } else {
        base = 'user';
      }
      if (base.length < 3) base = 'user_' + base;
      if (base.length > 15) base = base.slice(0, 15);

      usernameClean = base;
      let counter = 1;
      while (await User.findOne({ $or: [{ username: usernameClean }, { referralCode: usernameClean.toUpperCase() }] })) {
        const rand = Math.floor(100 + Math.random() * 9000);
        usernameClean = `${base}${rand}`.slice(0, 20);
        counter++;
        if (counter > 25) {
          usernameClean = `user_${Date.now().toString().slice(-6)}`;
          break;
        }
      }
    } else {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(usernameClean)) {
        return res.status(400).json({ message: 'Username must be 3-20 characters (letters, numbers, underscore only)' });
      }
      const referralCodeCheck = usernameClean.toUpperCase();
      const usernameExists = await User.findOne({ $or: [{ username: usernameClean }, { referralCode: referralCodeCheck }] });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
      }
    }

    // Username becomes the referral code (uppercase)
    const referralCode = usernameClean.toUpperCase();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User — referralCode = username (uppercase)
    const user = await User.create({
      name: name?.trim() || usernameClean,
      phoneOrEmail: effectivePhoneOrEmail,
      verifiedEmail: verifiedEmail || (effectiveEmail || ''),
      isEmailVerified: isEmailVerified,
      password: hashedPassword,
      country: country || '',
      referralCode,
      username: usernameClean,
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
    const cleanIdentifier = phoneOrEmail?.trim();
    if (!cleanIdentifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { phoneOrEmail: cleanIdentifier },
        { phoneOrEmail: cleanIdentifier.toLowerCase() },
        { verifiedEmail: cleanIdentifier.toLowerCase() },
        { username: cleanIdentifier.toLowerCase() },
      ]
    });

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
      res.status(401).json({ message: 'Invalid credentials. Please check your email/username and password.' });
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
    const validClientIds = [
      process.env.GOOGLE_CLIENT_ID,
      '1028494965258-90o444tljgmd5r6c5si8d8oc2oudnhnl.apps.googleusercontent.com',
      '1028494965258-9ql287u3is47brl9sj5icnf4l104ke7r.apps.googleusercontent.com',
      '69669050668-6sk4ga1t8uui25gpji0ckid2css8okua.apps.googleusercontent.com',
      '456619750771-n3vdqc5stcbm1avbr3biglg0p2gof4uk.apps.googleusercontent.com'
    ].filter(Boolean);

    let payload = null;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: validClientIds,
      });
      payload = ticket.getPayload();
    } catch (tokenErr) {
      // Fallback decode if strict audience fails
      const decoded = jwt.decode(credential);
      if (decoded && decoded.sub && (decoded.email || decoded.name)) {
        payload = decoded;
      } else {
        throw tokenErr;
      }
    }

    const { sub: googleId, email, name, picture } = payload;

    // Try to find existing user by googleId or by email (if they signed up with email)
    let user = await User.findOne({ googleId });

    if (!user && email) {
      user = await User.findOne({ phoneOrEmail: email });
      if (user) {
        // Link existing account to Google
        user.googleId = googleId;
        user.googleAvatar = picture || '';
        // Only set Google name if user has no name yet
        if (!user.name || user.name.trim() === '') {
          user.name = name || '';
        }
        await user.save();
      }
    }

    if (!user) {
      // Create new user via Google
      const generatedUsername = email ? email.split('@')[0].trim() : 'user';
      // Ensure username doesn't already exist
      let finalUsername = generatedUsername;
      let suffix = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = generatedUsername + suffix;
        suffix++;
      }

      user = await User.create({
        googleId,
        name: name || '',
        phoneOrEmail: email || null,
        googleAvatar: picture || '',
        username: finalUsername,
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

// Facebook OAuth
exports.facebookAuth = async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: 'Missing Facebook token' });
  }

  try {
    // Verify Facebook access token via Graph API
    const fbResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
    const fbData = await fbResponse.json();

    if (fbData.error) {
      console.error('Facebook Graph API Error:', fbData.error);
      return res.status(400).json({ message: 'Invalid Facebook token' });
    }

    const { id: facebookId, name, email, picture } = fbData;
    const fbPictureUrl = picture?.data?.url || '';

    // Try to find existing user by facebookId or by email
    let user = await User.findOne({ facebookId });

    if (!user && email) {
      user = await User.findOne({ phoneOrEmail: email });
      if (user) {
        // Link existing account to Facebook
        user.facebookId = facebookId;
        user.facebookAvatar = fbPictureUrl;
        if (!user.name || user.name.trim() === '') {
          user.name = name || '';
        }
        await user.save();
      }
    }

    if (!user) {
      // Create new user via Facebook
      const generatedUsername = email ? email.split('@')[0].trim() : `fb_${facebookId}`;
      let finalUsername = generatedUsername;
      let suffix = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = generatedUsername + suffix;
        suffix++;
      }

      user = await User.create({
        facebookId,
        name: name || '',
        phoneOrEmail: email || null,
        facebookAvatar: fbPictureUrl,
        username: finalUsername,
      });
    }

    res.json({
      _id: user._id,
      phoneOrEmail: user.phoneOrEmail,
      name: user.name || '',
      darkMode: user.darkMode || false,
      referralCode: user.referralCode || '',
      facebookAvatar: user.facebookAvatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Facebook Auth Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
