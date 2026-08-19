const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNextDenominationId,
  createDenomination,
  getDenominations,
  getDenominationById,
  updateDenomination
} = require('../controllers/denominationController');

router.get('/next-id', protect, getNextDenominationId);
router.post('/', protect, createDenomination);
router.get('/', protect, getDenominations);
router.get('/:denominationId', protect, getDenominationById);
router.put('/:denominationId', protect, updateDenomination);

module.exports = router;
