const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNextAssetId, createAsset, getAssets, getAssetById, updateAsset, deleteAsset } = require('../controllers/assetController');

router.get('/next-id', protect, getNextAssetId);
router.post('/', protect, createAsset);
router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.put('/:id', protect, updateAsset);
router.delete('/:id', protect, deleteAsset);

module.exports = router;
