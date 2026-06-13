const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  video: {
    type: String,
    default: null,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  authorName: {
    type: String,
    default: 'Zenivio',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public',
  },
  feeling: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  taggedFriends: [{
    type: String,
    default: [],
  }],
  bgGradient: {
    type: String,
    default: null,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Optimize query performance for loading posts and video reels instantly
PostSchema.index({ video: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
