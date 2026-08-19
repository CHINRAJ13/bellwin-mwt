const mongoose = require('mongoose');
const Counter = require('./Counter');

const chitMemberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, index: true },
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  memberNumber: { type: Number, required: true }, // e.g., 1 to totalMembers
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
  winnerStatus: { type: String, enum: ['None', 'Won'], default: 'None' },
  
  nominee: {
    name: { type: String },
    relation: { type: String },
    bloodRelative: { type: Boolean, default: false },
    mobile: { type: String },
    idProof: { type: String }
  },
  
  guarantors: [{
    name: { type: String },
    relation: { type: String },
    mobile: { type: String },
    occupation: { type: String },
    idProof: { type: String },
    bankStatement: { type: String },
    chequeDetails: { type: String }
  }],
  
  securityCheques: [{
    chequeNumber: { type: String },
    bankName: { type: String },
    accountHolder: { type: String },
    date: { type: Date },
    amount: { type: Number },
    image: { type: String },
    status: { type: String }
  }],
  
  bankStatement: {
    url: { type: String },
    uploadDate: { type: Date },
    verified: { type: Boolean, default: false }
  },
  
  eightyPercentCompleted: { type: Boolean, default: false }
}, { timestamps: true });

chitMemberSchema.pre('save', async function() {
  if (this.isNew && !this.memberId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'chitMemberId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this.memberId = `CHM${counter.seq.toString().padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('ChitMember', chitMemberSchema);
