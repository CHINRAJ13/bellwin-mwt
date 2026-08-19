const mongoose = require('mongoose');
const Counter = require('./Counter');

const chitContributionSchema = new mongoose.Schema({
  contributionId: { type: String, unique: true, index: true },
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true, index: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitMember', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  chitMonth: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  expectedAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, required: true },
  paymentDate: { type: Date },
  paymentMode: { type: String },
  referenceNumber: { type: String },
  transactionReference: { type: String, unique: true, sparse: true }, // For idempotency
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Overdue'], default: 'Pending' }
}, { timestamps: true });

chitContributionSchema.pre('save', async function() {
  if (this.isNew && !this.contributionId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'chitContributionId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.contributionId = `CHC${counter.seq.toString().padStart(8, '0')}`;
  }
});

module.exports = mongoose.model('ChitContribution', chitContributionSchema);
