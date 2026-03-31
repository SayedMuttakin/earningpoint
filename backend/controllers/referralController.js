const Referral = require('../models/Referral');
const User = require('../models/User');

// GET /api/referrals — Get user's referral data
exports.getReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode');
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate('referredUserId', 'phoneOrEmail name createdAt')
      .sort({ createdAt: -1 });

    const totalEarned = referrals.reduce((sum, r) => sum + (r.bonusAwarded || 0), 0);

    res.json({
      referralCode: user.referralCode,
      friendsInvited: referrals.length,
      totalEarned,
      referrals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// POST /api/referrals/apply — Apply a referral code during registration
exports.applyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }

    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    if (referrer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot use your own referral code' });
    }

    // Check if already referred
    const existing = await Referral.findOne({ referredUserId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already used a referral code' });
    }

    const referral = await Referral.create({
      referrerId: referrer._id,
      referredUserId: req.user._id,
      bonusAwarded: 60, // 60 TK bonus as requested
      status: 'completed',
    });

    const Transaction = require('../models/Transaction');

    // Give 60 TK to the referrer
    await User.findByIdAndUpdate(referrer._id, { $inc: { balance: 60 } });
    await Transaction.create({
      userId: referrer._id,
      type: 'referral_bonus',
      amount: 60,
      description: 'Friend registered using your referral code',
      status: 'completed'
    });

    // Give 60 TK to the referred user
    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: 60 } });
    await Transaction.create({
      userId: req.user._id,
      type: 'referral_bonus',
      amount: 60,
      description: 'Sign up bonus from referral code',
      status: 'completed'
    });

    res.status(201).json({ message: 'Referral code applied successfully. You earned 60 TK!', referral });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
