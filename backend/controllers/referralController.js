const Referral = require('../models/Referral');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { createNotification } = require('./notificationController');

// GET /api/referrals — Get user's referral data with VPN status per referred user
exports.getReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode');
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate('referredUserId', 'phoneOrEmail name createdAt isPremium premiumExpiry')
      .sort({ createdAt: -1 });

    const totalEarned = referrals.reduce((sum, r) => sum + (r.bonusAwarded || 0), 0);
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;

    // Format referral list with VPN status
    const referralList = referrals.map(r => ({
      id: r._id,
      name: r.referredUserId?.name || 'User',
      phone: r.referredUserId?.phoneOrEmail || '',
      joinedAt: r.createdAt,
      vpnPurchased: r.status === 'completed',
      vpnPurchasedAt: r.vpnPurchasedAt,
      bonusAwarded: r.bonusAwarded,
    }));

    const referrerRecord = await Referral.findOne({ referredUserId: req.user._id })
      .populate('referrerId', 'referralCode');

    const campaignClaimed = await Transaction.exists({
      userId: req.user._id,
      type: 'referral_campaign_reward'
    });

    res.json({
      referralCode: user.referralCode,
      friendsInvited: referrals.length,
      completedReferrals, // VPN-activated referrals
      totalEarned,
      referrals: referralList,
      campaignClaimed: !!campaignClaimed,
      referredByCode: referrerRecord?.referrerId?.referralCode || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// POST /api/referrals/apply — Apply referral code at registration
// NOTE: Bonus is NOT given immediately — only after referred user buys VPN
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

    // Create referral in PENDING state — no bonus until VPN purchase
    await Referral.create({
      referrerId: referrer._id,
      referredUserId: req.user._id,
      bonusAwarded: 0,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Referral code applied! Your referrer will earn a bonus when you purchase a VPN plan.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// Internal: Called when a user's premium/VPN is approved
// activatedUserId = the user who just got premium
exports.activateReferralBonus = async (activatedUserId) => {
  try {
    // Find pending referral for this user
    const referral = await Referral.findOne({
      referredUserId: activatedUserId,
      status: 'pending',
    });

    if (!referral) return; // No pending referral

    // Activate bonus
    referral.status = 'completed';
    referral.bonusAwarded = 60;
    referral.vpnPurchasedAt = new Date();
    await referral.save();

    // Give 60 TK bonus to referrer
    await User.findByIdAndUpdate(referral.referrerId, { $inc: { balance: 60 } });
    await Transaction.create({
      userId: referral.referrerId,
      type: 'referral_bonus',
      amount: 60,
      description: 'Referral bonus — your friend purchased a VPN plan!',
      status: 'completed',
    });

    // Notify referrer
    createNotification(
      referral.referrerId,
      'Referral Bonus! 🎉',
      'Your referred friend just purchased a VPN plan. You earned 60৳ bonus!',
      'earning'
    );

    // Give 60 TK signup bonus to referred user too
    await User.findByIdAndUpdate(activatedUserId, { $inc: { balance: 60 } });
    await Transaction.create({
      userId: activatedUserId,
      type: 'referral_bonus',
      amount: 60,
      description: 'Referral bonus — you purchased a VPN plan via referral!',
      status: 'completed',
    });

    createNotification(
      activatedUserId,
      'Welcome Bonus! 🎁',
      'You earned 60৳ referral bonus for purchasing a VPN plan through a referral!',
      'earning'
    );
  } catch (error) {
    console.error('activateReferralBonus error:', error);
  }
};

// POST /api/referrals/claim-campaign — Claim milestone campaign reward
exports.claimCampaignReward = async (req, res) => {
  try {
    const GlobalSetting = require('../models/GlobalSetting');
    const settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    const target = settings?.referralCampaignTarget || 5;
    const reward = settings?.referralCampaignReward || 300;

    // Count completed referrals for this user
    const completedCount = await Referral.countDocuments({
      referrerId: req.user._id,
      status: 'completed'
    });

    if (completedCount < target) {
      return res.status(400).json({ 
        message: `You need at least ${target} verified referrals to claim this reward. Current: ${completedCount}` 
      });
    }

    // Check if already claimed
    const existing = await Transaction.findOne({
      userId: req.user._id,
      type: 'referral_campaign_reward'
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already claimed this campaign reward!' });
    }

    // Credit user balance
    const user = await User.findById(req.user._id);
    user.balance = (user.balance || 0) + reward;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: req.user._id,
      type: 'referral_campaign_reward',
      amount: reward,
      description: `Referral Campaign Reward — Invited ${target} friends!`,
      status: 'completed'
    });

    // Create notification
    createNotification(
      req.user._id,
      'Campaign Reward Claimed! 🏆',
      `Congratulations! You claimed ৳${reward} cash reward for inviting ${target} friends.`,
      'earning'
    );

    res.json({
      message: `Successfully claimed ৳${reward} cash reward!`,
      newBalance: user.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
