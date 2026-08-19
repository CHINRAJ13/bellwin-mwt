const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: { type: String, unique: true, index: true, required: true },
  assetName: { type: String, required: true },
  assetCategory: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  purchaseCost: { type: Number, required: true },
  branch: { type: String, required: true },
  department: { type: String },
  assignedEmployee: { type: String },
  supplier: { type: String },
  warranty: { type: String },
  serialNumber: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Maintenance', 'Disposed'], default: 'Active' },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
