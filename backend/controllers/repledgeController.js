const ApiError = require('../utils/ApiError');
const Repledge = require('../models/Repledge');
const Loan = require('../models/Loan');
const { syncGoldStockStatus } = require('./goldStockController');

// @desc    Create repledge record + update loan status
// @route   POST /api/repledges
// @access  Public
const createRepledge = async (req, res, next) => {
  try {
    const {
      loanId,
      newStatus,
      additionalLoanAmount,
      newInterestRate,
      newDueDate,
      repledgeDate,
      changedBy,
      approvalStatus,
      approvedBy,
      approvalDate,
      reasonForChange,
      remarks
    } = req.body;

    if (!loanId || !newStatus) {
      return next(new ApiError(400, 'loanId and newStatus are required' ));
    }

    // Fetch the loan
    const loan = await Loan.findOne({ loanId });
    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    if (loan.status === 'Closed') {
      return next(new ApiError(400, 'Cannot change status of a Closed loan' ));
    }

    // Create repledge record
    const repledge = await Repledge.create({
      loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      oldStatus: loan.status,
      newStatus,
      oldLoanAmount: loan.loanAmount,
      remainingLoanAmount: loan.remainingLoanAmount,
      additionalLoanAmount: parseFloat(additionalLoanAmount) || 0,
      newInterestRate: parseFloat(newInterestRate) || null,
      newDueDate: newDueDate || null,
      repledgeDate: repledgeDate || new Date(),
      changedBy,
      approvalStatus,
      approvedBy,
      approvalDate: approvalDate || null,
      reasonForChange,
      remarks
    });

    // Update loan status
    loan.status = newStatus;
    if (newInterestRate) loan.interestRate = parseFloat(newInterestRate);
    if (additionalLoanAmount && parseFloat(additionalLoanAmount) > 0) {
      loan.loanAmount = (loan.loanAmount || 0) + parseFloat(additionalLoanAmount);
      loan.remainingLoanAmount = (loan.remainingLoanAmount || 0) + parseFloat(additionalLoanAmount);
    }
    await loan.save();

    await syncGoldStockStatus(loan.loanId, loan.status);

    res.status(201).json({ repledge, loan });
  } catch (error) { next(error); }
};

// @desc    Get all repledges for a loan
// @route   GET /api/repledges/loan/:loanId
// @access  Public
const getRepledgesByLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const repledges = await Repledge.find({ loanId }).sort({ createdAt: -1 });
    res.json(repledges);
  } catch (error) { next(error); }
};

// @desc    Get all repledges (for reports tab)
// @route   GET /api/repledges
// @access  Public
const getAllRepledges = async (req, res, next) => {
  try {
    const repledges = await Repledge.find().sort({ createdAt: -1 });
    res.json(repledges);
  } catch (error) { next(error); }
};

module.exports = {
  createRepledge,
  getRepledgesByLoan,
  getAllRepledges
};
