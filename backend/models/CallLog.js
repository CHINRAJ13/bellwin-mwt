const mongoose = require('mongoose');

// Auto-increment call log ID counter
const callCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const CallCounter = mongoose.model('CallCounter', callCounterSchema);

const callLogSchema = new mongoose.Schema({
    callId: { type: String, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    loanId: { type: String, trim: true },
    customerName: { type: String, trim: true },
    mobileNumber: { type: String, trim: true },
    callDate: { type: Date, required: true },
    callTime: { type: String, trim: true },
    callType: { type: String, trim: true },
    callStatus: { 
        type: String, 
        required: true,
        enum: ['Pending', 'Completed', 'No Response', 'Followup Required']
    },
    followupDate: { type: Date },
    remarks: { type: String, trim: true },
    employeeName: { type: String, trim: true },
}, { timestamps: true });

// Generate next call ID
callLogSchema.statics.getNextId = async function () {
    const counter = await CallCounter.findByIdAndUpdate(
        'callId',
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return `CALL${String(counter.seq).padStart(6, '0')}`;
};

// Pre-save hook to ensure callId exists
callLogSchema.pre('save', async function () {
    if (this.isNew && !this.callId) {
        this.callId = await this.constructor.getNextId();
    }
});

module.exports = {
    CallLog: mongoose.model('CallLog', callLogSchema),
    CallCounter
};
