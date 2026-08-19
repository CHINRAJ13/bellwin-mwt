const mongoose = require('mongoose');
const Counter = require('./Counter');

const schemeAllocationSchema = new mongoose.Schema({
    allocationNo: {
        type: String,
        unique: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerId: {
        type: String,
        trim: true
    },
    schemeName: {
        type: String,
        required: true,
        trim: true
    },
    joinDate: {
        type: Date,
        required: true
    },
    installmentStartMonth: {
        type: String,
        required: true
    },
    nomineeName: {
        type: String,
        trim: true,
        default: ''
    },
    mobileNumber: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['Running', 'Closed'],
        default: 'Running'
    }
}, { timestamps: true });

schemeAllocationSchema.statics.getNextId = async function () {
    const counter = await Counter.findByIdAndUpdate(
        'allocationNo',
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return `SA-${String(counter.seq).padStart(4, '0')}`;
};

schemeAllocationSchema.pre('save', async function () {});

module.exports = mongoose.model('SchemeAllocation', schemeAllocationSchema);
