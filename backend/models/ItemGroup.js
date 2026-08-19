const mongoose = require('mongoose');

const itemGroupSchema = new mongoose.Schema({
  itemCode: { type: String, required: true, unique: true },
  itemName: { type: String, required: true },
  itemType: { type: String, required: true },
  itemGroup: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('ItemGroup', itemGroupSchema);
