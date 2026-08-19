const mongoose = require('mongoose');

const receiveVoucherSchema = new mongoose.Schema({
  voucherNo: { type: String, required: true },
  receiptDate: { type: Date, required: true },
  receivedFrom: { type: String, required: true },
  ledger: { type: String, required: true },
  paymentMode: { type: String, default: 'Cash' },
  amount: { type: Number, required: true },
  referenceNumber: { type: String },
  remarks: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReceiveVoucher', receiveVoucherSchema);
