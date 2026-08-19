const ApiError = require('../utils/ApiError');
const Remittance = require('../models/Remittance');
const RemittanceCounter = require('../models/Counter');

// Get next remittance ID
exports.getNextId = async (req, res, next) => {
    try {
        const counter = await RemittanceCounter.findById('remittanceNo');
        const nextSeq = counter ? counter.seq + 1 : 1;
        const nextId = `REM${String(nextSeq).padStart(6, '0')}`;
        
        res.status(200).json({
            success: true,
            nextId
        });
    } catch (error) { next(error); }
};

// Create a new remittance
exports.createRemittance = async (req, res, next) => {
    try {
        const remittance = new Remittance(req.body);
        
        // Ensure amount is > 0
        if (remittance.amount <= 0) {
            return next(new ApiError(400, 'Amount must be greater than 0'
            ));
        }

        await remittance.save();
        
        // --- LEDGER POSTING START ---
        const { postLedgerEntry } = require('../services/ledgerService');
        const voucherInfo = {
            voucherNumber: remittance.remittanceNo || `CV${Math.floor(100000 + Math.random() * 900000)}`,
            voucherType: 'Contra',
            referenceModule: 'Remittance',
            referenceId: remittance.remittanceNo || String(remittance._id),
            remarks: `Remittance: ${remittance.remittanceType} - ${remittance.remarks || ''}`,
            createdBy: req.user ? req.user._id : null
        };

        try {
            if (remittance.remittanceType === 'Branch To Head Office') {
                await postLedgerEntry('Bank', remittance.amount, 'Debit', voucherInfo);
                await postLedgerEntry('Cash', remittance.amount, 'Credit', voucherInfo);
            } else if (remittance.remittanceType === 'Head Office To Branch') {
                await postLedgerEntry('Cash', remittance.amount, 'Debit', voucherInfo);
                await postLedgerEntry('Bank', remittance.amount, 'Credit', voucherInfo);
            }
        } catch(err) {
            console.error("Remittance Ledger posting failed:", err);
        }
        // --- LEDGER POSTING END ---

        res.status(201).json({
            success: true,
            message: 'Remittance created successfully',
            data: remittance
        });
    } catch (error) { next(error); }
};

// Get all remittances
exports.getRemittances = async (req, res, next) => {
    try {
        const remittances = await Remittance.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: remittances
        });
    } catch (error) { next(error); }
};

// Get single remittance by ID
exports.getRemittanceById = async (req, res, next) => {
    try {
        const remittance = await Remittance.findOne({ remittanceNo: req.params.remittanceId });
        if (!remittance) {
            return next(new ApiError(404, 'Remittance not found' ));
        }
        res.status(200).json({ success: true, data: remittance });
    } catch (error) { next(error); }
};

// Get remittance report with filters and summary
exports.getRemittanceReport = async (req, res, next) => {
    try {
        const { fromDate, toDate, remittanceType, remittanceNo } = req.query;
        let filter = {};

        if (fromDate || toDate) {
            filter.date = {};
            if (fromDate) filter.date.$gte = new Date(fromDate);
            if (toDate) filter.date.$lte = new Date(toDate);
        }

        if (remittanceType) filter.remittanceType = remittanceType;
        if (remittanceNo) filter.remittanceNo = new RegExp(remittanceNo, 'i');

        const remittances = await Remittance.find(filter).sort({ date: -1, createdAt: -1 });

        let totalRemittances = remittances.length;
        let branchToHOAmount = 0;
        let hoToBranchAmount = 0;

        remittances.forEach(rem => {
            if (rem.remittanceType === 'Branch To Head Office') {
                branchToHOAmount += rem.amount;
            } else if (rem.remittanceType === 'Head Office To Branch') {
                hoToBranchAmount += rem.amount;
            }
        });

        const netTransfer = branchToHOAmount - hoToBranchAmount;

        res.status(200).json({
            success: true,
            data: remittances,
            summary: {
                totalRemittances,
                branchToHOAmount,
                hoToBranchAmount,
                netTransfer
            }
        });
    } catch (error) { next(error); }
};
