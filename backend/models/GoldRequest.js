const mongoose = require('mongoose');
const Counter = require('./Counter');

const goldRequestSchema = new mongoose.Schema({
  requestNo: { type: String, required: true },
  date: { type: Date, default: Date.now },
  customerId: { type: String },
  customerName: { type: String },
  itemName: { type: String },
  goldType: { type: String },
  weight: { type: Number },
  purity: { type: String },
  quantity: { type: Number },
  reason: { type: String },
  requestedTo: { type: String },
  status: { type: String, default: 'Pending' },
  remarks: { type: String },
  requestedBy: { type: String }
}, { timestamps: true });

goldRequestSchema.pre('save', async function() {
  if (this.isNew || !this.requestNo) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'goldRequestId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.requestNo = `REQ${counter.seq.toString().padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('GoldRequest', goldRequestSchema);
