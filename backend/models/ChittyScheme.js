const mongoose = require('mongoose');

const chittySchemeSchema = new mongoose.Schema({
    schemeCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    schemeName: {
        type: String,
        required: true,
        trim: true
    },
    collectionAmount: {
        type: Number,
        required: true,
        min: 0
    },
    noOfMembers: {
        type: Number,
        required: true,
        min: 1
    },
    term: {
        type: Number,
        required: true,
        min: 1
    },
    mode: {
        type: String,
        enum: ['MLY', 'WLY', 'DLY', 'YLY'], // Monthly, Weekly, Daily, Yearly
        required: true,
        default: 'MLY'
    },
    gst: {
        type: Number,
        default: 0,
        min: 0
    },
    adminCharges: {
        type: Number,
        default: 0,
        min: 0
    },
    bidderCommission: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ChittyScheme', chittySchemeSchema);
