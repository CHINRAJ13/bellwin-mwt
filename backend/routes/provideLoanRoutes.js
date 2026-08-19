const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProvideLoanDetails } = require('../controllers/provideLoanController');


router.get('/customer/:customerId', protect, getProvideLoanDetails);

module.exports = router;
