const mongoose = require('mongoose');
const Counter = require('./Counter');

const chitGroupSchema = new mongoose.Schema({
  groupId: { type: String, unique: true, index: true },
  groupName: { type: String, required: true, trim: true },
  chitValue: { type: Number, required: true },
  duration: { type: Number, required: true, enum: [10, 15, 20] },
  totalMembers: { type: Number, required: true },
  monthlyContribution: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  branch: { type: String, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  commissionPercentage: { type: Number, default: 4 },
  joiningFee: { type: Number, default: 100 },
  documentMaintenanceFeePerLakh: { type: Number, default: 500 },
  chitMethod: { type: String, enum: ['Draw', 'Auction'], required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Cancelled'], default: 'Draft' }
}, { timestamps: true });

chitGroupSchema.pre('save', async function() {
  if (this.isNew && !this.groupId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'chitGroupId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.groupId = `CHG${counter.seq.toString().padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('ChitGroup', chitGroupSchema);
