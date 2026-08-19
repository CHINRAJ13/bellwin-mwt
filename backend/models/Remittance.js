const mongoose = require('mongoose');
const Counter = require('./Counter');

const remittanceSchema = new mongoose.Schema({
  remittanceNo: { type: String, required: true },
  date: { type: Date, default: Date.now },
  remittanceType: { type: String, default: 'Cash Remittance' },
  amount: { type: Number },
  fromBranch: { type: String },
  toBranch: { type: String },
  requestedBy: { type: String },
  receivedBy: { type: String },
  paymentMode: { type: String },
  referenceNo: { type: String },
  transferReason: { type: String },
  remarks: { type: String },
  enteredBy: { type: String },
  status: { type: String, default: 'Pending' },
  // Gold Remittance Specific Fields
  ornamentType: { type: String },
  ornamentName: { type: String },
  purity: { type: String },
  quantity: { type: Number },
  grossWeight: { type: Number },
  stoneWeight: { type: Number },
  netWeight: { type: Number },
  goldRate: { type: Number },
  goldValue: { type: Number },
  goldCheckedBy: { type: String }
}, { timestamps: true });

remittanceSchema.pre('save', async function() {
  if (this.isNew || !this.remittanceNo || this.remittanceNo.startsWith('CASH-') || this.remittanceNo.startsWith('GOLD-')) {
    const isGold = this.remittanceType === 'Gold Remittance';
    const counterId = isGold ? 'goldRemittanceId' : 'cashRemittanceId';
    const prefix = isGold ? 'GOLD' : 'CASH';
    
    const counter = await Counter.findByIdAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.remittanceNo = `${prefix}${counter.seq.toString().padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Remittance', remittanceSchema);
