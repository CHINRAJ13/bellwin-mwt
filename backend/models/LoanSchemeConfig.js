const mongoose = require('mongoose');
const Counter = require('./Counter');

const loanSchemeConfigSchema = new mongoose.Schema({
  schemeId: { type: String, required: true, unique: true },
  schemeCode: { type: String },
  schemeName: { type: String, required: true },
  interestRate: { type: Number, required: true },
  amountLimit: { type: Number, required: true },
  gramRate: { type: Number, required: false },
  minimumGram: { type: Number, required: false },
  maturePeriodMonths: { type: Number, required: true },
  interestRepaymentMonths: { type: Number, required: false },
  documentCharges: { type: Number, required: true },
  penalty: { type: Number, required: true },
  schemeType: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

  // Micro Finance Specific Fields
  mfiType: { type: String, enum: ['Individual Loan', 'Group Loan'], default: 'Individual Loan' },
  minLoanAmount: { type: Number, default: 0 },
  maxLoanAmount: { type: Number, default: 0 },
  loanAmountBasis: { type: String, enum: ['Per Member', 'Per Group'], default: 'Per Member' },
  interestCalculationMethod: { type: String, enum: ['Flat', 'Reducing Balance'], default: 'Flat' },
  penaltyType: { type: String, enum: ['Fixed Amount', 'Percentage'], default: 'Percentage' },
  penaltyValue: { type: Number, default: 0 },
  penaltyCalculation: { type: String, enum: ['Per Overdue Installment', 'Per Overdue Day'], default: 'Per Overdue Installment' },
  gracePeriodDays: { type: Number, default: 0 },
  tenureUnit: { type: String, enum: ['Days', 'Months'], default: 'Months' },
  minTenure: { type: Number, default: 1 },
  maxTenure: { type: Number, default: 12 },
  repaymentFrequency: { type: String, enum: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'], default: 'Monthly' },
  processingFeeType: { type: String, enum: ['Fixed Amount', 'Percentage'], default: 'Fixed Amount' },
  processingFeeValue: { type: Number, default: 0 },
  insuranceFee: { type: Number, default: 0 },
  documentationFee: { type: Number, default: 0 },
  minGroupMembers: { type: Number, default: 0 },
  maxGroupMembers: { type: Number, default: 0 }
}, { timestamps: true });

loanSchemeConfigSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'loanSchemeId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `LS${String(counter.seq).padStart(4, '0')}`;
};

loanSchemeConfigSchema.pre('save', async function () {
  if (this.isNew && !this.schemeId) {
    this.schemeId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('LoanSchemeConfig', loanSchemeConfigSchema);
