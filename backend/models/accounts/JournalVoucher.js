const mongoose = require('mongoose');

const journalVoucherSchema = new mongoose.Schema({
  journalNo: { type: String, required: true },
  date: { type: Date, required: true },
  debitLedger: { type: String, required: true },
  creditLedger: { type: String, required: true },
  amount: { type: Number, required: true },
  narration: { type: String },
  enteredBy: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('JournalVoucher', journalVoucherSchema);
