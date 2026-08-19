const mongoose = require('mongoose');
const Counter = require('./Counter');

const topupSchema = new mongoose.Schema({
  topUpId: { type: String, unique: true, index: true },
  loanId: { type: String, required: true, index: true },
  customerId: { type: String },
  customerName: { type: String },
  employeeId: { type: String },
  branchId: { type: String },
  
  // Amounts and Eligibility
  oldLoanAmount: { type: Number, required: true },
  eligibleLoanAmount: { type: Number, required: true },
  availableEligibility: { type: Number, required: true },
  topUpAmount: { type: Number, required: true },
  newLoanAmount: { type: Number, required: true },
  goldRate: { type: Number, required: true },
  
  // Details
  purpose: { type: String, enum: ['Business', 'Medical', 'Education', 'Agriculture', 'Emergency', 'Personal', 'Others'] },
  remarks: { type: String }, // Employee Notes
  adminRemarks: { type: String }, // Admin Remarks on approval/rejection

  // Status and Tracking
  status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Send Back'], default: 'Pending Approval', index: true },
  createdBy: { type: String },
  approvedBy: { type: String },
  approvedDate: { type: Date }

}, { timestamps: true });

// ── Static: generate next topup ID ───────────────────────────────────────
topupSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
      'topUpId',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `TOPUP${String(counter.seq).padStart(6, '0')}`;
};

// ── Pre-save: ensure topupId exists ───────────────────────────────────────
topupSchema.pre('save', async function () {
  if (this.isNew && !this.topUpId) {
      this.topUpId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('TopUp', topupSchema);
