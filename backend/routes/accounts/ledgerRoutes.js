const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { createLedger, getLedgers, getLedgerDetails } = require('../../controllers/accounts/ledgerController');

router.route('/')
    .post(protect, createLedger)
    .get(protect, getLedgers);

router.route('/:id')
    .get(protect, getLedgerDetails);

module.exports = router;
