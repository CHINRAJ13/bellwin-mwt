const mongoose = require('mongoose');

const bankWithdrawalSchema = new mongoose.Schema({
  withdrawalNo: { type: String, required: true },
  withdrawalDate: { type: Date, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  chequeNumber: { type: String },
  remarks: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankWithdrawal', bankWithdrawalSchema);
