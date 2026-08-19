const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  incomeId: { type: String, unique: true, index: true, required: true },
  incomeDate: { type: Date, required: true },
  incomeCategory: { type: String, required: true },
  incomeSubCategory: { type: String },
  amount: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  receivedFrom: { type: String, required: true },
  description: { type: String },
  receiptNo: { type: String },
  referenceNoTransactionId: { type: String },
  receivedBy: { type: String },
  approvedBy: { type: String },
  billReceiptUpload: { type: String },
  gstIncluded: { type: Boolean, default: false },
  taxAmount: { type: Number },
  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
