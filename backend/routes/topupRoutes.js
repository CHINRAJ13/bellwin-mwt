const express = require('express');
const router = express.Router();
const {
  getEligibleLoanDetails,
  createTopUpRequest,
  getPendingRequests,
  approveTopUp,
  rejectTopUp,
  getTopUpHistory,
  getTopUpDashboardStats
} = require('../controllers/topupController');

// Define Routes
router.get('/eligible/:loanId', getEligibleLoanDetails);
router.post('/request', createTopUpRequest);
router.get('/pending', getPendingRequests);
router.put('/approve/:topUpId', approveTopUp);
router.put('/reject/:topUpId', rejectTopUp);
router.get('/history', getTopUpHistory);
router.get('/dashboard-stats', getTopUpDashboardStats);

module.exports = router;
