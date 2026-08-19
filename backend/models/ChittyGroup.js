const mongoose = require('mongoose');

const chittyGroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    groupCode: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    customerId: {
        type: String,
        trim: true
    },
    customerName: {
        type: String,
        trim: true
    },
    mobileNumber: {
        type: String,
        trim: true
    },
    nomineeName: {
        type: String,
        trim: true
    },
    schemeName: {
        type: String,
        required: true,
        trim: true
    },
    totalMembers: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    auctionDay: {
        type: Number,
        min: 1,
        max: 31
    },
    groupStatus: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('ChittyGroup', chittyGroupSchema);
