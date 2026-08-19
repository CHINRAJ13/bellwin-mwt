const mongoose = require('mongoose');
const Counter = require('./Counter'); // Import Counter for ID generation

const loanSchema = new mongoose.Schema({
  loanId: { type: String, unique: true, index: true },
  customerId: { type: String, index: true },
  customerObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  
  // Gold Scheme Integration Fields
  schemeId: { type: String },
  schemeName: { type: String },
  employeeId: { type: String },
  employeeName: { type: String },
  branch: { type: String },
  loanType: { type: String },
  interestPercent: { type: Number },
  gramRate: { type: Number },
  minimumGram: { type: Number },
  maturePeriod: { type: Number },
  interestRepaymentMonths: { type: Number },
  documentCharges: { type: Number },
  penaltyPercent: { type: Number },

  name: { type: String, required: true },
  mobileNo: { type: String },
  fatherHusbandName: { type: String },
  address: { type: String },
  loanDate: { type: Date },
  loanStartDate: { type: Date, required: true },
  loanEndDate: { type: Date },
  loanAmount: { type: Number },
  remainingLoanAmount: { type: Number },
  status: { type: String, enum: ['Approved', 'Pending', 'Closed', 'Active', 'Overdue', 'Repledged', 'Auction Ready', 'Auctioned', 'TopUp'], default: 'Pending', index: true },
  
  // Calculations
  totalNoOfDays: { type: Number },
  interestRate: { type: Number },
  additionalInterestRate: { type: Number },
  totalPaidInterestAmount: { type: Number },
  totalInterestPaidDays: { type: Number },
  remainingDays: { type: Number },
  remainingInterestAmount: { type: Number },
  documentCharge: { type: Number },
  fullSettlementAmount: { type: Number },

  // Receipt Entry State
  receiptEntry: {
    enterDays: { type: Number },
    receiptDate: { type: Date },
    receiptAmount: { type: Number },
    penalty: { type: Boolean }
  },

  // Articles
  articles: [{
    category: { type: String },
    details: { type: String },
    qty: { type: Number },
    totWt: { type: Number },
    stoneWt: { type: Number },
    nettWt: { type: Number },
    purity: { type: String },
    gramRate: { type: Number },
    total: { type: Number }
  }],
  totalWt: { type: Number },
  jewelImage: { type: String }, // Stored as base64 string

  // Payments
  payments: [{
    receiptNo: { type: String },
    paidDate: { type: Date },
    amount: { type: Number },
    interestAmount: { type: Number },
    principalAmount: { type: Number },
    penalty: { type: Number },
    penaltyPending: { type: Number }
  }],

  // Repledge State
  repledgeDetails: {
    bankOrganisationName: { type: String },
    loanNo: { type: String },
    date: { type: Date },
    interestRate: { type: Number },
    repledgeAmount: { type: Number },
    documentCharge: { type: Number },
    matureDate: { type: Date },
    accountHolderName: { type: String },
    anotherAglAccount: { type: String },
    imageUrl: { type: String }
  },

  // Top Up Document Update
  topUpCount: { type: Number, default: 0 },
  topUpTotal: { type: Number, default: 0 },
  lastTopUpDate: { type: Date }
}, { timestamps: true });

// ── Static: generate next loan ID ───────────────────────────────────────
loanSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
      'loanId',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `LN${String(counter.seq).padStart(6, '0')}`;
};

loanSchema.statics.getNextIdPreview = async function () {
  const counter = await Counter.findById('loanId');
  const nextSeq = counter ? counter.seq + 1 : 1;
  return `LN${String(nextSeq).padStart(6, '0')}`;
};

// ── Pre-save: ensure loanId exists ───────────────────────────────────────
loanSchema.pre('save', async function () {
  if (this.isNew && !this.loanId) {
      this.loanId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('Loan', loanSchema);
