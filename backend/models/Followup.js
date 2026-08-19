const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobileNumber: { type: String },
  loanNumber: { type: String },
  dueAmount: { type: Number },
  dueDate: { type: Date },
  followupType: { type: String },
  nextCallDate: { type: Date },
  staffName: { type: String },
  remarks: { type: String },
  callStatus: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Followup', followupSchema);
