const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNextIncomeId, createIncome, getIncomes, getIncomeById, updateIncome, deleteIncome, getIncomeReport } = require('../controllers/incomeController');

router.get('/next-id', protect, getNextIncomeId);
router.get('/report', protect, getIncomeReport);
router.post('/', protect, createIncome);
router.get('/', protect, getIncomes);
router.get('/:incomeId', protect, getIncomeById);
router.put('/:incomeId', protect, updateIncome);
router.delete('/:incomeId', protect, deleteIncome);

module.exports = router;
