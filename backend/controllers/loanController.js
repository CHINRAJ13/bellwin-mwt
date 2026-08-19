const ApiError = require('../utils/ApiError');
const Loan = require('../models/Loan');
const { Customer } = require('../models/Customer');
const GoldStock = require('../models/GoldStock');
const { syncGoldStockStatus } = require('./goldStockController');
const mongoose = require('mongoose');

// @desc    Create new loan
// @route   POST /api/loans
// @access  Public
const createLoan = async (req, res, next) => {
  try {
    const {
      customerId, // This is currently passed as an ObjectId from ProvideLoan
      name,
      mobileNo,
      fatherHusbandName,
      address,
      loanDate,
      loanStartDate,
      loanEndDate,
      loanAmount,
      remainingLoanAmount,
      status,
      totalNoOfDays,
      interestRate,
      additionalInterestRate,
      totalPaidInterestAmount,
      totalInterestPaidDays,
      remainingDays,
      remainingInterestAmount,
      documentCharge,
      fullSettlementAmount,
      receiptEntry,
      articles,
      totalWt,
      jewelImage,
      payments,
      repledgeDetails,
      schemeId,
      schemeName,
      employeeId,
      employeeName,
      branch,
      loanType,
      interestPercent,
      gramRate,
      minimumGram,
      maturePeriod,
      interestRepaymentMonths,
      documentCharges,
      penaltyPercent
    } = req.body;

    let customerStringId = '';
    let customerObjectId = null;

    if (customerId) {
      // customerId is passed as ObjectId from frontend ProvideLoan
      if (mongoose.Types.ObjectId.isValid(customerId)) {
        customerObjectId = customerId;
        const customerExists = await Customer.findById(customerId);
        if (!customerExists) {
          return next(new ApiError(404, 'Customer not found' ));
        }
        // Approval check removed for testing
        // if (customerExists.approvalStatus !== 'Approved') {
        //   return next(new ApiError(400, 'Customer must be Approved to receive a loan' ));
        // }
        customerStringId = customerExists.customerId; // "CUSTXXXXXX"
      } else {
        // If frontend passes "CUSTXXXXXX" string
        customerStringId = customerId;
        const customerExists = await Customer.findOne({ customerId });
        if (!customerExists) {
          return next(new ApiError(404, 'Customer not found' ));
        }
        // Approval check removed for testing
        // if (customerExists.approvalStatus !== 'Approved') {
        //   return next(new ApiError(400, 'Customer must be Approved to receive a loan' ));
        // }
        customerObjectId = customerExists._id;
      }
    }

    const newLoan = await Loan.create({
      customerId: customerStringId,
      customerObjectId,
      name,
      mobileNo,
      fatherHusbandName,
      address,
      loanDate,
      loanStartDate,
      loanEndDate,
      loanAmount,
      remainingLoanAmount,
      status: status || 'Pending',
      totalNoOfDays,
      interestRate,
      additionalInterestRate,
      totalPaidInterestAmount,
      totalInterestPaidDays,
      remainingDays,
      remainingInterestAmount,
      documentCharge,
      fullSettlementAmount,
      receiptEntry,
      articles,
      totalWt,
      jewelImage,
      payments,
      repledgeDetails,
      schemeId,
      schemeName,
      employeeId,
      employeeName,
      branch,
      loanType,
      interestPercent,
      gramRate,
      minimumGram,
      maturePeriod,
      interestRepaymentMonths,
      documentCharges,
      penaltyPercent
    });

    // --- AUTOMATED GOLD STOCK LEDGER CREATION ---
    if (newLoan.articles && newLoan.articles.length > 0) {
      const stockPromises = newLoan.articles.map(article => {
        return GoldStock.create({
          loanId: newLoan.loanId,
          customerId: newLoan.customerId,
          customerName: newLoan.name,
          articleName: article.category || 'Unknown',
          articleType: article.details || 'Unknown',
          quantity: article.qty || 1,
          grossWeight: article.totWt || 0,
          netWeight: article.nettWt || 0,
          purity: article.purity || 'Unknown',
          appraisedValue: article.total || 0,
          status: 'In Stock',
          stockDate: newLoan.loanDate || Date.now()
        });
      });
      await Promise.all(stockPromises);
    }
    // --------------------------------------------

    res.status(201).json(newLoan);
  } catch (error) { next(error); }
};

// @desc    Get next loan ID preview
// @route   GET /api/loans/next-id
// @access  Public
const getNextLoanIdPreview = async (req, res, next) => {
  try {
    const nextId = await Loan.getNextIdPreview();
    res.status(200).json({ nextId });
  } catch (error) { next(error); }
};

// @desc    Get loan by ID or LoanId
// @route   GET /api/loans/:id
// @access  Public
const getLoanById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.loanId = id;
    }

    const loan = await Loan.findOne(query).populate('customerObjectId');

    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    res.json(loan);
  } catch (error) { next(error); }
};

// @desc    Get all loans for a customer
// @route   GET /api/loans/customer/:customerId
// @access  Public
const getLoansByCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const loans = await Loan.find({ customerId }).sort({ createdAt: -1 }).populate('customerObjectId');
    res.json(loans);
  } catch (error) { next(error); }
};

// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Public
const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.loanId = id;
    }

    const loan = await Loan.findOne(query);

    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    const updatedLoan = await Loan.findOneAndUpdate(
      query,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (updatedLoan && req.body.status) {
        await syncGoldStockStatus(updatedLoan.loanId, updatedLoan.status);
    }

    res.json(updatedLoan);
  } catch (error) { next(error); }
};

// @desc    Update loan status only (for Repledge / Change Status module)
// @route   PUT /api/loans/status/:loanId
// @access  Public
const updateLoanStatus = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new ApiError(400, 'status is required' ));
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(loanId)) {
      query._id = loanId;
    } else {
      query.loanId = loanId;
    }

    const loan = await Loan.findOne(query);
    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    if (loan.status === 'Closed') {
      return next(new ApiError(400, 'Cannot change status of a Closed loan' ));
    }

    const oldStatus = loan.status;
    await Loan.updateOne({ _id: loan._id }, { $set: { status: status } });
    loan.status = status;

    await syncGoldStockStatus(loan.loanId, loan.status);

    if (status === 'Approved' && oldStatus !== 'Approved') {
        const { postLedgerEntry } = require('../services/ledgerService');
        const voucherInfo = {
            voucherNumber: `PV${Math.floor(100000 + Math.random() * 900000)}`,
            voucherType: 'Loan',
            referenceModule: 'Loan',
            referenceId: loan.loanId,
            remarks: `Loan Disbursement to ${loan.name}`,
            createdBy: req.user ? req.user._id : null
        };
        try {
            await postLedgerEntry('Loan Receivable', loan.loanAmount || 0, 'Debit', voucherInfo);
            await postLedgerEntry('Cash', loan.loanAmount || 0, 'Credit', voucherInfo);
        } catch(err) {
            console.error("Ledger posting failed:", err);
        }
    }

    res.json(loan);
  } catch (error) { next(error); }
};

// @desc    Get loans by status (for reports tab)
// @route   GET /api/loans/by-status/:status
// @access  Public
const getLoansByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const loans = await Loan.find({ status }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) { next(error); }
};

// @desc    Get all loans
// @route   GET /api/loans
// @access  Public
const getAllLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) { next(error); }
};

module.exports = {
  createLoan,
  getLoanById,
  getLoansByCustomer,
  updateLoan,
  updateLoanStatus,
  getLoansByStatus,
  getAllLoans,
  getNextLoanIdPreview
};
