const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    checkIn: { type: String }, // '09:00'
    checkOut: { type: String }, // '18:00'
    workingHours: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'], 
        default: 'Absent' 
    },
    note: { type: String },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
