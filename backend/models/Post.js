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
  authorName: {
    type: String,
    default: 'Zenivio',
  },
  isVerified: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
