const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
