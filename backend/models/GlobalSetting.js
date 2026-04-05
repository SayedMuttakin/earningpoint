const mongoose = require('mongoose');

const GlobalSettingSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
    default: 'main_config'
  },
  premiumIpPrice: {
    type: Number,
    required: true,
    default: 600
  },
  premiumIpDuration: {
    type: String,
    required: true,
    default: '30 Days'
  },
  bkashNumber: {
    type: String,
    required: true,
    default: '01700-000000'
  },
  nagadNumber: {
    type: String,
    required: true,
    default: '01700-000000'
  },
  rocketNumber: {
    type: String,
    required: true,
    default: '01700-000000'
  },
  premiumIpPackages: {
    type: [{
      id: String,
      price: Number,
      duration: String,
      freeDays: String,
      offTag: String
    }],
    default: [
      { id: '1-month', price: 600, duration: '1 Month', freeDays: '+7 Days free', offTag: '' },
      { id: '3-month', price: 1300, duration: '3 Month', freeDays: '+15 Days free', offTag: '' },
      { id: '6-month', price: 2200, duration: '6 Month', freeDays: '+1 Month free', offTag: '' },
      { id: '1-year', price: 4200, duration: '1 Year', freeDays: '+2 Month free', offTag: '15% OFF' }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSetting', GlobalSettingSchema);
