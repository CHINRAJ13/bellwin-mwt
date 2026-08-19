const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCustomerHistory } = require('../controllers/customerHistoryController');

// Inject guest user if no auth token is provided (matching other routes)

/**
 * GET /api/customer-history/:customerId
 */
router.get('/:customerId', protect, getCustomerHistory);

module.exports = router;
