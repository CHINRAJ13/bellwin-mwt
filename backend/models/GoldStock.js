const mongoose = require('mongoose');
const Counter = require('./Counter'); // Ensure Counter is reused

const goldStockSchema = new mongoose.Schema({
  stockId: { type: String, unique: true, index: true },
  loanId: { type: String, required: true, index: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  articleName: { type: String, required: true },
  articleType: { type: String, required: true },
  quantity: { type: Number, required: true },
  grossWeight: { type: Number, required: true },
  netWeight: { type: Number, required: true },
  purity: { type: String, required: true },
  appraisedValue: { type: Number, required: true },
  status: { type: String, default: 'In Stock' },
  stockDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-increment stockId (GSTKXXXXXX)
goldStockSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'stockId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `GSTK${String(counter.seq).padStart(6, '0')}`;
};

// Pre-save hook to ensure stockId exists
goldStockSchema.pre('save', async function () {
  if (this.isNew && !this.stockId) {
    this.stockId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('GoldStock', goldStockSchema);
