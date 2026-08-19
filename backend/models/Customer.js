const mongoose = require('mongoose');
const Counter = require('./Counter');

// ── Audit event sub-document ──────────────────────────────────────────────────
const auditEventSchema = new mongoose.Schema({
    action:      { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role:        { type: String },
    note:        { type: String, default: '' },
    timestamp:   { type: Date, default: Date.now },
}, { _id: false });

// ── Main Customer schema ──────────────────────────────────────────────────────
const customerSchema = new mongoose.Schema({

    // Generated ID e.g. BWC-0001
    customerId: { type: String, unique: true, index: true },

    // Branch snapshot at the time of creation
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branchName: { type: String, trim: true, default: '' },

    // Personal
    customerName:  { type: String, required: true, trim: true },
    guardianName:  { type: String, required: true, trim: true },
    dateOfBirth:   { type: Date },
    age:           { type: Number, required: true, min: 1, max: 120 },
    gender:        { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },

    // Contact
    mobileNumber:    { type: String, required: true, trim: true, index: true },
    alternateNumber: { type: String, trim: true, default: '' },
    email:           { type: String, trim: true, default: '' },

    // Identity
    aadhaarNumber: { type: String, trim: true, default: '' },
    panNumber:     { type: String, trim: true, default: '' },
    voterId:       { type: String, trim: true, default: '' },

    // Address
    doorStreet:        { type: String, required: true, trim: true },
    area:              { type: String, required: true, trim: true },
    city:              { type: String, trim: true, default: '' },
    district:          { type: String, trim: true, default: '' },
    state:             { type: String, trim: true, default: '' },
    postalCode:        { type: String, trim: true, default: '' },
    permanentAddress:  { type: String, trim: true, default: '' },
    temporaryAddress:  { type: String, trim: true, default: '' },

    // Professional
    occupation: { type: String, trim: true, default: '' },
    remarks:    { type: String, trim: true, default: '' },

    // Nominee
    nominee: {
        nomineeName: { type: String, trim: true, default: '' },
        nomineeRelationship: { type: String, trim: true, default: '' },
        nomineeAge: { type: Number },
        nomineeAddress: { type: String, trim: true, default: '' }
    },

    // Documents — Cloudinary
    customerPhotoUrl:       { type: String, default: '' },
    customerPhotoPublicId:  { type: String, default: '' },
    aadhaarDocumentUrl:     { type: String, default: '' },
    aadhaarDocumentPublicId:{ type: String, default: '' },
    panDocumentUrl:         { type: String, default: '' },
    panDocumentPublicId:    { type: String, default: '' },
    passbookDocumentUrl:    { type: String, default: '' },
    passbookDocumentPublicId:{ type: String, default: '' },
    proof2Name:             { type: String, trim: true, default: '' },
    proof2Number:           { type: String, trim: true, default: '' },
    proof2DocumentUrl:      { type: String, default: '' },
    proof2DocumentPublicId: { type: String, default: '' },

    // Status workflow
    status: {
        type: String,
        enum: [
            'Customer Approval Pending',
            'KYC Verification Pending',
            'KYC Verified',
            'Correction Required',
            'Approved',
            'Rejected',
            'Blocked'
        ],
        default: 'Customer Approval Pending',
    },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
    blockDate: { type: Date },
    unblockDate: { type: Date },
    rejectionReason: { type: String, default: '' },

    // New Approval Workflow (Requirement 3)
    approvalStatus: {
        type: String,
        enum: [
            'Pending',
            'Approved',
            'Rejected',
            'CUSTOMER_CREATED',
            'LOAN_APPLIED',
            'KYC_VERIFICATION',
            'APPROVAL_PENDING',
            'APPROVED',
            'REJECTED'
        ],
        default: 'Pending',
        index: true
    },
    approvedBy: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    approvedDate: { type: Date, default: null },
    rejectedDate: { type: Date, default: null },
    adminRemarks: { type: String, trim: true, default: '' },
    approvalIpAddress: { type: String, default: '' },
    approvalUserAgent: { type: String, default: '' },
    workflowHistory: [
        {
            action: { type: String, required: true },
            performedBy: {
                id: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
                employeeId: { type: String },
                name: { type: String },
                role: { type: String }
            },
            date: { type: Date, default: Date.now },
            remarks: { type: String, default: '' }
        }
    ],

    // Loan details for tracking (Requirement 2)
    loanDetails: {
        applicationNumber: { type: String, default: '' },
        loanAmount:        { type: Number, default: 0 },
        loanType:          { type: String, default: '' },
        appliedDate:       { type: Date },
        approvalDate:      { type: Date },
    },

    // Relations
    employeeId: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    createdBy:  { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    updatedBy:  { type: mongoose.Schema.Types.Mixed, ref: 'User' },

    // Soft delete
    isDeleted:    { type: Boolean, default: false },
    deletedBy:    { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    deletedAt:    { type: Date },
    deleteReason: { type: String, trim: true, default: '' },

    // Audit trail
    auditLog: [auditEventSchema],

}, { timestamps: true });

// ── Indexes for fast search ───────────────────────────────────────────────────
// Note: customerId already has a unique index from schema definition — no duplicate needed
// customerSchema.index({ mobileNumber: 1 }); // Removed duplicate index
customerSchema.index({ customerName: 'text', mobileNumber: 'text', aadhaarNumber: 'text' });
customerSchema.index({ status: 1, isDeleted: 1 });
customerSchema.index({ createdBy: 1 });

// ── Static: generate next customer ID ───────────────────────────────────────
customerSchema.statics.getNextId = async function () {
    const counter = await Counter.findByIdAndUpdate(
        'customerId',
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return `BOR${String(counter.seq).padStart(4, '0')}`;
};

// ── Pre-save: ensure customerId exists ───────────────────────────────────────
customerSchema.pre('save', async function () {
    if (this.isNew && !this.customerId) {
        this.customerId = await this.constructor.getNextId();
    }
});

module.exports = { 
    Customer: mongoose.model('Customer', customerSchema)
};
