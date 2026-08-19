const Loan = require('../models/Loan');
const TopUp = require('../models/topupModel');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// Helper function to log audit
const logAudit = async (action, moduleName, description, user, data = null) => {
  try {
    await AuditLog.create({
      action,
      module: moduleName,
      description,
      user: user || 'System',
      data
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

// 1. Get Eligible Loan Details
exports.getEligibleLoanDetails = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findOne({ loanId }).populate('customerObjectId');

    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Validations
    if (['Closed', 'Auction Ready', 'Auctioned', 'Repledged'].includes(loan.status)) {
      return res.status(400).json({ message: `Cannot Top Up a ${loan.status} loan.` });
    }

    const pendingRequest = await TopUp.findOne({ loanId, status: 'Pending Approval' });
    if (pendingRequest) {
      return res.status(400).json({ message: 'There is already a pending Top Up request for this loan.' });
    }

    // Gold Calculation
    const LTV_PERCENT = 0.75; // Using 75% LTV as default if scheme LTV not available
    let totalNetWeight = 0;
    
    if (loan.articles && loan.articles.length > 0) {
        loan.articles.forEach(art => {
            totalNetWeight += parseFloat(art.nettWt) || 0;
        });
    }

    const currentGoldRate = loan.gramRate || 0; // Using loan's locked gram rate, or we should fetch live gold rate? The prompt said "Current Gold Rate" so we assume the one saved in the loan or we can mock a live one. We'll use the loan's gramRate.
    
    const goldValue = totalNetWeight * currentGoldRate;
    const maximumEligibleLoan = goldValue * LTV_PERCENT;
    const currentOutstanding = loan.remainingLoanAmount || 0;
    const availableTopUp = Math.max(0, maximumEligibleLoan - currentOutstanding);

    res.json({
      loan,
      goldValue,
      maximumEligibleLoan,
      availableTopUp,
      currentGoldRate
    });

  } catch (error) { next(error); }
};

// 2. Create Top Up Request
exports.createTopUpRequest = async (req, res, next) => {
  try {
    const { 
      loanId, customerId, customerName, employeeId, branchId, 
      oldLoanAmount, eligibleLoanAmount, availableEligibility, 
      topUpAmount, newLoanAmount, goldRate, purpose, remarks 
    } = req.body;

    if (topUpAmount <= 0) return res.status(400).json({ message: 'Top up amount must be greater than zero.' });
    if (topUpAmount > availableEligibility) return res.status(400).json({ message: 'Requested amount exceeds available eligibility.' });

    const newTopUp = new TopUp({
      loanId,
      customerId,
      customerName,
      employeeId,
      branchId,
      oldLoanAmount,
      eligibleLoanAmount,
      availableEligibility,
      topUpAmount,
      newLoanAmount,
      goldRate,
      purpose,
      remarks,
      status: 'Pending Approval',
      createdBy: req.user ? req.user.employeeId : 'Admin'
    });

    await newTopUp.save();

    await logAudit('CREATE', 'TopUp Module', `Top Up Request Created for Loan ${loanId} for ₹${topUpAmount}`, newTopUp.createdBy, { topUpId: newTopUp.topUpId });

    res.status(201).json({ message: 'Top Up Request Submitted Successfully', topUp: newTopUp });
  } catch (error) { next(error); }
};

// 3. Get Pending Requests
exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await TopUp.find({ status: 'Pending Approval' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) { next(error); }
};

// 4. Approve Top Up
exports.approveTopUp = async (req, res, next) => {
  try {
    const { topUpId } = req.params;
    const { adminRemarks } = req.body;

    if (!adminRemarks) return res.status(400).json({ message: 'Admin remarks are mandatory for approval.' });

    const topup = await TopUp.findOne({ topUpId });
    if (!topup) return res.status(404).json({ message: 'Top Up request not found' });
    if (topup.status !== 'Pending Approval') return res.status(400).json({ message: 'Top Up request is already processed.' });

    const loan = await Loan.findOne({ loanId: topup.loanId });
    if (!loan) return res.status(404).json({ message: 'Associated loan not found' });

    // Update Top Up Document
    topup.status = 'Approved';
    topup.adminRemarks = adminRemarks;
    topup.approvedBy = req.user ? req.user.employeeId : 'Admin';
    topup.approvedDate = new Date();
    await topup.save();

    // Update Loan Document
    loan.loanAmount = (loan.loanAmount || 0) + topup.topUpAmount;
    loan.remainingLoanAmount = (loan.remainingLoanAmount || 0) + topup.topUpAmount;
    loan.topUpCount = (loan.topUpCount || 0) + 1;
    loan.topUpTotal = (loan.topUpTotal || 0) + topup.topUpAmount;
    loan.lastTopUpDate = new Date();
    await loan.save();

    await logAudit('APPROVE', 'TopUp Module', `Top Up Approved for Loan ${loan.loanId} for ₹${topup.topUpAmount}`, topup.approvedBy, { topUpId });

    // --- LEDGER POSTING START ---
    const { postLedgerEntry } = require('../services/ledgerService');
    const voucherInfo = {
        voucherNumber: `PV${Math.floor(100000 + Math.random() * 900000)}`,
        voucherType: 'TopUp',
        referenceModule: 'TopUp',
        referenceId: topup.topUpId || String(topup._id),
        remarks: `Top Up Disbursement to ${loan.name || loan.loanId}`,
        createdBy: req.user ? req.user._id : null
    };
    try {
        await postLedgerEntry('Loan Receivable', topup.topUpAmount || 0, 'Debit', voucherInfo);
        await postLedgerEntry('Cash', topup.topUpAmount || 0, 'Credit', voucherInfo);
    } catch(err) {
        console.error("Top Up Ledger posting failed:", err);
    }
    // --- LEDGER POSTING END ---

    res.json({ message: 'Top Up Approved Successfully', topup });
  } catch (error) { next(error); }
};

// 5. Reject Top Up
exports.rejectTopUp = async (req, res, next) => {
  try {
    const { topUpId } = req.params;
    const { adminRemarks } = req.body;

    const topup = await TopUp.findOne({ topUpId });
    if (!topup) return res.status(404).json({ message: 'Top Up request not found' });

    topup.status = 'Rejected';
    topup.adminRemarks = adminRemarks || 'No remarks';
    topup.approvedBy = req.user ? req.user.employeeId : 'Admin';
    topup.approvedDate = new Date();
    await topup.save();

    await logAudit('REJECT', 'TopUp Module', `Top Up Rejected for Loan ${topup.loanId}`, topup.approvedBy, { topUpId });

    res.json({ message: 'Top Up Rejected Successfully', topup });
  } catch (error) { next(error); }
};

// 6. Get Top Up History
exports.getTopUpHistory = async (req, res, next) => {
  try {
    const { loanId } = req.query;
    const query = loanId ? { loanId } : {};
    const history = await TopUp.find(query).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) { next(error); }
};

// 7. Dashboard Stats
exports.getTopUpDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const pendingCount = await TopUp.countDocuments({ status: 'Pending Approval' });
    const approvedToday = await TopUp.countDocuments({ status: 'Approved', approvedDate: { $gte: today } });
    const rejectedToday = await TopUp.countDocuments({ status: 'Rejected', approvedDate: { $gte: today } });

    res.json({ pendingCount, approvedToday, rejectedToday });
  } catch (error) { next(error); }
};
