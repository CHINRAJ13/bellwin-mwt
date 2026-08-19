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
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
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
