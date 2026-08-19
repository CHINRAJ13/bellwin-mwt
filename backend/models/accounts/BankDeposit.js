const mongoose = require('mongoose');

const bankDepositSchema = new mongoose.Schema({
  depositNo: { type: String, required: true },
  depositDate: { type: Date, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  depositAmount: { type: Number, required: true },
  depositSlipNo: { type: String },
  remarks: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankDeposit', bankDepositSchema);
