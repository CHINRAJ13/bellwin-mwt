const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyCode: { type: String },
  gstNumber: { type: String },
  panNumber: { type: String },
  address: { type: String },
  mobileNumber: { type: String },
  email: { type: String },
  financialYear: { type: String, default: '2023-2024' },
  currency: { type: String, default: 'INR' },
  defaultInterestRate: { type: Number },
  defaultGoldRate: { type: Number },
  loanSettings: { type: String, default: 'Standard' },
  notificationSettings: { type: String, default: 'Email & SMS' },
  securitySettings: { type: String, default: 'High' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, {
  timestamps: true,
  collection: 'companies'
});

module.exports = mongoose.model('Company', CompanySchema);
