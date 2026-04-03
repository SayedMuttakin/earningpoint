const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Might be null if guest, though in this app users are logged in
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  messages: [{
    sender: {
      type: String, // 'user' or 'admin'
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  adminJoined: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
