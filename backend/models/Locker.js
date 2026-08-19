const mongoose = require('mongoose');

const lockerSchema = new mongoose.Schema({
  lockerName: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Locker', lockerSchema);
