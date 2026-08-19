const mongoose = require('mongoose');
const Counter = require('./Counter');

const loanRequestSchema = new mongoose.Schema({
  requestNo: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  mobileNo: { type: String },
  loanType: { type: String, required: true }, // Gold Loan, Personal Loan, Chit Fund, Micro Finance, Vehicle Loan
  requestedAmount: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  remarks: { type: String },
  requestedBy: { type: String }
}, { timestamps: true });

loanRequestSchema.pre('save', async function() {
  if (this.isNew || !this.requestNo) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'loanRequestId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.requestNo = `LREQ${counter.seq.toString().padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('LoanRequest', loanRequestSchema);
