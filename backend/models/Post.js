const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  authorName: {
    type: String,
    default: 'Zenvio',
  },
  isVerified: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
