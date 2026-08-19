const LoanRequest = require('../models/LoanRequest');
const { Customer } = require('../models/Customer');
const ApiError = require('../utils/ApiError');

// @desc    Create new loan request
// @route   POST /api/loan-requests
// @access  Private
const createLoanRequest = async (req, res, next) => {
  try {
    const { customerId, customerName, mobileNo, loanType, requestedAmount, reason, remarks } = req.body;

    if (!customerId || !customerName || !loanType || !requestedAmount) {
      return next(new ApiError(400, 'Customer ID, Name, Loan Type and Requested Amount are required'));
    }

    const requestedBy = req.user ? (req.user.name || req.user.username) : 'System';

    const newRequest = await LoanRequest.create({
      customerId,
      customerName,
      mobileNo,
      loanType,
      requestedAmount,
      reason,
      remarks,
      requestedBy
    });

    res.status(201).json({
      success: true,
      message: 'Loan request submitted successfully',
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all loan requests
// @route   GET /api/loan-requests
// @access  Private
const getAllLoanRequests = async (req, res, next) => {
  try {
    const { status, customerId, customerName, mobileNo } = req.query;
    let query = {};

    if (status) query.status = status;
    if (customerId) query.customerId = { $regex: new RegExp(customerId, 'i') };
    if (customerName) query.customerName = { $regex: new RegExp(customerName, 'i') };
    if (mobileNo) query.mobileNo = { $regex: new RegExp(mobileNo, 'i') };

    const requests = await LoanRequest.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan request status (Approve/Reject)
// @route   PUT /api/loan-requests/status/:id
// @access  Private
const updateLoanRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return next(new ApiError(400, 'Invalid status value'));
    }

    const loanReq = await LoanRequest.findById(id);
    if (!loanReq) {
      return next(new ApiError(404, 'Loan request not found'));
    }

    loanReq.status = status;
    if (remarks) {
      loanReq.remarks = remarks;
    }
    await loanReq.save();

    res.json({
      success: true,
      message: `Loan request successfully ${status.toLowerCase()}`,
      data: loanReq
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLoanRequest,
  getAllLoanRequests,
  updateLoanRequestStatus
};
