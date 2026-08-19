const mongoose = require('mongoose');

const valuerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isValuer: { type: Boolean, default: false },
  isAppraiser: { type: Boolean, default: false },
  isAuthoriser: { type: Boolean, default: false },
  isAuditor: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Valuer', valuerSchema);
