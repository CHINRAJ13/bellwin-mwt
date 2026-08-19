const mongoose = require('mongoose');
const Counter = require('../Counter');

const ledgerSchema = new mongoose.Schema({
  ledgerCode: { type: String, unique: true, index: true },
  ledgerName: { type: String, required: true },
  accountGroup: { type: String, required: true },
  openingBalance: { type: Number, default: 0 },
  balanceType: { type: String, enum: ['Debit', 'Credit'], default: 'Debit' },
  currentBalance: { type: Number, default: 0 },
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  branch: { type: String },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

ledgerSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
      'ledgerId',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `LED${String(counter.seq).padStart(4, '0')}`;
};

ledgerSchema.pre('save', async function () {
  if (this.isNew && !this.ledgerCode) {
      this.ledgerCode = await this.constructor.getNextId();
  }
  if (this.isNew) {
      this.currentBalance = this.openingBalance;
  }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
