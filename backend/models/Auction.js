const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  loanId: { type: String, required: true },
  loanObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  customerId: { type: String },
  customerName: { type: String },
  auctionDate: { type: Date, required: true },
  outstandingAmount: { type: Number },
  goldWeight: { type: Number },
  auctionStatus: { type: String, default: 'Auctioned' },
  auctionValue: { type: Number },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
