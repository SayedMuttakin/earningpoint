const mongoose = require('mongoose');

const PremiumOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  packageId: {
    type: String,
    required: true,
  },
  packageName: { type: String, default: '' },
  country: { type: String, default: '' },
  division: { type: String, default: '' },
  district: { type: String, default: '' },
  thana: { type: String, default: '' },
  village: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'earning', 'cod'],
    required: true,
  },
  transactionId: { type: String, default: '' },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PremiumOrder', PremiumOrderSchema);
