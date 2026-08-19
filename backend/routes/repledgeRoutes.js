const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRepledge, getRepledgesByLoan, getAllRepledges } = require('../controllers/repledgeController');
const {
  createBank, getBanks, updateBank, deleteBank,
  createScheme, getSchemes, updateScheme, deleteScheme,
  createRepayment, getRepayments, updateRepayment, deleteRepayment
} = require('../controllers/repledgeMasterController');

// --- Main Repledge Routes ---
// GET /api/repledges - All repledges (reports)
router.get('/', protect, getAllRepledges);
// POST /api/repledges - Create repledge + update loan status
router.post('/', protect, createRepledge);
// GET /api/repledges/loan/:loanId - History for a specific loan
router.get('/loan/:loanId', protect, getRepledgesByLoan);

// --- Repledge Bank Routes ---
router.route('/banks')
  .get(protect, getBanks)
  .post(protect, createBank);
router.route('/banks/:id')
  .put(protect, updateBank)
  .delete(protect, deleteBank);

// --- Repledge Scheme Routes ---
router.route('/schemes')
  .get(protect, getSchemes)
  .post(protect, createScheme);
router.route('/schemes/:id')
  .put(protect, updateScheme)
  .delete(protect, deleteScheme);

// --- Repledge Repayment Routes ---
router.route('/repayments')
  .get(protect, getRepayments)
  .post(protect, createRepayment);
router.route('/repayments/:id')
  .put(protect, updateRepayment)
  .delete(protect, deleteRepayment);

module.exports = router;
