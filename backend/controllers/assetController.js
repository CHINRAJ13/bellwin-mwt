const Asset = require('../models/Asset');

// @desc    Get next Asset ID
// @route   GET /api/assets/next-id
// @access  Public
const getNextAssetId = async (req, res, next) => {
  try {
    const lastAsset = await Asset.findOne().sort({ createdAt: -1 });
    let nextId = 'AST000001';
    
    if (lastAsset && lastAsset.assetId && lastAsset.assetId.startsWith('AST')) {
      const currentNumber = parseInt(lastAsset.assetId.replace('AST', ''), 10);
      if (!isNaN(currentNumber)) {
        nextId = `AST${String(currentNumber + 1).padStart(6, '0')}`;
      }
    }
    
    res.json({ nextId });
  } catch (error) { next(error); }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Public
const createAsset = async (req, res, next) => {
  try {
    const {
      assetId, assetName, assetCategory, purchaseDate, purchaseCost,
      branch, department, assignedEmployee, supplier, warranty,
      serialNumber, status, remarks
    } = req.body;

    if (!assetId || !assetName || !assetCategory || !purchaseDate || !purchaseCost || !branch) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const assetExists = await Asset.findOne({ assetId });
    if (assetExists) {
      return res.status(400).json({ message: `Asset ID ${assetId} already exists` });
    }

    const asset = new Asset({
      assetId, assetName, assetCategory, purchaseDate, purchaseCost,
      branch, department, assignedEmployee, supplier, warranty,
      serialNumber, status, remarks
    });
    
    await asset.save();
    res.status(201).json({ success: true, asset });
  } catch (error) { next(error); }
};

// @desc    Get all assets
// @route   GET /api/assets
// @access  Public
const getAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) { next(error); }
};

// @desc    Get asset by ID
// @route   GET /api/assets/:id
// @access  Public
const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (error) { next(error); }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Public
const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ success: true, asset });
  } catch (error) { next(error); }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Public
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = {
  getNextAssetId,
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset
};
