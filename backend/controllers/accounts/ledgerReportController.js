const ApiError = require('../../utils/ApiError');
const Ledger = require('../../models/accounts/Ledger');
const LedgerTransaction = require('../../models/accounts/LedgerTransaction');

// @desc    Get Ledger Statement Report
// @route   GET /api/reports/ledger-statement
// @access  Private/Admin
exports.getLedgerStatement = async (req, res, next) => {
    try {
        const { ledgerId, fromDate, toDate, voucherType, referenceModule } = req.query;

        if (!ledgerId) {
            return next(new ApiError(400, 'Ledger ID is required'));
        }

        // 1. Fetch Ledger Master Data
        const ledger = await Ledger.findById(ledgerId).lean();
        if (!ledger) {
            return next(new ApiError(404, 'Ledger not found'));
        }

        // 2. Build filter query for transactions
        const query = { ledgerId: ledger._id };
        
        let startDate = null;
        let endDate = null;
        
        if (fromDate) {
            startDate = new Date(fromDate);
            startDate.setHours(0, 0, 0, 0);
        }
        
        if (toDate) {
            endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999);
        }

        if (startDate || endDate) {
            query.transactionDate = {};
            if (startDate) query.transactionDate.$gte = startDate;
            if (endDate) query.transactionDate.$lte = endDate;
        }

        if (voucherType) query.voucherType = voucherType;
        if (referenceModule) query.referenceModule = referenceModule;

        // 3. Fetch Transactions
        const transactions = await LedgerTransaction.find(query)
            .sort({ transactionDate: 1, createdAt: 1 }) // Chronological order
            .populate('createdBy', 'username name')
            .lean();

        // 4. Calculate Brought Forward (Opening Balance)
        let broughtForwardBalance = ledger.openingBalance;

        if (startDate) {
            if (transactions.length > 0) {
                // If there are transactions in the range, take the balanceBefore of the first one
                broughtForwardBalance = transactions[0].balanceBefore;
            } else {
                // If no transactions in the range, get the latest transaction before the range
                const lastTransactionBefore = await LedgerTransaction.findOne({
                    ledgerId: ledger._id,
                    transactionDate: { $lt: startDate }
                }).sort({ transactionDate: -1, createdAt: -1 }).lean();
                
                if (lastTransactionBefore) {
                    broughtForwardBalance = lastTransactionBefore.balanceAfter;
                }
                // If there's no prior transaction, broughtForwardBalance remains ledger.openingBalance
            }
        }

        // 5. Calculate Summary Cards
        let totalDebit = 0;
        let totalCredit = 0;
        let currentBalance = broughtForwardBalance;

        transactions.forEach(tx => {
            totalDebit += tx.debit || 0;
            totalCredit += tx.credit || 0;
        });

        if (transactions.length > 0) {
            // currentBalance is the balanceAfter of the last transaction in the range
            currentBalance = transactions[transactions.length - 1].balanceAfter;
        }

        // Prepare Header
        const header = {
            ledgerName: ledger.ledgerName,
            ledgerCode: ledger.ledgerCode,
            accountGroup: ledger.accountGroup,
            branch: ledger.branch || 'All',
            ledgerOpeningBalance: ledger.openingBalance,
            status: ledger.status,
            createdAt: ledger.createdAt
        };

        // Prepare Summary
        const summary = {
            openingBalance: broughtForwardBalance,
            currentBalance: currentBalance,
            totalDebit: totalDebit,
            totalCredit: totalCredit,
            totalTransactions: transactions.length
        };

        res.json({
            success: true,
            header,
            summary,
            transactions
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get Cash Book Statement
// @route   GET /api/reports/cash-book-statement
// @access  Private/Admin
exports.getCashBookStatement = async (req, res, next) => {
    try {
        const { fromDate, toDate, voucherType, referenceModule } = req.query;

        // 1. Fetch the exact Cash Ledger used by operational modules
        const ledger = await Ledger.findOne({
            $or: [
                { ledgerCode: 'Cash' },
                { ledgerName: 'Cash' }
            ],
            status: 'Active'
        }).lean();

        if (!ledger) {
            return next(new ApiError(404, 'Active Cash Ledger not found in the system.'));
        }

        // 2. Build filter query for transactions
        const query = { ledgerId: ledger._id };
        
        let startDate = null;
        let endDate = null;
        
        if (fromDate) {
            startDate = new Date(fromDate);
            startDate.setHours(0, 0, 0, 0);
        }
        
        if (toDate) {
            endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999);
        }

        if (startDate || endDate) {
            query.transactionDate = {};
            if (startDate) query.transactionDate.$gte = startDate;
            if (endDate) query.transactionDate.$lte = endDate;
        }

        if (voucherType) query.voucherType = voucherType;
        if (referenceModule) query.referenceModule = referenceModule;

        // 3. Fetch Transactions
        const transactions = await LedgerTransaction.find(query)
            .sort({ transactionDate: 1, createdAt: 1 })
            .populate('createdBy', 'username name')
            .lean();

        // 4. Calculate Brought Forward (Opening Balance)
        let broughtForwardBalance = ledger.openingBalance;

        if (startDate) {
            if (transactions.length > 0) {
                broughtForwardBalance = transactions[0].balanceBefore;
            } else {
                const lastTransactionBefore = await LedgerTransaction.findOne({
                    ledgerId: ledger._id,
                    transactionDate: { $lt: startDate }
                }).sort({ transactionDate: -1, createdAt: -1 }).lean();
                
                if (lastTransactionBefore) {
                    broughtForwardBalance = lastTransactionBefore.balanceAfter;
                }
            }
        }

        // 5. Calculate Summary Cards
        let totalCashIn = 0;
        let totalCashOut = 0;
        let closingBalance = broughtForwardBalance;

        transactions.forEach(tx => {
            totalCashIn += tx.debit || 0;
            totalCashOut += tx.credit || 0;
        });

        if (transactions.length > 0) {
            closingBalance = transactions[transactions.length - 1].balanceAfter;
        }

        // Prepare Header
        const header = {
            ledgerName: ledger.ledgerName,
            ledgerCode: ledger.ledgerCode,
            accountGroup: ledger.accountGroup,
            branch: ledger.branch || 'All',
            ledgerOpeningBalance: ledger.openingBalance,
            status: ledger.status,
            createdAt: ledger.createdAt
        };

        // Prepare Summary
        const summary = {
            openingBalance: broughtForwardBalance,
            closingBalance: closingBalance,
            currentLiveBalance: ledger.currentBalance,
            totalCashIn: totalCashIn,
            totalCashOut: totalCashOut,
            totalTransactions: transactions.length
        };

        res.json({
            success: true,
            header,
            summary,
            transactions
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get Profit & Loss Statement
// @route   GET /api/reports/profit-loss-statement
// @access  Private/Admin
exports.getProfitLossStatement = async (req, res, next) => {
    try {
        const { fromDate, toDate, branch } = req.query;

        let startDate = null;
        let endDate = null;
        
        if (fromDate) {
            startDate = new Date(fromDate);
            startDate.setHours(0, 0, 0, 0);
        }
        
        if (toDate) {
            endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999);
        }

        // 1. Identify Income & Expense Account Groups
        const AccountsGroup = require('../../models/accounts/AccountsGroup');
        const groups = await AccountsGroup.find().lean();

        const incomeGroups = [];
        const expenseGroups = [];

        groups.forEach(g => {
            const nature = (g.nature || '').toLowerCase();
            const name = (g.groupName || '').toLowerCase();
            if (nature === 'income' || name.includes('income')) {
                incomeGroups.push(g.groupName);
            } else if (nature === 'expense' || name.includes('expense')) {
                expenseGroups.push(g.groupName);
            }
        });

        // Add explicit fallback groups just in case
        if (!incomeGroups.includes('Income')) incomeGroups.push('Income');
        if (!incomeGroups.includes('Direct Incomes')) incomeGroups.push('Direct Incomes');
        if (!incomeGroups.includes('Indirect Incomes')) incomeGroups.push('Indirect Incomes');

        if (!expenseGroups.includes('Expense')) expenseGroups.push('Expense');
        if (!expenseGroups.includes('Direct Expenses')) expenseGroups.push('Direct Expenses');
        if (!expenseGroups.includes('Indirect Expenses')) expenseGroups.push('Indirect Expenses');

        // 2. Identify Ledgers belonging to those groups
        const ledgerQuery = { status: 'Active' };
        
        // Optional branch filtering if needed in future (most ledgers are 'All' branches)
        // if (branch) ledgerQuery.branch = { $in: ['All', branch] };

        const incomeLedgers = await Ledger.find({ ...ledgerQuery, accountGroup: { $in: incomeGroups } }).lean();
        const expenseLedgers = await Ledger.find({ ...ledgerQuery, accountGroup: { $in: expenseGroups } }).lean();

        const incomeLedgerIds = incomeLedgers.map(l => l._id);
        const expenseLedgerIds = expenseLedgers.map(l => l._id);

        const allLedgerIds = [...incomeLedgerIds, ...expenseLedgerIds];

        // 3. Aggregate Transactions
        const matchStage = {
            ledgerId: { $in: allLedgerIds }
        };

        if (startDate || endDate) {
            matchStage.transactionDate = {};
            if (startDate) matchStage.transactionDate.$gte = startDate;
            if (endDate) matchStage.transactionDate.$lte = endDate;
        }

        const aggregated = await LedgerTransaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$ledgerId",
                    totalDebit: { $sum: "$debit" },
                    totalCredit: { $sum: "$credit" }
                }
            }
        ]);

        const aggregatedMap = {};
        aggregated.forEach(a => {
            aggregatedMap[a._id.toString()] = a;
        });

        // 4. Compute Net Period Income/Expense
        const income = [];
        let totalIncome = 0;

        incomeLedgers.forEach(l => {
            const stats = aggregatedMap[l._id.toString()] || { totalDebit: 0, totalCredit: 0 };
            // Income nature: Credit increases, Debit decreases
            const netAmount = stats.totalCredit - stats.totalDebit;
            if (netAmount !== 0) {
                income.push({
                    id: l._id.toString(),
                    name: l.ledgerName,
                    amount: netAmount
                });
                totalIncome += netAmount;
            }
        });

        const expenses = [];
        let totalExpenses = 0;

        expenseLedgers.forEach(l => {
            const stats = aggregatedMap[l._id.toString()] || { totalDebit: 0, totalCredit: 0 };
            // Expense nature: Debit increases, Credit decreases
            const netAmount = stats.totalDebit - stats.totalCredit;
            if (netAmount !== 0) {
                expenses.push({
                    id: l._id.toString(),
                    name: l.ledgerName,
                    amount: netAmount
                });
                totalExpenses += netAmount;
            }
        });

        const netProfit = totalIncome - totalExpenses;

        res.json({
            success: true,
            statementData: {
                income,
                expenses
            },
            summary: {
                totalIncome,
                totalExpenses,
                grossProfit: netProfit,
                netProfit: netProfit
            }
        });

    } catch (error) {
        next(error);
    }
};
const getLedgerBalancesHelper = async (query) => {
    const { fromDate, toDate, branch, status = 'Active' } = query;

    let startDate = null;
    let endDate = null;
    
    if (fromDate) {
        startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
    }
    
    if (toDate) {
        endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
    }

    // 1. Map Account Groups
    const AccountsGroup = require('../../models/accounts/AccountsGroup');
    const groups = await AccountsGroup.find().lean();
    const groupNatureMap = {};
    groups.forEach(g => {
        let nature = (g.nature || '').toLowerCase();
        let name = (g.groupName || '').toLowerCase();
        
        if (!nature) {
            if (name.includes('income')) nature = 'income';
            else if (name.includes('expense')) nature = 'expense';
            else if (name.includes('asset') || name.includes('cash') || name.includes('bank')) nature = 'asset';
            else if (name.includes('liabilit') || name.includes('payable')) nature = 'liability';
            else if (name.includes('capital')) nature = 'capital';
            else nature = 'asset'; // default fallback
        }
        groupNatureMap[g.groupName] = nature;
    });

    // 2. Fetch Ledgers
    const ledgerQuery = {};
    if (status !== 'All') {
        ledgerQuery.status = status;
    }
    if (branch) {
        ledgerQuery.branch = { $in: ['All', branch] };
    }

    const Ledger = require('../../models/accounts/Ledger');
    const ledgers = await Ledger.find(ledgerQuery).lean();
    const ledgerIds = ledgers.map(l => l._id);

    if (ledgerIds.length === 0) {
        return { data: [], grandTotalDebit: 0, grandTotalCredit: 0 };
    }

    // 3. Aggregate
    const matchStage = { ledgerId: { $in: ledgerIds } };
    if (endDate) {
        matchStage.transactionDate = { $lte: endDate };
    }

    const LedgerTransaction = require('../../models/accounts/LedgerTransaction');
    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: "$ledgerId",
                priorDebit: { $sum: { $cond: [ startDate ? { $lt: ["$transactionDate", startDate] } : false, "$debit", 0 ] } },
                priorCredit: { $sum: { $cond: [ startDate ? { $lt: ["$transactionDate", startDate] } : false, "$credit", 0 ] } },
                periodDebit: { $sum: { $cond: [ startDate ? { $gte: ["$transactionDate", startDate] } : true, "$debit", 0 ] } },
                periodCredit: { $sum: { $cond: [ startDate ? { $gte: ["$transactionDate", startDate] } : true, "$credit", 0 ] } }
            }
        }
    ];

    const aggregated = await LedgerTransaction.aggregate(pipeline);
    const aggMap = {};
    aggregated.forEach(a => { aggMap[a._id.toString()] = a; });

    let data = [];
    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    ledgers.forEach(l => {
        const stats = aggMap[l._id.toString()] || { priorDebit: 0, priorCredit: 0, periodDebit: 0, periodCredit: 0 };
        const nature = groupNatureMap[l.accountGroup] || 'asset';
        const balType = l.balanceType || (['income', 'liability', 'capital'].includes(nature) ? 'Credit' : 'Debit');
        
        const baseOpening = l.openingBalance || 0;
        let calculatedOpening = 0;
        let closingBalance = 0;

        if (balType === 'Debit') {
            calculatedOpening = baseOpening + stats.priorDebit - stats.priorCredit;
            closingBalance = calculatedOpening + stats.periodDebit - stats.periodCredit;
        } else {
            calculatedOpening = baseOpening + stats.priorCredit - stats.priorDebit;
            closingBalance = calculatedOpening + stats.periodCredit - stats.periodDebit;
        }

        const row = {
            id: l._id.toString(),
            ledgerCode: l.ledgerCode,
            ledgerName: l.ledgerName,
            accountGroup: l.accountGroup,
            nature: nature,
            balanceType: balType,
            openingBalance: calculatedOpening,
            debit: stats.periodDebit,
            credit: stats.periodCredit,
            closingBalance: closingBalance,
            closingType: closingBalance >= 0 ? balType : (balType === 'Debit' ? 'Credit' : 'Debit'),
            absoluteClosingBalance: Math.abs(closingBalance)
        };

        if (row.closingType === 'Debit') {
            grandTotalDebit += row.absoluteClosingBalance;
        } else {
            grandTotalCredit += row.absoluteClosingBalance;
        }

        data.push(row);
    });

    return { data, grandTotalDebit, grandTotalCredit };
};

exports.getTrialBalanceReport = async (req, res, next) => {
    try {
        const { group, search, page = 1, limit = 0 } = req.query;

        let { data, grandTotalDebit, grandTotalCredit } = await getLedgerBalancesHelper(req.query);

        // Apply remaining filters (group, search) that are specific to Trial Balance view
        if (group) {
            data = data.filter(d => d.accountGroup === group);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            data = data.filter(d => 
                d.ledgerName.toLowerCase().includes(searchLower) || 
                (d.ledgerCode && d.ledgerCode.toLowerCase().includes(searchLower))
            );
        }

        // 5. Sorting
        const sortField = req.query.sortBy || 'ledgerName';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        data.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return -1 * sortOrder;
            if (valA > valB) return 1 * sortOrder;
            return 0;
        });

        // 6. Pagination
        const totalRecords = data.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (limitNum > 0) {
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            data = data.slice(startIndex, endIndex);
        }

        const difference = Math.abs(grandTotalDebit - grandTotalCredit);
        const isBalanced = difference < 0.01;

        res.json({
            success: true,
            summary: {
                totalDebit: grandTotalDebit,
                totalCredit: grandTotalCredit,
                difference: difference,
                status: isBalanced ? 'Books Balanced' : 'Books Out of Balance'
            },
            data,
            pagination: {
                total: totalRecords,
                page: pageNum,
                pages: limitNum > 0 ? Math.ceil(totalRecords / limitNum) : 1
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get Balance Sheet Report
// @route   GET /api/reports/balance-sheet
// @access  Private/Admin
exports.getBalanceSheetReport = async (req, res, next) => {
    try {
        const { data } = await getLedgerBalancesHelper(req.query);

        // 1. Initialize Containers
        const currentAssets = [];
        const fixedAssets = [];
        let totalCurrentAssets = 0;
        let totalFixedAssets = 0;

        const currentLiabilities = [];
        const longTermLiabilities = [];
        let totalCurrentLiabilities = 0;
        let totalLongTermLiabilities = 0;

        const capitalItems = [];
        let totalCapital = 0;

        let totalIncome = 0;
        let totalExpense = 0;

        // 2. Classify Ledgers
        data.forEach(ledger => {
            // Net balance for BS is the closing balance based on its natural sign.
            // If it's a Debit account but has a Credit balance, the amount is negative.
            let amount = ledger.absoluteClosingBalance;
            
            // To simplify, we rely on the computed `closingType`
            // Example: An Asset should be Debit. If closingType is Credit, it's negative asset.
            
            if (ledger.nature === 'income') {
                if (ledger.closingType === 'Credit') totalIncome += amount;
                else totalIncome -= amount;
            } else if (ledger.nature === 'expense') {
                if (ledger.closingType === 'Debit') totalExpense += amount;
                else totalExpense -= amount;
            } else if (ledger.nature === 'asset') {
                let actualAmount = ledger.closingType === 'Debit' ? amount : -amount;
                // Simple heuristic for current vs fixed (since ERP Accounts Groups typically specify Fixed Assets)
                if (ledger.accountGroup.toLowerCase().includes('fixed')) {
                    fixedAssets.push({ ...ledger, amount: actualAmount });
                    totalFixedAssets += actualAmount;
                } else {
                    currentAssets.push({ ...ledger, amount: actualAmount });
                    totalCurrentAssets += actualAmount;
                }
            } else if (ledger.nature === 'liability') {
                let actualAmount = ledger.closingType === 'Credit' ? amount : -amount;
                if (ledger.accountGroup.toLowerCase().includes('long') || ledger.accountGroup.toLowerCase().includes('term')) {
                    longTermLiabilities.push({ ...ledger, amount: actualAmount });
                    totalLongTermLiabilities += actualAmount;
                } else {
                    currentLiabilities.push({ ...ledger, amount: actualAmount });
                    totalCurrentLiabilities += actualAmount;
                }
            } else if (ledger.nature === 'capital') {
                let actualAmount = ledger.closingType === 'Credit' ? amount : -amount;
                capitalItems.push({ ...ledger, amount: actualAmount });
                totalCapital += actualAmount;
            }
        });

        // 3. Compute Net Profit
        const netProfit = totalIncome - totalExpense;

        // 4. Summaries
        const totalAssets = totalCurrentAssets + totalFixedAssets;
        const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
        const totalLiabilitiesAndCapital = totalLiabilities + totalCapital + netProfit;
        
        const difference = Math.abs(totalAssets - totalLiabilitiesAndCapital);
        const isBalanced = difference < 0.01;

        res.json({
            success: true,
            summary: {
                totalAssets,
                totalLiabilities,
                totalCapital,
                netProfit,
                totalLiabilitiesAndCapital,
                difference,
                status: isBalanced ? 'Books Balanced' : 'Books Out of Balance'
            },
            data: {
                assets: {
                    currentAssets,
                    fixedAssets,
                    totalCurrentAssets,
                    totalFixedAssets
                },
                liabilities: {
                    currentLiabilities,
                    longTermLiabilities,
                    totalCurrentLiabilities,
                    totalLongTermLiabilities
                },
                capital: {
                    items: capitalItems,
                    totalCapital
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
