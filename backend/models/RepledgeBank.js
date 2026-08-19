const mongoose = require('mongoose');
const Counter = require('./Counter');

const repledgeBankSchema = new mongoose.Schema({
  bankId: { type: String, unique: true, index: true },
  bankName: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String },
  openingBalance: { type: Number, default: 0 },
  openingDate: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

repledgeBankSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'repledgeBankId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `RPB${String(counter.seq).padStart(4, '0')}`;
};

repledgeBankSchema.pre('save', async function () {
  if (this.isNew && !this.bankId) {
    this.bankId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('RepledgeBank', repledgeBankSchema);
