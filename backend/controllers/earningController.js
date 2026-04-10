const User = require('../models/User');
const Article = require('../models/Article');
const Transaction = require('../models/Transaction');
const GlobalSetting = require('../models/GlobalSetting');
const CartProduct = require('../models/CartProduct');
const { createNotification } = require('./notificationController');

const processPoints = (user, reward) => {
  user.points = (user.points || 0) + reward;
  user.lifetimePoints = (user.lifetimePoints || 0) + reward;
  return false; // Auto-conversion disabled, user must convert manually
};

exports.getDailyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastDailyCheckin dailyCheckinCount');
    res.json({
      lastCheckin: user.lastDailyCheckin,
      count: user.dailyCheckinCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimDailyCheckin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    // Determine if we are in a new 2-hour window
    const isNewWindow = !user.lastDailyCheckin || (now - user.lastDailyCheckin >= TWO_HOURS);

    if (isNewWindow) {
      // Start a new window
      user.dailyCheckinCount = 0;
    } else if (user.dailyCheckinCount >= 2) {
      // Window is still active but ads are exhausted
      const waitTime = Math.ceil((TWO_HOURS - (now - user.lastDailyCheckin)) / (60 * 1000));
      return res.status(400).json({ message: `Please wait ${waitTime} minutes for the next checkin session.` });
    }

    // Process the claim
    const converted = processPoints(user, 20);
    user.dailyCheckinCount += 1;
    user.lastDailyCheckin = now; // Track the time of the last successful claim

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: 20,
      description: `Daily Checkin Ad Reward`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Reward Earned! 💰', 'You just earned 20 points from Daily Checkin!', 'earning');

    res.json({ 
      message: `Rewarded 20 points! (${user.dailyCheckinCount}/2 ads completed)`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.dailyCheckinCount,
      lastCheckin: user.lastDailyCheckin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getVideoAdStatus = async (req, res) => {
  try {
    const { type } = req.query;
    const isViewAds = type === 'view_ads';
    
    const selectFields = isViewAds ? 'lastViewAdsAd viewAdsCount' : 'lastVideoAd videoAdCount';
    const user = await User.findById(req.user._id).select(selectFields);
    
    const lastAdField = isViewAds ? 'lastViewAdsAd' : 'lastVideoAd';
    const countField = isViewAds ? 'viewAdsCount' : 'videoAdCount';

    // Check if it's a new day to reset the count
    const now = new Date();
    let count = user[countField] || 0;
    
    if (user[lastAdField]) {
      const lastAdDate = new Date(user[lastAdField]);
      if (lastAdDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastAd: user[lastAdField],
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimVideoAd = async (req, res) => {
  try {
    const { type } = req.body;
    const isViewAds = type === 'view_ads';
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    const countField = isViewAds ? 'viewAdsCount' : 'videoAdCount';
    const lastAdField = isViewAds ? 'lastViewAdsAd' : 'lastVideoAd';

    // Check if it's a new day
    let currentCount = user[countField] || 0;
    if (user[lastAdField]) {
      const lastAdDate = new Date(user[lastAdField]);
      if (lastAdDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 5) {
      return res.status(400).json({ message: `You have reached the daily limit of 5 ${isViewAds ? 'View Ads' : 'Videos'}. Please come back tomorrow.` });
    }

    // Determine reward amount: video = 25, view_ads = 10
    const rewardedAmount = isViewAds ? 10 : 25;
    const typeLabel = isViewAds ? 'View Ads' : 'Videos';

    // Process the claim
    const converted = processPoints(user, rewardedAmount);
    user[countField] = currentCount + 1;
    user[lastAdField] = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: rewardedAmount,
      description: `${typeLabel} Reward (${user[countField]}/5)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Video Reward! 📺', `You earned ${rewardedAmount} points for watching ${typeLabel} ${user[countField]}/5 today.`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${rewardedAmount} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${rewardedAmount} points! (${user[countField]}/5 completed)`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user[countField],
      lastAd: user[lastAdField]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getSpinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastSpinDate spinCount');
    const now = new Date();
    let count = user.spinCount || 0;
    
    if (user.lastSpinDate) {
      const lastDate = new Date(user.lastSpinDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastSpinDate: user.lastSpinDate,
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimSpin = async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    let currentCount = user.spinCount || 0;
    if (user.lastSpinDate) {
      const lastDate = new Date(user.lastSpinDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 10) {
      return res.status(400).json({ message: `You have reached the daily limit of 10 spins. Please come back tomorrow.` });
    }

    // Validate points (should be 10..100)
    const validPoints = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const reward = validPoints.includes(Number(points)) ? Number(points) : 10; // Default to 10 if invalid

    const converted = processPoints(user, reward);
    user.spinCount = currentCount + 1;
    user.lastSpinDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Spin Wheel Reward (${user.spinCount}/10)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Lucky Spin! 🎡', `Congratulations! You won ${reward} points from the Fortune Wheel!`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points! (${user.spinCount}/10 spins completed)`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.spinCount,
      lastSpinDate: user.lastSpinDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.claimTask = async (req, res) => {
  try {
    const { points, name } = req.body;
    const user = await User.findById(req.user._id);
    
    const reward = Number(points) > 0 ? Number(points) : 10;
    const taskName = name || 'Ad Task';

    const converted = processPoints(user, reward);

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `${taskName} Reward`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Task Completed! ✅', `Congratulations! You earned ${reward} points from ${taskName}!`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points!`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getScratchStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastScratchDate scratchCount');
    const now = new Date();
    let count = user.scratchCount || 0;
    
    if (user.lastScratchDate) {
      const lastDate = new Date(user.lastScratchDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastScratchDate: user.lastScratchDate,
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimScratch = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    let currentCount = user.scratchCount || 0;
    if (user.lastScratchDate) {
      const lastDate = new Date(user.lastScratchDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 10) {
      return res.status(400).json({ message: `You have reached the daily limit of 10 scratch cards. Please come back tomorrow.` });
    }

    const reward = Math.floor(Math.random() * 99) + 1; // Random points under 100
    const converted = processPoints(user, reward);
    user.scratchCount = currentCount + 1;
    user.lastScratchDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Scratch Card Reward (${user.scratchCount}/10)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Scratch Reward! 🎟️', `Amazing! You scratched and won ${reward} points.`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points! (${user.scratchCount}/10 cards completed)`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.scratchCount,
      lastScratchDate: user.lastScratchDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getQuizStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastQuizDate quizCount');
    const now = new Date();
    let count = user.quizCount || 0;
    
    if (user.lastQuizDate) {
      const lastDate = new Date(user.lastQuizDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastQuizDate: user.lastQuizDate,
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimQuiz = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    let currentCount = user.quizCount || 0;
    if (user.lastQuizDate) {
      const lastDate = new Date(user.lastQuizDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 10) {
      return res.status(400).json({ message: `You have reached the daily limit of 10 quizzes. Please come back tomorrow.` });
    }

    const reward = 20;
    const converted = processPoints(user, reward);
    user.quizCount = currentCount + 1;
    user.lastQuizDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Math Quiz Reward (${user.quizCount}/10)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Brain Power! 🧠', `Correct answer! You earned ${reward} points from Math Quiz.`, 'earning');

    res.json({ 
      message: `Rewarded ${reward} points! (${user.quizCount}/10 quizzes completed)`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.quizCount,
      lastQuizDate: user.lastQuizDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.claimGkQuiz = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    if (user.lastGkQuizDate) {
      if (user.lastGkQuizDate.toDateString() === now.toDateString()) {
        return res.status(400).json({ message: "You already claimed your Daily GK reward today! Come back tomorrow." });
      }
    }

    const reward = 40;
    processPoints(user, reward);
    user.lastGkQuizDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Daily GK Quiz Reward`,
      status: 'completed'
    });

    createNotification(user._id, 'Knowledge is Power! 📚', `Correct! You earned ${reward} points from Daily GK Quiz.`, 'earning');

    res.json({ 
      message: `Rewarded ${reward} points! Daily GK Quiz completed!`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      lastGkQuizDate: user.lastGkQuizDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// ─── Withdrawal ───────────────────────────────────────────────────────────────
exports.submitWithdrawal = async (req, res) => {
  try {
    const { amount, phone, method } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const amt = parseFloat(amount);
    if (!amt || amt < 1000) return res.status(400).json({ message: 'Minimum withdrawal is 1000৳' });
    if (amt > user.balance) return res.status(400).json({ message: 'Insufficient balance' });
    if (!phone || phone.length < 10) return res.status(400).json({ message: 'Invalid phone number' });
    if (!method) return res.status(400).json({ message: 'Payment method required' });

    await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount: amt,
      description: `Withdrawal via ${method} to ${phone}`,
      status: 'pending',
    });

    // Notify user
    createNotification(user._id, 'Withdrawal Requested! 🏦', `Your request for ${amt}৳ via ${method} has been received and is under review.`, 'withdrawal');

    res.json({ message: 'Withdrawal request submitted! Admin will process within 24 hours.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// ─── Premium IP Order ─────────────────────────────────────────────────────────
exports.submitPremiumOrder = async (req, res) => {
  try {
    const PremiumOrder = require('../models/PremiumOrder');
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const { packageId, packageName, country, division, district, thana, village, postalCode, paymentMethod, transactionId, amount } = req.body;

    if (!packageId || !paymentMethod || !amount) {
      return res.status(400).json({ message: 'Package, payment method, and amount are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let finalTxId = transactionId;

    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
      if (!transactionId) return res.status(400).json({ message: 'Transaction ID is required for mobile banking' });
    } else if (paymentMethod === 'earning') {
       if (user.balance < Number(amount)) {
          return res.status(400).json({ message: 'Insufficient earning balance! Please earn more or use another method.' });
       }
       // Deduct immediately
       user.balance -= Number(amount);
       await user.save();
       
       await Transaction.create({
         userId: user._id,
         type: 'withdrawal', // generic type for deduction
         amount: Number(amount),
         description: `Store Purchase: ${packageName || packageId}`,
         status: 'completed'
       });
       
       finalTxId = 'EARNING_BALANCE';
    } else if (paymentMethod === 'cod') {
       finalTxId = 'CASH_ON_DELIVERY';
    } else {
       return res.status(400).json({ message: 'Invalid payment method' });
    }

    const order = await PremiumOrder.create({
      userId: req.user._id,
      packageId,
      packageName: packageName || packageId,
      country: country || '',
      division: division || '',
      district: district || '',
      thana: thana || '',
      village: village || '',
      postalCode: postalCode || '',
      paymentMethod,
      transactionId: finalTxId,
      amount: Number(amount),
      status: 'pending',
    });

    // Notify user
    let notifyMsg = `Your order for ${packageName || packageId} is pending. Activation/Delivery takes some time.`;
    if (paymentMethod === 'earning') notifyMsg = `Your order for ${packageName || packageId} is placed and ${amount}৳ was deducted from your wallet!`;
    
    createNotification(req.user._id, 'Order Submitted! 🚀', notifyMsg, 'premium');

    res.status(201).json({ message: 'Order submitted! Admin will process it soon.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.convertCoins = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.points < 1000) {
      return res.status(400).json({ message: 'Insufficient coins. You need at least 1000 coins to convert.' });
    }
    
    // Convert all possible multiples of 1000 coins
    const conversionCount = Math.floor(user.points / 1000);
    const convertedTk = conversionCount * 50;
    const usedCoins = conversionCount * 1000;
    
    user.balance = (user.balance || 0) + convertedTk;
    user.points -= usedCoins;
    
    await user.save();
    
    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: convertedTk,
      description: `Converted ${usedCoins} coins to ${convertedTk}৳`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Coins Converted! 💎', `Successfully converted ${usedCoins} coins to ${convertedTk}৳ balance.`, 'conversion');
    
    res.json({
      message: `Successfully converted ${usedCoins} coins to ${convertedTk}৳!`,
      balance: user.balance,
      points: user.points
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getGlobalSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    if (!settings) {
      settings = await GlobalSetting.create({ configKey: 'main_config' });
    }
    // Return only public fields
    res.json({
      premiumIpPrice: settings.premiumIpPrice,
      premiumIpDuration: settings.premiumIpDuration,
      bkashNumber: settings.bkashNumber,
      nagadNumber: settings.nagadNumber,
      rocketNumber: settings.rocketNumber,
      premiumIpPackages: settings.premiumIpPackages,
      promoBanner: settings.promoBanner,
      nativeAdsConfig: settings.nativeAdsConfig,
      fortuneWheelConfig: settings.fortuneWheelConfig
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await CartProduct.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Articles ────────────────────────────────────────────────────────────────
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ active: true }).sort({ createdAt: -1 });
    
    // Get user's daily count
    const user = await User.findById(req.user._id);
    const now = new Date();
    let currentCount = user.articleReadCount || 0;
    if (user.lastArticleReadDate) {
      if (user.lastArticleReadDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    res.json({ articles, dailyCount: currentCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimArticleReward = async (req, res) => {
  try {
    const { articleId } = req.body;
    const user = await User.findById(req.user._id);
    const article = await Article.findById(articleId);

    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Check if daily limit reached
    const now = new Date();
    let currentCount = user.articleReadCount || 0;
    if (user.lastArticleReadDate) {
      if (user.lastArticleReadDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 5) {
      return res.status(400).json({ message: 'Daily article reading limit reached. Try again tomorrow.' });
    }

    const reward = article.coins || 15;
    processPoints(user, reward);
    
    user.articleReadCount = currentCount + 1;
    user.lastArticleReadDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Read Article: ${article.title}`,
      status: 'completed'
    });

    createNotification(user._id, 'Knowledge Reward! 📚', `You earned ${reward} coins for reading "${article.title}"`, 'earning');

    res.json({
      message: `Rewarded ${reward} coins!`,
      balance: user.balance,
      points: user.points,
      count: user.articleReadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
