const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneOrEmail: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleAvatar: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  profilePic: {
    type: String,
    default: '',
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  lifetimePoints: {
    type: Number,
    default: 0,
  },
  lastDailyCheckin: {
    type: Date,
    default: null,
  },
  dailyCheckinCount: {
    type: Number,
    default: 0,
  },
  lastVideoAd: {
    type: Date,
    default: null,
  },
  videoAdCount: {
    type: Number,
    default: 0,
  },
  lastSpinDate: {
    type: Date,
    default: null,
  },
  spinCount: {
    type: Number,
    default: 0,
  },
  lastScratchDate: {
    type: Date,
    default: null,
  },
  scratchCount: {
    type: Number,
    default: 0,
  },
  lastQuizDate: {
    type: Date,
    default: null,
  },
  quizCount: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiry: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Auto-generate referral code before saving if not set
UserSchema.pre('save', function () {
  if (!this.referralCode) {
    this.referralCode = 'ZNV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});

module.exports = mongoose.model('User', UserSchema);
