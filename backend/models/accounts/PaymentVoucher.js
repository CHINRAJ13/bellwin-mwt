const mongoose = require('mongoose');

const paymentVoucherSchema = new mongoose.Schema({
  voucherNo: { type: String, required: true },
  voucherDate: { type: Date, required: true },
  paidTo: { type: String, required: true },
  ledger: { type: String, required: true },
  paymentMode: { type: String, default: 'Cash' },
  amount: { type: Number, required: true },
  referenceNo: { type: String },
  remarks: { type: String },
  approvedBy: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentVoucher', paymentVoucherSchema);
