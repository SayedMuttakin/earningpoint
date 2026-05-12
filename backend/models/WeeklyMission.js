const mongoose = require('mongoose');

const weeklyMissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rewardCoins: {
    type: Number,
    required: true,
    default: 0
  },
  // 'refer' = Refer X friends mission, 'custom' = generic link/action mission
  missionType: {
    type: String,
    enum: ['refer', 'custom'],
    default: 'custom'
  },
  // For refer-type: how many referrals (with VPN) needed
  targetCount: {
    type: Number,
    default: 5
  },
  actionUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyMission', weeklyMissionSchema);
