const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const loanClosureController = require('../controllers/loanClosureController');

router.get('/:loanId', protect, loanClosureController.getClosureDetails);
router.post('/:loanId', protect, loanClosureController.processClosure);

module.exports = router;
