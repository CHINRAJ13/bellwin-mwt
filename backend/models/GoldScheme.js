const mongoose = require('mongoose');
const { Counter } = require('./Customer');

const goldSchemeSchema = new mongoose.Schema({
  schemeId: { type: String, unique: true, index: true },

  customerId: { type: String, required: true },
  customerName: { type: String },
  customerMobile: { type: String },
  customerBranch: { type: String },

  employeeId: { type: String },
  employeeName: { type: String },

  schemeName: { type: String, required: true },

  interestPercent: { type: Number, required: true },
  amount: { type: Number, required: true },

  gramRate: { type: Number, required: true },
  minimumGram: { type: Number, required: true },

  maturePeriod: { type: Number, required: true },
  interestRepaymentMonths: { type: Number },

  documentCharges: { type: Number, required: true },
  penaltyPercent: { type: Number, required: true },

  status: {
    type: String,
    default: "Active"
  }
}, { timestamps: true });

goldSchemeSchema.statics.getNextId = async function () {
    const counter = await Counter.findByIdAndUpdate(
        'goldSchemeId',
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return `LS${String(counter.seq).padStart(4, '0')}`;
};

goldSchemeSchema.pre('save', async function () {
    if (this.isNew && !this.schemeId) {
        this.schemeId = await this.constructor.getNextId();
    }
});

module.exports = mongoose.model('GoldScheme', goldSchemeSchema);
