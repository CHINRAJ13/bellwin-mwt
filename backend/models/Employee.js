const mongoose = require('mongoose');
const Counter = require('./Counter');
const employeeSchema = new mongoose.Schema({
    // Generated ID e.g. BEL-0001
    employeeId: { type: String, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String },
    gender: { type: String },
    dob: { type: Date },
    age: { type: Number },
    mobile: { type: String },
    email: { type: String, required: true, unique: true },
    
    branch: { type: String },
    joiningDate: { type: Date, required: true },
    salary: { type: Number },
    
    address: { type: String },
    pincode: { type: String },
    
    panNo: { type: String },
    accountNo: { type: String },
    ifscCode: { type: String },
    aadharCardNo: { type: String },

    status: {
        type: String,
        default: 'Active'
    },

    // Login credentials
    username: { type: String },

    // Role assigned by Admin
    role: {
        type: String,
        default: 'Employee'
    },

    // Permission list assigned by Admin
    permissions: {
        type: [String],
        default: []
    },

    // Path to uploaded document (if using Multer)
    documentUrl: {
        type: String
    },
    
    // Base64 photo string from JSON payload
    photo: {
        type: String
    },
    // Signature URL / Base64 string
    signatureUrl: {
        type: String
    },

    // Promotion & Demotion History
    promotionHistory: [{
        role: String,
        salary: Number,
        reason: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]

}, { timestamps: true });

employeeSchema.statics.getNextId = async function () {
    const counter = await Counter.findByIdAndUpdate(
        'employeeId',
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return `EMP${String(counter.seq).padStart(4, '0')}`;
};

employeeSchema.pre('save', async function () {});

module.exports = mongoose.model('Employee', employeeSchema);