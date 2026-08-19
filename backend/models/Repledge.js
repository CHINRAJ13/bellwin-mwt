const mongoose = require('mongoose');
const { Counter } = require('./Customer');

const repledgeSchema = new mongoose.Schema({
  repledgeId:           { type: String, unique: true, index: true },
  loanId:               { type: String, required: true, index: true },
  customerId:           { type: String, required: true, index: true },
  customerName:         { type: String },
  oldStatus:            { type: String, required: true },
  newStatus:            { type: String, required: true },
  oldLoanAmount:        { type: Number },
  remainingLoanAmount:  { type: Number },
  additionalLoanAmount: { type: Number, default: 0 },
  newInterestRate:      { type: Number },
  newDueDate:           { type: Date },
  repledgeDate:         { type: Date, default: Date.now },
  changedBy:            { type: String },
  approvalStatus:       { type: String, default: 'Pending' },
  approvedBy:           { type: String },
  approvalDate:         { type: Date },
  reasonForChange:      { type: String },
  remarks:              { type: String }
}, { timestamps: true });

// ── Static: generate next repledge ID ─────────────────────────────────────────
repledgeSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'repledgeId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `RPE${String(counter.seq).padStart(4, '0')}`;
};

// ── Pre-save: ensure repledgeId exists ────────────────────────────────────────
repledgeSchema.pre('save', async function () {
  if (this.isNew && !this.repledgeId) {
    this.repledgeId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('Repledge', repledgeSchema);
