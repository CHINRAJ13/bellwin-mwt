const mongoose = require('mongoose');

const contraVoucherSchema = new mongoose.Schema({
  contraNo: { type: String, required: true },
  date: { type: Date, required: true },
  fromAccount: { type: String, required: true },
  toAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  transferType: { type: String, default: 'Cash to Bank' },
  remarks: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContraVoucher', contraVoucherSchema);
