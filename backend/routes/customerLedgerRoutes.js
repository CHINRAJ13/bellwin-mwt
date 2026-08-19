const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCustomerLedger } = require('../controllers/customerLedgerController');

// @route   GET /api/customer-ledger/:customerId
// @desc    Get complete customer ledger data
// @access  Private (Needs auth middleware in production, but leaving unprotected for now per other routes or assuming they use it via front end token)
router.get('/:customerId', protect, getCustomerLedger);

module.exports = router;
