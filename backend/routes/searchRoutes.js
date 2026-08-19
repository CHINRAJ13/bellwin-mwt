const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/search/loan/:searchValue
// @desc    Search loans globally by Loan ID or Phone Number
// @access  Private (Requires authentication)
router.get('/loan/:searchValue', protect, searchController.searchLoans);

module.exports = router;
