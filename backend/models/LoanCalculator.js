const mongoose = require('mongoose');

const loanCalculatorSchema = new mongoose.Schema({
  calculationType: { type: String, required: true },
  loanMode: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  term: { type: Number, required: true },
  roi: { type: Number, required: true },
  interestAmount: { type: Number, required: true },
  totalPayable: { type: Number, required: true },
  installmentAmount: { type: Number, required: true },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('LoanCalculator', loanCalculatorSchema);
