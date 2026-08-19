const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: {
    type: [String],
    default: []
    // e.g. ['attendance:view', 'attendance:add', 'salary:view', 'employees:view']
  },
  isSystem: {
    type: Boolean,
    default: false  // system roles like 'Super Admin' cannot be deleted
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true,
  collection: 'roles'
});

module.exports = mongoose.model('Role', RoleSchema);
