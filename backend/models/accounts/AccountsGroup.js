const mongoose = require('mongoose');

const accountsGroupSchema = new mongoose.Schema({
  groupCode: { type: String, required: true },
  groupName: { type: String, required: true },
  parentGroup: { type: String },
  nature: { type: String, default: 'Asset' },
  description: { type: String },
  status: { type: String, default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('AccountsGroup', accountsGroupSchema);
