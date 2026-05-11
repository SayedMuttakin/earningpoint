const mongoose = require('mongoose');

const missionCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeeklyMission',
    required: true
  }
}, { timestamps: true });

// Ensure a user can only complete a specific mission once
missionCompletionSchema.index({ userId: 1, missionId: 1 }, { unique: true });

module.exports = mongoose.model('MissionCompletion', missionCompletionSchema);
