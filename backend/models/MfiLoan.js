const mongoose = require('mongoose');
const Counter = require('./Counter');

const mfiLoanSchema = new mongoose.Schema({
  applicationNo: { type: String, unique: true, index: true },
  applicationDate: { type: Date, default: Date.now },
  loanType: { type: String, enum: ['single', 'group'], required: true },
  
  // Single Person Details
  customerId: { type: String },
  customerName: { type: String },
  customerMobile: { type: String },
  customerAddress: { type: String },

  // Group Details
  groupId: { type: String },

  // Scheme & Loan Details
  schemeId: { type: String },
  loanAmountRequested: { type: Number, required: true },
  approvedLoanAmount: { type: Number },
  interestRate: { type: Number },
  loanTenure: { type: Number },
  emiAmount: { type: Number },
  processingFee: { type: Number },
  netDisbursementAmount: { type: Number },
  loanPurpose: { type: String },

  // Bank Details
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },

  // Status
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

  // Audit
  employee: { type: String }
}, { timestamps: true });

mfiLoanSchema.statics.getNextId = async function (type) {
  const prefix = type === 'group' ? 'MFI-G-' : 'MFI-S-';
  const counterId = `mfiLoanId_${type}`;
  const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `${prefix}${String(counter.seq).padStart(6, '0')}`;
};

mfiLoanSchema.pre('save', async function () {
  if (this.isNew && (!this.applicationNo || this.applicationNo.includes('MFI'))) {
      this.applicationNo = await this.constructor.getNextId(this.loanType);
  }
});

module.exports = mongoose.model('MfiLoan', mfiLoanSchema);
