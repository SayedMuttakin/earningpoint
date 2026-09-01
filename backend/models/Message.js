const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'voice'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  replyTo: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    content: String,
    senderName: String,
    messageType: {
      type: String,
      default: 'text'
    }
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isUnsent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
