const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { searchCustomer, getStatus, getDebugInfo, getPendingCustomers, handleApprovalAction } = require('../controllers/customerApprovalController');

// Guest user middleware (consistent with existing customer routes)

/**
 * Requirement 8: Route Registration
 */

// GET /api/customer-approval/pending
router.get('/pending', protect, getPendingCustomers);

// POST /api/customer-approval/action/:customerId
router.post('/action/:customerId', protect, handleApprovalAction);

// GET /api/customer-approval/search?customerId=...&branchId=...
router.get('/search', protect, searchCustomer);

// GET /api/customer-approval/status/:customerId
router.get('/status/:customerId', protect, getStatus);

// GET /api/customer-approval/debug/:customerId
router.get('/debug/:customerId', protect, getDebugInfo);

module.exports = router;
