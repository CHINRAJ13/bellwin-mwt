const mongoose = require('mongoose');
const Counter = require('./Counter');
const BranchSchema = new mongoose.Schema({
  branchCode: {
    type: String,
    required: true,
    unique: true
  },
  branchName: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },
  branchManager: {
    type: String
  },
  contactNumber: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String,
    required: true,
    uppercase: true
  },
  state: {
    type: String,
    uppercase: true
  },
  pinCode: {
    type: String
  },
  gstNumber: {
    type: String
  },
  openingDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true,
  collection: 'branches'
});

BranchSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'branchCode',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `BR${String(counter.seq).padStart(4, '0')}`;
};

BranchSchema.pre('validate', async function () {
  if (this.isNew && !this.branchCode) {
    this.branchCode = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('Branch', BranchSchema);
