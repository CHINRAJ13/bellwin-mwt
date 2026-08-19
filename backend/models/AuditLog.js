const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  module: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: String, required: true }, // e.g., Admin Name or Employee ID
  ipAddress: { type: String },
  browser: { type: String },
  remarks: { type: String },
  data: { type: mongoose.Schema.Types.Mixed } // Store snapshot of data
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
