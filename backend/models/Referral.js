const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bonusAwarded: {
    type: Number,
    default: 0,
  },
  // 'pending' = referred but no VPN yet, 'completed' = VPN purchased, bonus given
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  // When the referred user purchased VPN (premium)
  vpnPurchasedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Referral', ReferralSchema);
