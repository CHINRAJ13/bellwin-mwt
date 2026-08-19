const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createLoanRequest, getAllLoanRequests, updateLoanRequestStatus } = require('../controllers/loanRequestController');

router.post('/', protect, createLoanRequest);
router.get('/', protect, getAllLoanRequests);
router.put('/status/:id', protect, updateLoanRequestStatus);

module.exports = router;
