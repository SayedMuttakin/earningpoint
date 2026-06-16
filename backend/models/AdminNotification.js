const mongoose = require('mongoose');

const AdminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['support', 'verification', 'withdrawal', 'premium', 'other'],
    default: 'other'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  referenceId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AdminNotificationSchema.index({ createdAt: -1 });
AdminNotificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema);
