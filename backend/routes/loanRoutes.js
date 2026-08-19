const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createLoan, getLoanById, getLoansByCustomer, updateLoan, updateLoanStatus, getLoansByStatus, getAllLoans, getNextLoanIdPreview } = require('../controllers/loanController');

// POST /api/loans - Create a new loan
router.post('/', createLoan);

// GET /api/loans - Get all loans
router.get('/', protect, getAllLoans);

// GET /api/loans/next-id - Get next loan ID preview
router.get('/next-id', protect, getNextLoanIdPreview);

// GET /api/loans/customer/:customerId - Get all loans for a customer
router.get('/customer/:customerId', protect, getLoansByCustomer);

// GET /api/loans/by-status/:status - Get loans by status (for reports)
router.get('/by-status/:status', protect, getLoansByStatus);

// PUT /api/loans/status/:loanId - Update loan status only
router.put('/status/:loanId', protect, updateLoanStatus);

// GET /api/loans/:id - Get a loan by ID or Loan ID
router.get('/:id', protect, getLoanById);

// PUT /api/loans/:id - Update a loan by ID or Loan ID
router.put('/:id', protect, updateLoan);

module.exports = router;
