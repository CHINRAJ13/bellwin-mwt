const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSalaries,
  getSalaryById,
  generateSalary,
  markAsPaid,
  deleteSalary
} = require('../controllers/salaryController');

router.get('/', protect, getSalaries);
router.get('/:id', protect, getSalaryById);
router.post('/generate', protect, generateSalary);
router.patch('/:id/pay', protect, markAsPaid);
router.delete('/:id', protect, deleteSalary);

module.exports = router;
