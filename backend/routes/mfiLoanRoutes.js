const express = require('express');
const router = express.Router();
const mfiLoanController = require('../controllers/mfiLoanController');

router.post('/', mfiLoanController.createMfiLoan);
router.get('/', mfiLoanController.getAllMfiLoans);

module.exports = router;
