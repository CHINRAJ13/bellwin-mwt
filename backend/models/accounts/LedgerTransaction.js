const mongoose = require('mongoose');
const Counter = require('../Counter');

const ledgerTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, index: true },
  ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true, index: true },
  voucherNumber: { type: String, required: true, index: true },
  voucherType: { 
    type: String, 
    enum: ['Payment', 'Receive', 'Contra', 'Journal', 'Loan', 'TopUp'], 
    required: true 
  },
  referenceModule: { type: String, required: true }, // e.g., 'Loan', 'Payment', 'Remittance', 'Expense'
  referenceId: { type: String, required: true }, // e.g., LN000001, PV000001
  
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  
  remarks: { type: String },
  transactionDate: { type: Date, default: Date.now, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Audit properties
  ipAddress: { type: String },
  browser: { type: String }
}, { timestamps: true });

ledgerTransactionSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
      'ledgerTransactionId',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `LTX${String(counter.seq).padStart(8, '0')}`;
};

ledgerTransactionSchema.pre('save', async function () {
  if (this.isNew && !this.transactionId) {
      this.transactionId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('LedgerTransaction', ledgerTransactionSchema);
