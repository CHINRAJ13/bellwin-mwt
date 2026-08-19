const mongoose = require('mongoose');

const repledgeSchemeSchema = new mongoose.Schema({
  schemeName: { type: String, required: true },
  schemeCode: { type: String, required: true, unique: true },
  interestRate: { type: Number, required: true },
  maxLoanPercentage: { type: Number, required: true },
  loanTenure: { type: Number, required: true },
  processingFee: { type: Number, default: 0 },
  penaltyPercentage: { type: Number, default: 0 },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('RepledgeScheme', repledgeSchemeSchema);
