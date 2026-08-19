const ApiError = require('../utils/ApiError');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { syncGoldStockStatus } = require('./goldStockController');

// @desc    Create new payment and update loan
// @route   POST /api/payments
// @access  Public
const createPayment = async (req, res, next) => {
  try {
    const {
      loanId,
      customerId,
      paymentType,
      paymentAmount,
      principalAmount,
      interestAmount,
      penaltyAmount,
      paymentDate,
      paymentMode,
      transactionRef,
      collectedBy,
      remarks
    } = req.body;

    // Validate payment amount
    if (!paymentAmount || paymentAmount <= 0) {
      return next(new ApiError(400, 'Payment amount must be greater than 0' ));
    }

    // Fetch loan using loanId string
    const loan = await Loan.findOne({ loanId });
    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    if (loan.status === 'Closed') {
      return next(new ApiError(400, 'Cannot process payment for a Closed loan' ));
    }

    // Process loan updates
    const numericPaymentAmount = parseFloat(paymentAmount) || 0;
    const numericInterestAmount = parseFloat(interestAmount) || 0;
    const numericPrincipalAmount = parseFloat(principalAmount) || 0;
    const numericPenaltyAmount = parseFloat(penaltyAmount) || 0;

    // Calculate new values
    const newRemainingAmount = loan.remainingLoanAmount - numericPrincipalAmount;
    
    // Check overpayment (if principal paid > remaining)
    if (newRemainingAmount < 0) {
       return next(new ApiError(400, 'Payment principal exceeds remaining loan amount' ));
    }

    // Create payment record
    const payment = await Payment.create({
      loanId,
      customerId,
      paymentType,
      paymentAmount: numericPaymentAmount,
      principalAmount: numericPrincipalAmount,
      interestAmount: numericInterestAmount,
      penaltyAmount: numericPenaltyAmount,
      paymentDate: paymentDate || new Date(),
      paymentMode,
      transactionRef,
      collectedBy,
      remarks
    });

    // Update loan document
    loan.remainingLoanAmount = newRemainingAmount;
    loan.totalPaidInterestAmount = (loan.totalPaidInterestAmount || 0) + numericInterestAmount;
    
    // Add payment history reference to the loan document as required by previous schema
    loan.payments.push({
      receiptNo: payment.paymentId, // The generated PAYXXXXXX
      paidDate: payment.paymentDate,
      amount: payment.paymentAmount,
      interestAmount: payment.interestAmount,
      principalAmount: payment.principalAmount,
      penalty: payment.penaltyAmount,
      penaltyPending: 0
    });

    // Check closure logic
    if (loan.remainingLoanAmount <= 0) {
      loan.status = 'Closed';
      if (!loan.loanEndDate) {
        loan.loanEndDate = new Date();
      }
    }

    await loan.save();

    await syncGoldStockStatus(loan.loanId, loan.status);

    // --- LEDGER POSTING START ---
    const { postLedgerEntry } = require('../services/ledgerService');
    const voucherInfo = {
        voucherNumber: payment.paymentId || `RV${Math.floor(100000 + Math.random() * 900000)}`,
        voucherType: 'Receive',
        referenceModule: 'Payment',
        referenceId: payment.paymentId || String(payment._id),
        remarks: `Payment for ${loan.loanId} by ${paymentMode || 'Cash'}`,
        createdBy: req.user ? req.user._id : null
    };

    try {
        const cashOrBank = (paymentMode && paymentMode.toLowerCase() !== 'cash') ? 'Bank' : 'Cash';
        
        // Debit Cash/Bank
        await postLedgerEntry(cashOrBank, numericPaymentAmount, 'Debit', voucherInfo);

        // Credit Incomes and Assets
        if (numericPrincipalAmount > 0) {
            await postLedgerEntry('Loan Receivable', numericPrincipalAmount, 'Credit', voucherInfo);
        }
        if (numericInterestAmount > 0) {
            await postLedgerEntry('Interest Income', numericInterestAmount, 'Credit', voucherInfo);
        }
        if (numericPenaltyAmount > 0) {
            await postLedgerEntry('Penalty Income', numericPenaltyAmount, 'Credit', voucherInfo);
        }
    } catch(err) {
        console.error("Payment Ledger posting failed:", err);
    }
    // --- LEDGER POSTING END ---

    res.status(201).json({ payment, loan });
  } catch (error) { next(error); }
};

// @desc    Get all payments for a specific loan
// @route   GET /api/payments/loan/:loanId
// @access  Public
const getPaymentsByLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const payments = await Payment.find({ loanId }).sort({ paymentDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) { next(error); }
};

// @desc    Get aggregated loan and payment history
// @route   GET /api/payments/history/:loanId
// @access  Public
const getPaymentHistory = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findOne({ loanId }).populate('customerObjectId');
    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    const payments = await Payment.find({ loanId }).sort({ paymentDate: -1, createdAt: -1 });

    res.json({ loan, payments });
  } catch (error) { next(error); }
};

// @desc    Get all payments (global ledger)
// @route   GET /api/payments
// @access  Public
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) { next(error); }
};

module.exports = {
  createPayment,
  getPaymentsByLoan,
  getPaymentHistory,
  getAllPayments
};
