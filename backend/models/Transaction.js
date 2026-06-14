const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['earning', 'purchase', 'referral_bonus', 'withdrawal'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed',
  },
}, { timestamps: true });

// ── Indexes for fast query performance ────────────────────────────────────────
// Most common query: find by userId sorted by date (transaction history page)
TransactionSchema.index({ userId: 1, createdAt: -1 });
// Filter by userId + type (e.g. withdrawal queries)
TransactionSchema.index({ userId: 1, type: 1 });
// For leaderboard aggregate lookup on 'completed' transactions
TransactionSchema.index({ userId: 1, status: 1, amount: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
