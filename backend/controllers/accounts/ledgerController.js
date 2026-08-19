const ApiError = require('../../utils/ApiError');
const Ledger = require('../../models/accounts/Ledger');
const LedgerTransaction = require('../../models/accounts/LedgerTransaction');
const { postLedgerEntry } = require('../../services/ledgerService');

// @desc    Create a new ledger
// @route   POST /api/accounts/ledgers
// @access  Private/Admin
exports.createLedger = async (req, res, next) => {
    try {
        const { ledgerName, accountGroup, openingBalance, balanceType, branch, description } = req.body;
        
        const existing = await Ledger.findOne({ ledgerName: new RegExp(`^${ledgerName}$`, 'i') });
        if (existing) {
            return next(new ApiError(400, 'Ledger name already exists'));
        }

        const ledger = await Ledger.create({
            ledgerName,
            accountGroup,
            openingBalance: openingBalance || 0,
            balanceType: balanceType || 'Debit',
            branch: branch || 'All',
            description,
            createdBy: req.user ? req.user._id : null
        });

        res.status(201).json({ success: true, data: ledger });
    } catch (error) { console.error('LEDGER CREATE ERROR:', error); next(error); }
};

// @desc    Get all ledgers
// @route   GET /api/accounts/ledgers
// @access  Private
exports.getLedgers = async (req, res, next) => {
    try {
        const ledgers = await Ledger.find({}).sort({ accountGroup: 1, ledgerName: 1 });
        res.json({ success: true, data: ledgers });
    } catch (error) { next(error); }
};

// @desc    Get ledger details and transactions
// @route   GET /api/accounts/ledgers/:id
// @access  Private
exports.getLedgerDetails = async (req, res, next) => {
    try {
        const ledger = await Ledger.findById(req.params.id);
        if (!ledger) return next(new ApiError(404, 'Ledger not found'));

        const transactions = await LedgerTransaction.find({ ledgerId: ledger._id })
            .sort({ transactionDate: -1, createdAt: -1 })
            .populate('createdBy', 'username name');

        res.json({ success: true, data: { ledger, transactions } });
    } catch (error) { next(error); }
};
