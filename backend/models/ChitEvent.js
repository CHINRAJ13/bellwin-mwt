const mongoose = require('mongoose');
const Counter = require('./Counter');

const chitEventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true, index: true },
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true, index: true },
  chitMonth: { type: Number, required: true },
  eventDate: { type: Date, required: true },
  poolAmount: { type: Number, required: true },
  method: { type: String, enum: ['Draw', 'Auction'], required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitMember', required: true },
  winningDiscount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Finalized'], default: 'Finalized' }
}, { timestamps: true });

chitEventSchema.pre('save', async function() {
  if (this.isNew && !this.eventId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'chitEventId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.eventId = `CHE${counter.seq.toString().padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('ChitEvent', chitEventSchema);
