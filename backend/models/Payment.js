const mongoose = require('mongoose');
const { Counter } = require('./Customer'); // Ensure Counter logic is available

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true, index: true },
  loanId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  paymentType: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  principalAmount: { type: Number, default: 0 },
  interestAmount: { type: Number, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  paymentDate: { type: Date, required: true },
  paymentMode: { type: String, required: true },
  transactionRef: { type: String },
  collectedBy: { type: String },
  remarks: { type: String }
}, { timestamps: true });

// ── Static: generate next payment ID ───────────────────────────────────────
paymentSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
      'paymentId',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `EMI${String(counter.seq).padStart(6, '0')}`;
};

// ── Pre-save: ensure paymentId exists ───────────────────────────────────────
paymentSchema.pre('save', async function () {
  if (this.isNew && !this.paymentId) {
      this.paymentId = await this.constructor.getNextId();
  }
});

// ── Indexes for report performance ─────────────────────────────────────────
paymentSchema.index({ paymentDate: -1, paymentMode: 1 });
paymentSchema.index({ collectedBy: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
