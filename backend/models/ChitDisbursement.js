const mongoose = require('mongoose');
const Counter = require('./Counter');

const chitDisbursementSchema = new mongoose.Schema({
  payoutId: { type: String, unique: true, index: true },
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true, index: true },
  chitEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitEvent', required: true, index: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitMember', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  chitValue: { type: Number, required: true },
  auctionDiscount: { type: Number, default: 0 },
  grossPrizeAmount: { type: Number, required: true },
  
  applicableCommission: { type: Number, required: true },
  applicableDocumentFee: { type: Number, required: true },
  otherCharges: { type: Number, default: 0 },
  
  netPayout: { type: Number, required: true },
  
  paymentMode: { type: String, required: true },
  paymentReference: { type: String, unique: true, sparse: true }, // For idempotency
  
  disbursementDate: { type: Date, required: true },
  disbursedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Approved', 'Paid', 'Reversed'], default: 'Pending' }
}, { timestamps: true });

chitDisbursementSchema.pre('save', async function() {
  if (this.isNew && !this.payoutId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'chitDisbursementId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.payoutId = `CHD${counter.seq.toString().padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('ChitDisbursement', chitDisbursementSchema);
