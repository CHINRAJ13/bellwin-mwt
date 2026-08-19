const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: String,  // e.g. "2025-06"
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  allowances: {
    hra: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  totalAllowances: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  workingDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Draft', 'Generated', 'Paid'],
    default: 'Draft'
  },
  paidOn: { type: Date, default: null },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  remarks: { type: String, default: '' }
}, {
  timestamps: true,
  collection: 'salaries'
});

// Prevent duplicate salary record for same employee for same month
SalarySchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Salary', SalarySchema);
