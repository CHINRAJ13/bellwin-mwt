const mongoose = require('mongoose');

const puritySchema = new mongoose.Schema({
  purityCode: { type: String, required: true, unique: true },
  purityName: { type: String, required: true },
  maxLoanPerGram: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Purity', puritySchema);
