const ApiError = require('../utils/ApiError');
const LoanClosure = require('../models/LoanClosure');
const Loan = require('../models/Loan');
const { Customer } = require('../models/Customer');
const Payment = require('../models/Payment');
const GoldStock = require('../models/GoldStock');
const mongoose = require('mongoose');

// @desc    Get closure verification details
// @route   GET /api/loan-closure/:loanId
// @access  Public
exports.getClosureDetails = async (req, res, next) => {
    try {
        const { loanId } = req.params;

        // Fetch Loan
        const loan = await Loan.findOne({ loanId }).populate('customerObjectId');
        if (!loan) {
            return next(new ApiError(404, 'Loan not found'));
        }

        // Fetch Customer
        const customer = await Customer.findOne({ customerId: loan.customerId });
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }

        // Fetch Payments
        const payments = await Payment.find({ loanId }).sort({ paymentDate: 1 });
        
        let totalPrincipalCollected = 0;
        let totalInterestCollected = 0;
        let totalPenaltyCollected = 0;
        let totalAmountCollected = 0;

        payments.forEach(p => {
            totalPrincipalCollected += (p.principalAmount || 0);
            totalInterestCollected += (p.interestAmount || 0);
            totalPenaltyCollected += (p.penaltyAmount || 0);
            totalAmountCollected += (p.paymentAmount || 0);
        });

        // Fetch Gold Stock
        const goldStocks = await GoldStock.find({ loanId });

        // Check Eligibility
        const isBalanceZero = loan.remainingLoanAmount <= 0;
        const isStatusClosed = loan.status === 'Closed';
        const allGoldReleased = goldStocks.length > 0 && goldStocks.every(g => g.status === 'Released');
        
        // Fetch existing closure record if it exists
        const existingClosure = await LoanClosure.findOne({ loanId });

        res.status(200).json({
            success: true,
            data: {
                customer: {
                    customerId: customer.customerId,
                    customerName: customer.customerName,
                    mobileNumber: customer.mobileNumber,
                    branch: customer.branch
                },
                loan: {
                    loanId: loan.loanId,
                    loanAmount: loan.loanAmount,
                    remainingLoanAmount: loan.remainingLoanAmount,
                    loanStartDate: loan.loanStartDate,
                    loanEndDate: loan.loanEndDate,
                    loanStatus: loan.status
                },
                paymentSummary: {
                    originalLoanAmount: loan.loanAmount,
                    totalPrincipalPaid: totalPrincipalCollected,
                    totalInterestPaid: totalInterestCollected,
                    totalPenaltyPaid: totalPenaltyCollected,
                    totalAmountPaid: totalAmountCollected
                },
                goldDetails: goldStocks.map(g => ({
                    articleName: g.articleName,
                    grossWeight: g.grossWeight,
                    netWeight: g.netWeight,
                    purity: g.purity,
                    appraisedValue: g.appraisedValue,
                    status: g.status
                })),
                closureEligibility: {
                    isBalanceZero,
                    isStatusClosed,
                    allGoldReleased,
                    isEligible: isBalanceZero && isStatusClosed && allGoldReleased && !existingClosure,
                    existingClosure: existingClosure || null
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process final loan closure
// @route   POST /api/loan-closure/:loanId
// @access  Public
exports.processClosure = async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const { closureType, closureRemarks, closedBy, closureDate, branch, employeeId, employeeName } = req.body;

        if (!closureType || !closedBy) {
            return next(new ApiError(400, 'Closure Type and Closed By are required'));
        }

        // 1. Verify existing closure (Idempotency)
        const existingClosure = await LoanClosure.findOne({ loanId });
        if (existingClosure) {
            return next(new ApiError(400, 'Loan has already been closed.'));
        }

        // 2. Verify Loan Exists
        const loan = await Loan.findOne({ loanId });
        if (!loan) {
            return next(new ApiError(404, 'Loan not found'));
        }

        // 3. Verify Customer Exists
        const customer = await Customer.findOne({ customerId: loan.customerId });
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }

        // 4. Verify Loan Status
        if (loan.status !== 'Closed') {
            return next(new ApiError(400, 'Loan status must be Closed to perform final closure'));
        }

        // 5. Verify Remaining Balance
        if (loan.remainingLoanAmount > 0) {
            return next(new ApiError(400, 'Remaining loan amount must be 0 to close the loan'));
        }

        // 6. Verify Gold Stock
        const goldStocks = await GoldStock.find({ loanId });
        if (goldStocks.length === 0) {
            // Some loans might not have gold? The prompt says "All linked GoldStock records have Status = Released"
            // If length is 0, technically "all" (0) are released, but let's allow it or require gold? 
            // Usually jewelry ERP means there is gold. But we just check if any are NOT released.
        }
        
        const unreleasedGold = goldStocks.filter(g => g.status !== 'Released');
        if (unreleasedGold.length > 0) {
            return next(new ApiError(400, 'All linked Gold Stock must be Released before closure'));
        }

        // 7. Create Closure Record
        const newClosure = await LoanClosure.create({
            loanId: loan.loanId,
            customerId: customer.customerId,
            branch: branch || customer.branch,
            employeeId,
            employeeName,
            closureType,
            closureRemarks,
            closedBy,
            closureDate: closureDate || new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Loan successfully closed',
            data: newClosure
        });
    } catch (error) {
        next(error);
    }
};
