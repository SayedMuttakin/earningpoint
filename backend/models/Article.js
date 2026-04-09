const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Store as a long string with \n for paragraphs
    required: true,
  },
  coins: {
    type: Number,
    default: 15,
  },
  readingTime: {
    type: Number,
    default: 60, // Default 60 seconds
  },
  author: {
    type: String,
    default: 'Admin',
  },
  category: {
    type: String,
    default: 'General',
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Article', articleSchema);
