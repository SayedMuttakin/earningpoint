const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    enum: ['post', 'earning', 'withdrawal', 'conversion', 'system', 'premium', 'announcement'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ── Indexes for fast query performance ────────────────────────────────────────
// Fetch latest notifications for a user
notificationSchema.index({ userId: 1, createdAt: -1 });
// Fast unread count query
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
