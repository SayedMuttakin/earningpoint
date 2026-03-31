const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  country: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    enum: ['nid', 'passport'],
    required: true,
  },
  frontImage: {
    type: String,
    default: '',
  },
  backImage: {
    type: String,
    default: '',
  },
  selfieImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewNote: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Verification', VerificationSchema);
