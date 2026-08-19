const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { memoryUpload } = require('../config/cloudinary');
const { getNextExpenseId, createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseReport } = require('../controllers/expenseController');

router.get('/next-id', protect, getNextExpenseId);
router.get('/report', protect, getExpenseReport);
router.post('/', protect, memoryUpload.single('expenseImage'), createExpense);
router.get('/', protect, getExpenses);
router.get('/:expenseId', protect, getExpenseById);
router.put('/:id', protect, memoryUpload.single('expenseImage'), updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
