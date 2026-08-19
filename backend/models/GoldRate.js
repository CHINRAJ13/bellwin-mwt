const mongoose = require('mongoose');

const goldRateSchema = new mongoose.Schema({
  itemType: { type: String, required: true },
  purity: { type: String, required: true },
  rate: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('GoldRate', goldRateSchema);
