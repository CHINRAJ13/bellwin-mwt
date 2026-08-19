const mongoose = require('mongoose');
const { Counter } = require('./Customer');

const loanClosureSchema = new mongoose.Schema({
  closureId: { type: String, unique: true, index: true },
  loanId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  branch: { type: String },
  employeeId: { type: String },
  employeeName: { type: String },
  closureType: { type: String, enum: ['Normal Closure', 'Early Closure', 'Settlement'], required: true },
  closureRemarks: { type: String },
  closedBy: { type: String, required: true },
  closureDate: { type: Date, default: Date.now, required: true }
}, { timestamps: true });

// Auto-increment closureId (LCLSXXXXXX)
loanClosureSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'closureId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `LCLS${String(counter.seq).padStart(6, '0')}`;
};

// Pre-save hook to ensure closureId exists
loanClosureSchema.pre('save', async function () {
  if (this.isNew && !this.closureId) {
    this.closureId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('LoanClosure', loanClosureSchema);
