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
  actionUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyMission', weeklyMissionSchema);
