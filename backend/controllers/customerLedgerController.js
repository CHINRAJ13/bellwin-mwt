const { Customer } = require('../models/Customer');
const GoldScheme = require('../models/GoldScheme');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

// @desc    Get complete customer ledger data
// @route   GET /api/customer-ledger/:customerId
// @access  Private
const getCustomerLedger = async (req, res, next) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return next(new ApiError(400, "Customer ID is required"));
        }

        // Fetch all data concurrently
        const [customer, goldSchemes, loans, payments] = await Promise.all([
            Customer.findOne({ customerId }),
            GoldScheme.find({ customerId }),
            Loan.find({ customerId }),
            Payment.find({ customerId }).sort({ paymentDate: -1 })
        ]);

        if (!customer) {
            return next(new ApiError(404, "Customer Not Found"));
        }

        // We assume the active loan or most recent loan is what they want if multiple.
        // Or we can just grab the first one (most typical in this flow)
        const activeLoan = loans.length > 0 ? loans[loans.length - 1] : null;
        const activeScheme = goldSchemes.length > 0 ? goldSchemes[goldSchemes.length - 1] : null;
        
        let closureDetails = null;
        if (activeLoan) {
            const LoanClosure = require('../models/LoanClosure');
            closureDetails = await LoanClosure.findOne({ loanId: activeLoan.loanId });
        }

        // Dynamic Calculations
        let totalPrincipalCollected = 0;
        let totalInterestCollected = 0;
        let totalPenaltyCollected = 0;
        let totalAmountCollected = 0;
        
        payments.forEach(payment => {
            totalPrincipalCollected += (payment.principalAmount || 0);
            totalInterestCollected += (payment.interestAmount || 0);
            totalPenaltyCollected += (payment.penaltyAmount || 0);
            totalAmountCollected += (payment.paymentAmount || 0);
        });

        const originalLoanAmount = activeLoan ? activeLoan.loanAmount : 0;
        
        // Calculate remaining loan amount based on payments
        let currentRemainingLoanAmount = activeLoan ? activeLoan.loanAmount : 0;
        if (activeLoan) {
            // Deduct total principal collected
            currentRemainingLoanAmount -= totalPrincipalCollected;
            if (currentRemainingLoanAmount < 0) currentRemainingLoanAmount = 0;
        }

        const lastPaymentDate = payments.length > 0 ? payments[0].paymentDate : null;
        
        // Calculate next due date (approx 30 days after last payment or loan start if no payment)
        let nextDueDate = null;
        if (activeLoan && activeLoan.status !== 'Closed') {
            const baseDate = lastPaymentDate ? new Date(lastPaymentDate) : new Date(activeLoan.loanStartDate);
            nextDueDate = new Date(baseDate.setMonth(baseDate.getMonth() + 1));
        }

        const financialSummary = {
            originalLoanAmount,
            currentRemainingLoanAmount,
            totalPrincipalCollected,
            totalInterestCollected,
            totalPenaltyCollected,
            totalAmountCollected,
            numberOfPayments: payments.length,
            lastPaymentDate,
            nextDueDate
        };

        // Sort payments ascending to calculate progressive remaining balance
        const sortedPayments = [...payments].sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
        
        let progressiveBalance = originalLoanAmount;
        
        const mappedPayments = sortedPayments.map(p => {
            progressiveBalance -= (p.principalAmount || 0);
            return {
                receiptNo: p.paymentId, // Mapping schema 'paymentId' to 'receiptNo' for UI
                paymentDate: p.paymentDate,
                paymentType: p.paymentType,
                interestPaid: p.interestAmount, // Mapping schema 'interestAmount'
                principalPaid: p.principalAmount, // Mapping schema 'principalAmount'
                penaltyPaid: p.penaltyAmount, // Mapping schema 'penaltyAmount'
                totalPaid: p.paymentAmount, // Mapping schema 'paymentAmount'
                remainingBalance: progressiveBalance < 0 ? 0 : progressiveBalance,
                collectedBy: p.collectedBy,
                paymentMode: p.paymentMode
            };
        }).reverse(); // Reverse back to descending for the UI

        res.status(200).json({
            success: true,
            data: {
                customer: {
                    customerId: customer.customerId,
                    customerName: customer.customerName,
                    mobileNumber: customer.mobileNumber,
                    branch: customer.customerBranch || 'Main Branch', // Not explicitly in schema, using default
                    address: `${customer.doorStreet}, ${customer.area}, ${customer.city}`,
                    status: customer.status
                },
                goldScheme: activeScheme ? {
                    schemeId: activeScheme.schemeId,
                    schemeName: activeScheme.schemeName,
                    interestPercent: activeScheme.interestPercent,
                    amount: activeScheme.amount,
                    gramRate: activeScheme.gramRate,
                    minimumGram: activeScheme.minimumGram,
                    maturePeriod: activeScheme.maturePeriod,
                    interestRepaymentMonths: activeScheme.interestRepaymentMonths,
                    documentCharges: activeScheme.documentCharges,
                    penaltyPercent: activeScheme.penaltyPercent
                } : null,
                loan: activeLoan ? {
                    loanId: activeLoan.loanId,
                    loanStartDate: activeLoan.loanStartDate,
                    loanEndDate: activeLoan.loanEndDate,
                    loanDate: activeLoan.loanDate,
                    createdAt: activeLoan.createdAt,
                    updatedAt: activeLoan.updatedAt,
                    loanAmount: activeLoan.loanAmount,
                    remainingLoanAmount: currentRemainingLoanAmount,
                    loanStatus: activeLoan.status,
                    employeeName: activeLoan.employeeName || 'System',
                    approvedBy: activeLoan.employeeName || 'Admin'
                } : null,
                closureDetails: closureDetails ? {
                    closureId: closureDetails.closureId,
                    closureType: closureDetails.closureType,
                    closureDate: closureDetails.closureDate,
                    closedBy: closureDetails.closedBy,
                    closureRemarks: closureDetails.closureRemarks
                } : null,
                payments: mappedPayments,
                financialSummary
            }
        });

    } catch (error) {
        console.error("Ledger Error:", error);
        next(new ApiError(500, "Error generating customer ledger"));
    }
};

module.exports = {
    getCustomerLedger
};
