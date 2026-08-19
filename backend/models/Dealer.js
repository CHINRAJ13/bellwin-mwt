const mongoose = require('mongoose');
const Counter = require('./Counter');
const dealerSchema = new mongoose.Schema({
  dealerCode: { type: String, required: true, unique: true },
  dealerName: { type: String, required: true },
  phone: { type: String, required: true },
  showroom: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

dealerSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'dealerCode',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `DLR${String(counter.seq).padStart(4, '0')}`;
};

dealerSchema.pre('save', async function () {});

module.exports = mongoose.model('Dealer', dealerSchema);
