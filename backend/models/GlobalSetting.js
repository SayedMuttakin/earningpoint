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
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSetting', GlobalSettingSchema);
