const mongoose = require('mongoose');
const Counter = require('./Counter');

const repledgeRepaymentSchema = new mongoose.Schema({
  repaymentId: { type: String, unique: true, index: true },
  loanNumber: { type: String, required: true, index: true },
  borrowerName: { type: String, required: true },
  repaymentDate: { type: Date, required: true },
  principalAmount: { type: Number, required: true, default: 0 },
  interestAmount: { type: Number, required: true, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  remarks: { type: String }
}, { timestamps: true });

repledgeRepaymentSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'repledgeRepaymentId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `RR-${String(counter.seq).padStart(4, '0')}`;
};

repledgeRepaymentSchema.pre('save', async function () {
  if (this.isNew && !this.repaymentId) {
    this.repaymentId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('RepledgeRepayment', repledgeRepaymentSchema);
