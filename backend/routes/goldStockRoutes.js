const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const goldStockController = require('../controllers/goldStockController');

router.get('/', protect, goldStockController.getGoldStocks);
router.get('/report', protect, goldStockController.getGoldStockReport);
router.get('/loan/:loanId', protect, goldStockController.getGoldStockByLoanId);
router.get('/:stockId', protect, goldStockController.getGoldStockById);

module.exports = router;
