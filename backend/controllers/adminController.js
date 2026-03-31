const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const SupportTicket = require('../models/SupportTicket');
const Verification = require('../models/Verification');
const PremiumOrder = require('../models/PremiumOrder');
const jwt = require('jsonwebtoken');
const { createNotification } = require('./notificationController');

// ─── Admin Login ──────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zenvio.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
  res.json({ token, email, role: 'admin' });
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBalanceAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);
    const totalTransactions = await Transaction.countDocuments();
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    const openTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const totalReferrals = await Referral.countDocuments();
    const pendingPremiumOrders = await PremiumOrder.countDocuments({ status: 'pending' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const premiumUsers = await User.countDocuments({ isPremium: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });

    const revenueAgg = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Last 7 days chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const users = await User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } });
      const txns = await Transaction.countDocuments({ createdAt: { $gte: date, $lt: nextDate } });
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users,
        transactions: txns,
      });
    }

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phoneOrEmail balance coins isBanned isPremium createdAt');

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name phoneOrEmail');

    res.json({
      totalUsers,
      totalBalance: totalBalanceAgg[0]?.total || 0,
      totalTransactions,
      pendingWithdrawals,
      openTickets,
      totalReferrals,
      pendingPremiumOrders,
      bannedUsers,
      premiumUsers,
      todayUsers,
      revenue: revenueAgg[0]?.total || 0,
      last7Days,
      recentUsers,
      recentTransactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 15, filter } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneOrEmail: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (filter === 'banned') query.isBanned = true;
    if (filter === 'premium') query.isPremium = true;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await Transaction.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(10);
    const referrals = await Referral.find({ referrerId: req.params.id })
      .populate('referredUserId', 'name phoneOrEmail')
      .limit(10);
    const verification = await Verification.findOne({ userId: req.params.id });
    const premiumOrders = await PremiumOrder.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(5);

    res.json({ user, transactions, referrals, verification, premiumOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { balance, coins, isBanned, isPremium, premiumExpiry, name, note } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldBalance = user.balance;
    if (balance !== undefined) user.balance = Number(balance);
    if (coins !== undefined) user.coins = Number(coins);
    if (isBanned !== undefined) user.isBanned = isBanned;
    if (isPremium !== undefined) user.isPremium = isPremium;
    if (premiumExpiry !== undefined) user.premiumExpiry = premiumExpiry;
    if (name !== undefined) user.name = name;

    await user.save();

    if (balance !== undefined && Number(balance) !== oldBalance) {
      const diff = Number(balance) - oldBalance;
      await Transaction.create({
        userId: user._id,
        type: 'earning',
        amount: Math.abs(diff),
        description: note || `Admin balance adjustment (${diff > 0 ? '+' : ''}${diff}৳)`,
        status: 'completed',
      });

      // Notify user about balance adjustment
      createNotification(
        user._id,
        `Balance Updated! 💰`,
        `Your account balance has been updated to ${balance}৳.`,
        'system'
      );
    }

    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Transactions ─────────────────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('userId', 'name phoneOrEmail');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const oldStatus = transaction.status;
    transaction.status = status;
    await transaction.save();

    // If withdrawal approved and wasn't already, deduct balance
    if (transaction.type === 'withdrawal' && status === 'completed' && oldStatus === 'pending') {
      await User.findByIdAndUpdate(transaction.userId._id, { $inc: { balance: -transaction.amount } });
    }

    // Notify user about transaction status update
    createNotification(
      transaction.userId._id, 
      `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}! 💸`, 
      `Your ${transaction.type} request of ${transaction.amount}৳ has been ${status}.`,
      transaction.type === 'withdrawal' ? 'withdrawal' : 'system'
    );

    res.json({ message: 'Transaction updated', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Support Tickets ──────────────────────────────────────────────────────────
exports.getSupportTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('userId', 'name phoneOrEmail');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { message, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (message && message.trim()) {
      ticket.replies.push({ message: message.trim(), isAdmin: true });
    }
    if (status) ticket.status = status;

    await ticket.save();
    await ticket.populate('userId', 'name phoneOrEmail');

    res.json({ message: 'Ticket updated', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Referrals ────────────────────────────────────────────────────────────────
exports.getReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const total = await Referral.countDocuments();
    const referrals = await Referral.find()
      .populate('referrerId', 'name phoneOrEmail')
      .populate('referredUserId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalBonus = await Referral.aggregate([{ $group: { _id: null, total: { $sum: '$bonusAwarded' } } }]);

    res.json({ referrals, total, totalBonus: totalBonus[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Premium Orders ───────────────────────────────────────────────────────────
exports.getPremiumOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await PremiumOrder.countDocuments(query);
    const orders = await PremiumOrder.find(query)
      .populate('userId', 'name phoneOrEmail isPremium premiumExpiry')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePremiumOrder = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const order = await PremiumOrder.findById(req.params.id).populate('userId');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    await order.save();

    if (status === 'approved') {
      const packageDays = { 'month-1': 37, 'month-3': 105, 'month-6': 210, 'year-1': 424 };
      const days = packageDays[order.packageId] || 30;
      const premiumExpiry = new Date();
      premiumExpiry.setDate(premiumExpiry.getDate() + days);
      premiumExpiry.setDate(premiumExpiry.getDate() + days);
      await User.findByIdAndUpdate(order.userId._id, { isPremium: true, premiumExpiry });

      // Notify user about approval
      createNotification(
        order.userId._id, 
        'Premium Account Activated! ✨', 
        `Your order for ${order.packageName} has been approved! Enjoy premium features until ${premiumExpiry.toLocaleDateString()}.`,
        'premium'
      );
    } else if (status === 'rejected') {
      // Notify user about rejection
      createNotification(
        order.userId._id, 
        'Order Rejected ❌', 
        `Your premium order for ${order.packageName} was rejected. Please contact support for details.`,
        'premium'
      );
    }

    const updated = await PremiumOrder.findById(req.params.id).populate('userId', 'name phoneOrEmail isPremium premiumExpiry');
    res.json({ message: 'Order updated', order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Verifications (Email status only) ───────────────────────────────────────
exports.getVerifications = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await Verification.countDocuments(query);
    const verifications = await Verification.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ verifications, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
