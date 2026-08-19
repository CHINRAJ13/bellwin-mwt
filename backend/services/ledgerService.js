const mongoose = require('mongoose');
const Ledger = require('../models/accounts/Ledger');
const LedgerTransaction = require('../models/accounts/LedgerTransaction');
const ApiError = require('../utils/ApiError');

/**
 * Helper to post an automated ledger entry
 * @param {string} ledgerCodeOrName - Unique code or exact name of the ledger
 * @param {number} amount - Amount to transact
 * @param {string} entryType - 'Debit' or 'Credit'
 * @param {object} voucherInfo - { voucherNumber, voucherType, referenceModule, referenceId, remarks, createdBy, ipAddress, browser }
 * @param {object} session - Mongoose session for transaction safety (optional but recommended)
 */
exports.postLedgerEntry = async (ledgerCodeOrName, amount, entryType, voucherInfo, session) => {
    // 1. Find Ledger
    const ledger = await Ledger.findOne({
        $or: [
            { ledgerCode: ledgerCodeOrName },
            { ledgerName: ledgerCodeOrName }
        ],
        status: 'Active'
    }).session(session);

    if (!ledger) {
        throw new ApiError(404, `Active Ledger not found for: ${ledgerCodeOrName}`);
    }

    if (amount <= 0) return null; // No entry needed for 0 amount

    const balanceBefore = ledger.currentBalance;
    
    // 2. Calculate new balance
    // Rule:
    // If Ledger balanceType is 'Debit' (e.g. Assets, Expenses): Debit increases balance, Credit decreases.
    // If Ledger balanceType is 'Credit' (e.g. Liabilities, Income, Capital): Credit increases balance, Debit decreases.
    
    let balanceAfter = balanceBefore;
    let debitAmt = 0;
    let creditAmt = 0;

    if (entryType === 'Debit') {
        debitAmt = amount;
        ledger.totalDebit += amount;
        if (ledger.balanceType === 'Debit') {
            balanceAfter += amount;
        } else {
            balanceAfter -= amount;
        }
    } else if (entryType === 'Credit') {
        creditAmt = amount;
        ledger.totalCredit += amount;
        if (ledger.balanceType === 'Credit') {
            balanceAfter += amount;
        } else {
            balanceAfter -= amount;
        }
    } else {
        throw new ApiError(400, 'Invalid entryType. Must be Debit or Credit.');
    }

    ledger.currentBalance = balanceAfter;
    await ledger.save({ session });

    // 3. Create Transaction Record
    const transaction = new LedgerTransaction({
        ledgerId: ledger._id,
        voucherNumber: voucherInfo.voucherNumber,
        voucherType: voucherInfo.voucherType,
        referenceModule: voucherInfo.referenceModule,
        referenceId: voucherInfo.referenceId,
        debit: debitAmt,
        credit: creditAmt,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        remarks: voucherInfo.remarks || '',
        createdBy: voucherInfo.createdBy,
        ipAddress: voucherInfo.ipAddress,
        browser: voucherInfo.browser
    });

    await transaction.save({ session });

    return transaction;
};
