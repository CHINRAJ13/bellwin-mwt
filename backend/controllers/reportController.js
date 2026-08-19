const ApiError = require('../utils/ApiError');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const TopUp = require('../models/topupModel');
const Repledge = require('../models/Repledge');
const Customer = require('../models/Customer').Customer;
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Remittance = require('../models/Remittance');
const Denomination = require('../models/Denomination');
const GoldStock = require('../models/GoldStock');


// @desc    Get Daily Summary Report
// @route   GET /api/reports/daily-summary
// @access  Public
const getDailySummary = async (req, res, next) => {
  try {
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    
    // Create UTC bounds for the day to match properly regardless of local time offsets
    const startOfDay = new Date(queryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(queryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const dateFilter = { $gte: startOfDay, $lte: endOfDay };

    // 1. Loans Created Today
    const loansToday = await Loan.find({ loanDate: dateFilter });
    const totalLoansCreated = loansToday.length;
    const totalLoanAmount = loansToday.reduce((sum, loan) => sum + (parseFloat(loan.loanAmount) || 0), 0);

    // 2. Payments Received Today
    const paymentsToday = await Payment.find({ paymentDate: dateFilter });
    const totalPaymentsReceivedCount = paymentsToday.length;
    const totalPaymentsAmount = paymentsToday.reduce((sum, p) => sum + (parseFloat(p.paymentAmount) || 0), 0);
    const totalInterestCollected = paymentsToday.reduce((sum, p) => sum + (parseFloat(p.interestAmount) || 0), 0);
    const totalPrincipalCollected = paymentsToday.reduce((sum, p) => sum + (parseFloat(p.principalAmount) || 0), 0);

    // 3. Top Ups Today
    const topupsToday = await TopUp.find({ topupDate: dateFilter });
    const totalTopUpsCount = topupsToday.length;
    const totalTopUpsAmount = topupsToday.reduce((sum, t) => sum + (parseFloat(t.topupAmount) || 0), 0);

    // 4. Repledges Today
    const repledgesToday = await Repledge.find({ repledgeDate: dateFilter });
    const totalRepledgesCount = repledgesToday.length;

    // 5. Closed Loans Today
    // A loan is considered closed today if it has a Full Settlement payment today.
    // Alternatively, we check payments of type 'Full Settlement' today.
    const fullSettlementsToday = paymentsToday.filter(p => p.paymentType === 'Full Settlement');
    const closedLoansCount = fullSettlementsToday.length;

    res.json({
      date: queryDate.toISOString().split('T')[0],
      totalLoansCreated,
      totalLoanAmount,
      totalPaymentsReceivedCount,
      totalPaymentsAmount,
      totalInterestCollected,
      totalPrincipalCollected,
      totalTopUpsCount,
      totalTopUpsAmount,
      totalRepledgesCount,
      closedLoansCount
    });
  } catch (error) { next(error); }
};

// @desc    Get Loan Report
// @route   GET /api/reports/loan-report
// @access  Public
const getLoanReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;
    let query = {};

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') }; // Case-insensitive partial match
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      loanDate: loan.loanDate,
      loanAmount: parseFloat(loan.loanAmount) || 0,
      remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
      status: loan.status,
      createdAt: loan.createdAt
    }));

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Loan Outstanding Report
// @route   GET /api/reports/loan-outstanding
// @access  Public
const getLoanOutstandingReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;
    let query = {
      remainingLoanAmount: { $gt: 0 },
      status: { $ne: 'Closed' } // Business rule: never include closed loans
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      loanDate: loan.loanDate,
      loanAmount: parseFloat(loan.loanAmount) || 0,
      remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
      status: loan.status,
      interestRate: parseFloat(loan.interestRate) || 0,
      remainingDays: parseInt(loan.remainingDays) || 0
    }));

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Interest Pending Report
// @route   GET /api/reports/interest-pending
// @access  Public
const getInterestPendingReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;
    let query = {
      status: { $in: ['Active', 'Overdue', 'TopUp', 'Repledged'] } // Business rule: only these statuses
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      loanDate: loan.loanDate,
      loanAmount: parseFloat(loan.loanAmount) || 0,
      interestRate: parseFloat(loan.interestRate) || 0,
      totalPaidInterestAmount: parseFloat(loan.totalPaidInterestAmount) || 0,
      remainingInterestAmount: parseFloat(loan.remainingInterestAmount) || 0,
      status: loan.status
    }));

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Closed Accounts Report
// @route   GET /api/reports/closed-accounts
// @access  Public
const getClosedAccountsReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId } = req.query;
    let query = {
      status: 'Closed'
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    // Fetch payments to get settlement details
    const loanIds = loans.map(l => l.loanId);
    const fullSettlements = await Payment.find({
      loanId: { $in: loanIds },
      paymentType: 'Full Settlement'
    });

    const formattedLoans = loans.map(loan => {
      const settlement = fullSettlements.find(p => p.loanId === loan.loanId);
      return {
        loanId: loan.loanId,
        customerId: loan.customerId,
        customerName: loan.name,
        loanDate: loan.loanDate,
        loanAmount: parseFloat(loan.loanAmount) || 0,
        settlementAmount: settlement ? (parseFloat(settlement.paymentAmount) || 0) : 0,
        closedDate: settlement ? settlement.paymentDate : loan.updatedAt,
        status: loan.status
      };
    });

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Repledge Report
// @route   GET /api/reports/repledge-report
// @access  Public
const getRepledgeReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, loanId, customerId } = req.query;
    let query = {};

    if (fromDate || toDate) {
      query.repledgeDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.repledgeDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.repledgeDate.$lte = end;
      }
    }

    if (loanId) {
      query.loanId = { $regex: new RegExp(loanId, 'i') };
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    const repledges = await Repledge.find(query).sort({ repledgeDate: -1, createdAt: -1 });

    const formattedRepledges = repledges.map(rep => ({
      repledgeId: rep.repledgeId,
      loanId: rep.loanId,
      customerId: rep.customerId,
      customerName: rep.customerName,
      oldStatus: rep.oldStatus,
      newStatus: rep.newStatus,
      previousLoanAmount: parseFloat(rep.remainingLoanAmount || rep.oldLoanAmount) || 0,
      newLoanAmount: (parseFloat(rep.remainingLoanAmount || rep.oldLoanAmount) || 0) + (parseFloat(rep.additionalLoanAmount) || 0),
      repledgeDate: rep.repledgeDate,
      remarks: rep.remarks || ''
    }));

    res.json(formattedRepledges);
  } catch (error) { next(error); }
};

// @desc    Get Account Summary Report
// @route   GET /api/reports/account-summary
// @access  Public
const getAccountSummaryReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let loanQuery = {};
    let paymentQuery = {};
    let topupQuery = {};
    let repledgeQuery = {};
    let customerQuery = {};

    if (fromDate || toDate) {
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        loanQuery.loanDate = { ...loanQuery.loanDate, $gte: start };
        paymentQuery.paymentDate = { ...paymentQuery.paymentDate, $gte: start };
        topupQuery.topupDate = { ...topupQuery.topupDate, $gte: start };
        repledgeQuery.repledgeDate = { ...repledgeQuery.repledgeDate, $gte: start };
        customerQuery.createdAt = { ...customerQuery.createdAt, $gte: start };
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        loanQuery.loanDate = { ...loanQuery.loanDate, $lte: end };
        paymentQuery.paymentDate = { ...paymentQuery.paymentDate, $lte: end };
        topupQuery.topupDate = { ...topupQuery.topupDate, $lte: end };
        repledgeQuery.repledgeDate = { ...repledgeQuery.repledgeDate, $lte: end };
        customerQuery.createdAt = { ...customerQuery.createdAt, $lte: end };
      }
    }

    // Parallel fetch
    const [loans, payments, topups, repledges, customers] = await Promise.all([
      Loan.find(loanQuery),
      Payment.find(paymentQuery),
      TopUp.find(topupQuery),
      Repledge.find(repledgeQuery),
      Customer.find(customerQuery)
    ]);

    const totalCustomers = customers.length;
    const totalLoans = loans.length;
    
    let totalLoanAmount = 0;
    let totalOutstandingAmount = 0;
    let closedLoanCount = 0;
    
    loans.forEach(loan => {
      totalLoanAmount += parseFloat(loan.loanAmount) || 0;
      totalOutstandingAmount += parseFloat(loan.remainingLoanAmount) || 0;
      if (loan.status === 'Closed') {
        closedLoanCount++;
      }
    });

    let totalPaymentsReceived = 0;
    let totalPrincipalCollected = 0;
    let totalInterestCollected = 0;

    payments.forEach(payment => {
      totalPaymentsReceived += parseFloat(payment.paymentAmount) || 0;
      totalPrincipalCollected += parseFloat(payment.principalAmount) || 0;
      totalInterestCollected += parseFloat(payment.interestAmount) || 0;
    });

    let totalTopUpAmount = 0;
    topups.forEach(topup => {
      totalTopUpAmount += parseFloat(topup.topupAmount) || 0;
    });

    const totalRepledgeCount = repledges.length;

    res.json({
      totalCustomers,
      totalLoans,
      totalLoanAmount,
      totalOutstandingAmount,
      totalPaymentsReceived,
      totalPrincipalCollected,
      totalInterestCollected,
      totalTopUpAmount,
      totalRepledgeCount,
      closedLoanCount
    });

  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY COLLECTION REPORT — Reusable Helpers
// ═══════════════════════════════════════════════════════════════════════════════
// These helpers are shared across getTodayCollectionReport, getTodayCollectionById,
// and exportTodayCollection to avoid duplicating aggregation logic.

/**
 * Build the initial $match query for today's collection pipeline.
 * Handles date range (defaults to today), optional filters, and employee visibility.
 *
 * @param {Object} query - req.query parameters
 * @param {Object|null} user - req.user (populated with employeeId)
 * @returns {Object} MongoDB $match query
 */
const buildTodayCollectionMatch = (query, user) => {
  const { fromDate, toDate, customerId, loanId, paymentMode, employee, fromTime, toTime } = query;

  // Date range — default to today
  let start, end;
  if (fromDate || toDate) {
    start = fromDate ? new Date(fromDate) : new Date();
    start.setUTCHours(0, 0, 0, 0);
    end = toDate ? new Date(toDate) : new Date(start);
    end.setUTCHours(23, 59, 59, 999);
  } else {
    start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    end = new Date();
    end.setUTCHours(23, 59, 59, 999);
  }

  // Apply time-of-day filters within the date range
  if (fromTime) {
    const [h, m] = fromTime.split(':').map(Number);
    start.setUTCHours(h, m, 0, 0);
  }
  if (toTime) {
    const [h, m] = toTime.split(':').map(Number);
    end.setUTCHours(h, m, 59, 999);
  }

  const matchQuery = {
    paymentDate: { $gte: start, $lte: end }
  };

  // Optional direct filters (pre-lookup — these fields exist on Payment)
  if (customerId) matchQuery.customerId = { $regex: new RegExp(customerId, 'i') };
  if (loanId) matchQuery.loanId = { $regex: new RegExp(loanId, 'i') };
  if (paymentMode) matchQuery.paymentMode = { $regex: new RegExp(paymentMode, 'i') };
  if (employee) matchQuery.collectedBy = { $regex: new RegExp(employee, 'i') };

  // ── Employee visibility scoping ──────────────────────────────────────────
  // Restrict normal employees to their own collections only.
  // Admin, HR, Super Admin, and Manager get full access.
  if (user) {
    const userRole = user.role;                      // 'admin' | 'hr' | 'employee'
    const employeeDoc = user.employeeId;             // Populated Employee document
    const employeeRole = employeeDoc?.role;           // 'Super Admin' | 'Manager' | 'Employee'

    const isFullAccess = ['admin', 'hr'].includes(userRole)
      || ['Super Admin', 'Manager'].includes(employeeRole);

    if (!isFullAccess && employeeDoc) {
      // FALLBACK: Payment schema lacks an employee ObjectId/code field.
      // Matching on collectedBy (name string) until an employeeId field is added.
      // TODO: Replace with Payment.employeeId once the schema is updated.
      const fullName = employeeDoc.firstName + ' ' + employeeDoc.lastName;
      matchQuery.collectedBy = { $regex: new RegExp('^' + fullName + '$', 'i') };
    }
  }

  return matchQuery;
};

/**
 * Build common $lookup, $unwind, and $addFields stages.
 * Joins: customers, loans, employees (via collectedBy name match).
 * Resolves branch using cascading priority.
 *
 * @returns {Array} Array of aggregation pipeline stages
 */
const buildCommonLookupStages = () => [
  // 1. Lookup customer details
  {
    $lookup: {
      from: 'customers',
      localField: 'customerId',
      foreignField: 'customerId',
      as: 'customerDetails'
    }
  },
  { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },

  // 2. Lookup loan details (for schemeName, loanId enrichment)
  {
    $lookup: {
      from: 'loans',
      localField: 'loanId',
      foreignField: 'loanId',
      as: 'loanDetails'
    }
  },
  { $unwind: { path: '$loanDetails', preserveNullAndEmptyArrays: true } },

  // 3. Lookup employee details via collectedBy name match
  // FALLBACK: collectedBy is a name string, not an ObjectId reference.
  // TODO: Replace with direct ObjectId lookup once Payment schema has employeeId.
  {
    $lookup: {
      from: 'employees',
      let: { collectorName: { $ifNull: ['$collectedBy', ''] } },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: [
                { $concat: ['$firstName', ' ', '$lastName'] },
                '$$collectorName'
              ]
            }
          }
        },
        { $limit: 1 }
      ],
      as: 'employeeDetails'
    }
  },
  { $unwind: { path: '$employeeDetails', preserveNullAndEmptyArrays: true } },

  // 4. Resolve branch using cascading priority:
  //    Payment.branch → Loan.branch → Employee.branch → Customer.branch → 'N/A'
  {
    $addFields: {
      resolvedBranch: {
        $ifNull: [
          '$branch',                      // 1. Payment.branch (future-proof)
          '$loanDetails.branch',           // 2. Loan.branch (future-proof)
          '$employeeDetails.branch',       // 3. Employee.branch (currently available)
          '$customerDetails.branch',       // 4. Customer.branch (future-proof)
          'N/A'                            // 5. Fallback
        ]
      }
    }
  }
];

/**
 * Build a post-lookup $match stage for search across 6 fields.
 * Uses case-insensitive regex matching.
 *
 * @param {string|undefined} search - Search term from query params
 * @returns {Object|null} $match stage or null if no search term
 */
const buildSearchStage = (search) => {
  if (!search || !search.trim()) return null;

  const regex = new RegExp(search.trim(), 'i');

  return {
    $match: {
      $or: [
        { paymentId: regex },                            // Receipt Number
        { customerId: regex },                           // Customer ID
        { 'customerDetails.customerName': regex },       // Customer Name
        { 'customerDetails.mobileNumber': regex },       // Mobile Number
        { loanId: regex },                               // Loan Number
        { 'loanDetails.schemeName': regex }              // Scheme Name
      ]
    }
  };
};

/**
 * Build a $sort stage with dynamic field mapping and validation.
 * Falls back to { paymentDate: -1, createdAt: -1 } if sortBy is invalid.
 *
 * @param {string|undefined} sortBy - Field name to sort by
 * @param {string|undefined} order - 'asc' or 'desc'
 * @returns {Object} $sort stage
 */
const buildSortStage = (sortBy, order) => {
  // Whitelist: query param value → actual aggregation field
  const sortFieldMap = {
    paymentDate: 'paymentDate',
    amount: 'paymentAmount',
    customerName: 'customerDetails.customerName',
    customerId: 'customerId',
    paymentMode: 'paymentMode',
    receiptNumber: 'paymentId'
  };

  const sortField = sortFieldMap[sortBy];
  const sortOrder = order === 'asc' ? 1 : -1;

  // Default sort: newest first
  if (!sortField) {
    return { $sort: { paymentDate: -1, createdAt: -1 } };
  }

  const sortSpec = { [sortField]: sortOrder };
  // Add secondary sort for stable ordering
  if (sortField !== 'createdAt') {
    sortSpec.createdAt = -1;
  }

  return { $sort: sortSpec };
};

/**
 * Build the summary branch stages for use inside $facet.
 * Computes totals, payment-mode breakdowns, avg/max/min, and legacy fields.
 *
 * @returns {Array} Array of aggregation stages for the summary facet branch
 */
const buildSummaryFacet = () => [
  {
    $group: {
      _id: null,
      totalCollections: { $sum: 1 },
      totalAmount: { $sum: '$paymentAmount' },
      cash: {
        $sum: {
          $cond: [{ $regexMatch: { input: { $ifNull: ['$paymentMode', ''] }, regex: /^cash$/i } }, '$paymentAmount', 0]
        }
      },
      upi: {
        $sum: {
          $cond: [{ $regexMatch: { input: { $ifNull: ['$paymentMode', ''] }, regex: /^upi$/i } }, '$paymentAmount', 0]
        }
      },
      card: {
        $sum: {
          $cond: [{ $regexMatch: { input: { $ifNull: ['$paymentMode', ''] }, regex: /^card$/i } }, '$paymentAmount', 0]
        }
      },
      bankTransfer: {
        $sum: {
          $cond: [{ $regexMatch: { input: { $ifNull: ['$paymentMode', ''] }, regex: /^bank.?transfer$/i } }, '$paymentAmount', 0]
        }
      },
      cheque: {
        $sum: {
          $cond: [{ $regexMatch: { input: { $ifNull: ['$paymentMode', ''] }, regex: /^cheque$/i } }, '$paymentAmount', 0]
        }
      },
      averageCollection: { $avg: '$paymentAmount' },
      highestCollection: { $max: '$paymentAmount' },
      lowestCollection: { $min: '$paymentAmount' },
      // Legacy fields for backward compatibility
      totalPrincipalCollection: { $sum: { $ifNull: ['$principalAmount', 0] } },
      totalInterestCollection: { $sum: { $ifNull: ['$interestAmount', 0] } },
      totalDocumentCharges: { $sum: { $ifNull: ['$penaltyAmount', 0] } },
      uniqueCustomers: { $addToSet: '$customerId' }
    }
  }
];

/**
 * Build the $project stage for today collection data output.
 * Includes both new fields (per requirement) and legacy fields (backward compat).
 *
 * @returns {Object} $project stage
 */
const buildDataProjection = () => ({
  $project: {
    _id: 1,
    receiptNumber: '$paymentId',
    customerId: '$customerId',
    customerName: { $ifNull: ['$customerDetails.customerName', 'Unknown Customer'] },
    mobile: { $ifNull: ['$customerDetails.mobileNumber', ''] },
    loanNumber: { $ifNull: ['$loanId', ''] },
    schemeName: { $ifNull: ['$loanDetails.schemeName', ''] },
    amount: '$paymentAmount',
    principalAmount: { $ifNull: ['$principalAmount', 0] },
    interestAmount: { $ifNull: ['$interestAmount', 0] },
    documentCharges: { $ifNull: ['$penaltyAmount', 0] },
    totalAmount: {
      $add: [
        { $ifNull: ['$principalAmount', 0] },
        { $ifNull: ['$interestAmount', 0] },
        { $ifNull: ['$penaltyAmount', 0] }
      ]
    },
    paymentMode: '$paymentMode',
    paymentType: '$paymentType',
    collectedBy: { $ifNull: ['$collectedBy', ''] },
    branch: '$resolvedBranch',
    paymentDate: '$paymentDate',
    paymentTime: { $dateToString: { format: '%H:%M:%S', date: '$paymentDate' } },
    remarks: { $ifNull: ['$remarks', ''] },
    status: { $literal: 'Success' },
    transactionRef: { $ifNull: ['$transactionRef', ''] },
    // ── Legacy fields (backward compatibility with existing frontend) ──
    date: '$paymentDate',
    loanId: '$loanId',
    employeeName: { $ifNull: ['$collectedBy', ''] }
  }
});

/**
 * Build the pagination branch stages for use inside $facet.
 * Applies sort → skip → limit → project.
 *
 * @param {number} page - Current page number (1-indexed)
 * @param {number} limit - Records per page
 * @param {Object} sortStage - $sort stage from buildSortStage()
 * @returns {Array} Array of aggregation stages for the data facet branch
 */
const buildPaginationFacet = (page, limit, sortStage) => {
  const skip = (page - 1) * limit;
  return [
    sortStage,
    { $skip: skip },
    { $limit: limit },
    buildDataProjection()
  ];
};

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY COLLECTION REPORT — Controller Functions
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Get Today Collection Report (paginated, with summary)
// @route   GET /api/reports/today-collection
// @access  Protected — Admin, HR, Employee (scoped)
const getTodayCollectionReport = async (req, res, next) => {
  try {
    const { search, sortBy, order, branch } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));

    // 1. Build initial match (date, filters, employee visibility)
    const matchQuery = buildTodayCollectionMatch(req.query, req.user);

    // 2. Build pipeline
    const sortStage = buildSortStage(sortBy, order);
    const searchStage = buildSearchStage(search);

    const pipeline = [
      { $match: matchQuery },
      ...buildCommonLookupStages()
    ];

    // Branch filter (post-lookup, since branch is resolved from Employee)
    if (branch) {
      pipeline.push({ $match: { resolvedBranch: { $regex: new RegExp(branch, 'i') } } });
    }

    // Search (post-lookup, matches against joined fields)
    if (searchStage) {
      pipeline.push(searchStage);
    }

    // 3. $facet: summary + paginated data + total count in one query
    pipeline.push({
      $facet: {
        summary: buildSummaryFacet(),
        data: buildPaginationFacet(page, limit, sortStage),
        count: [{ $count: 'total' }]
      }
    });

    const [result] = await Payment.aggregate(pipeline);

    // 4. Format response
    const summaryRaw = result.summary[0] || {};
    const totalRecords = result.count[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 0;

    const summary = {
      // ── New fields (user requirement) ──
      totalCollections: summaryRaw.totalCollections || 0,
      totalAmount: summaryRaw.totalAmount || 0,
      cash: summaryRaw.cash || 0,
      upi: summaryRaw.upi || 0,
      card: summaryRaw.card || 0,
      bankTransfer: summaryRaw.bankTransfer || 0,
      cheque: summaryRaw.cheque || 0,
      averageCollection: Math.round((summaryRaw.averageCollection || 0) * 100) / 100,
      highestCollection: summaryRaw.highestCollection || 0,
      lowestCollection: summaryRaw.lowestCollection || 0,
      // ── Legacy fields (backward compatibility) ──
      totalCollectionAmount: summaryRaw.totalAmount || 0,
      totalPrincipalCollection: summaryRaw.totalPrincipalCollection || 0,
      totalInterestCollection: summaryRaw.totalInterestCollection || 0,
      totalDocumentCharges: summaryRaw.totalDocumentCharges || 0,
      totalCustomersCollected: summaryRaw.uniqueCustomers?.length || 0
    };

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page
      },
      data: result.data,
      tableData: result.data  // Backward compatibility with existing frontend
    });
  } catch (error) { next(error); }
};

// @desc    Get single collection record by receipt ID
// @route   GET /api/reports/today-collection/:receiptId
// @access  Protected — Admin, HR, Employee (scoped)
const getTodayCollectionById = async (req, res, next) => {
  try {
    const { receiptId } = req.params;

    if (!receiptId) {
      return next(new ApiError(400, 'Receipt ID is required'));
    }

    const pipeline = [
      { $match: { paymentId: receiptId } },
      ...buildCommonLookupStages(),
      buildDataProjection()
    ];

    const results = await Payment.aggregate(pipeline);

    if (!results || results.length === 0) {
      return next(new ApiError(404, 'Receipt not found'));
    }

    // ── Employee visibility check ──────────────────────────────────────────
    const userRole = req.user.role;
    const employeeDoc = req.user.employeeId;
    const employeeRole = employeeDoc?.role;
    const isFullAccess = ['admin', 'hr'].includes(userRole)
      || ['Super Admin', 'Manager'].includes(employeeRole);

    if (!isFullAccess && employeeDoc) {
      // FALLBACK: Match collectedBy name string
      // TODO: Replace with Payment.employeeId once the schema is updated.
      const fullName = employeeDoc.firstName + ' ' + employeeDoc.lastName;
      if ((results[0].collectedBy || '').toLowerCase() !== fullName.toLowerCase()) {
        return next(new ApiError(403, 'Access denied: You can only view your own collections'));
      }
    }

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      data: results[0]
    });
  } catch (error) { next(error); }
};

// @desc    Export today's collection (all records, no pagination)
// @route   GET /api/reports/today-collection/export
// @access  Protected — Admin, HR, Employee (scoped)
const exportTodayCollection = async (req, res, next) => {
  try {
    const { search, sortBy, order, branch, format } = req.query;

    // 1. Build initial match (date, filters, employee visibility)
    const matchQuery = buildTodayCollectionMatch(req.query, req.user);

    // 2. Build pipeline (no pagination)
    const sortStage = buildSortStage(sortBy, order);
    const searchStage = buildSearchStage(search);

    const pipeline = [
      { $match: matchQuery },
      ...buildCommonLookupStages()
    ];

    // Branch filter (post-lookup)
    if (branch) {
      pipeline.push({ $match: { resolvedBranch: { $regex: new RegExp(branch, 'i') } } });
    }

    // Search (post-lookup)
    if (searchStage) {
      pipeline.push(searchStage);
    }

    // Sort + project (no skip/limit for export)
    pipeline.push(sortStage);
    pipeline.push(buildDataProjection());

    const data = await Payment.aggregate(pipeline);

    // 3. Format-aware response (extensible for CSV/Excel in the future)
    const exportFormat = (format || 'json').toLowerCase();

    switch (exportFormat) {
      // case 'csv':  // TODO: Implement CSV export using json2csv or similar
      // case 'xlsx': // TODO: Implement Excel export using exceljs or similar
      case 'json':
      default:
        return res.json({
          success: true,
          generatedAt: new Date().toISOString(),
          totalRecords: data.length,
          data
        });
    }
  } catch (error) { next(error); }
};

// @desc    Get Datewise Pending List Report
// @route   GET /api/reports/datewise-pending
// @access  Public
const getDatewisePendingReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId } = req.query;

    const query = {
      status: { $ne: 'Closed' },
      remainingLoanAmount: { $gt: 0 }
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = new RegExp(customerId, 'i');
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => {
      const today = new Date();
      const loanDate = new Date(loan.loanDate);
      const diffTime = Math.abs(today - loanDate);
      const pendingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        loanId: loan.loanId,
        customerId: loan.customerId,
        customerName: loan.name,
        loanDate: loan.loanDate,
        loanAmount: parseFloat(loan.loanAmount) || 0,
        remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
        remainingInterestAmount: parseFloat(loan.remainingInterestAmount) || 0,
        status: loan.status,
        pendingDays: pendingDays
      };
    });

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Cash Assets Report
// @route   GET /api/reports/cash-assets
// @access  Public
const getCashAssetsReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateQuery = {};
    if (fromDate || toDate) {
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        dateQuery.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    }

    const paymentQ = Object.keys(dateQuery).length > 0 ? { paymentDate: dateQuery } : {};
    const incomeQ = Object.keys(dateQuery).length > 0 ? { incomeDate: dateQuery } : {};
    const expenseQ = Object.keys(dateQuery).length > 0 ? { expenseDate: dateQuery } : {};

    const [payments, incomes, expenses] = await Promise.all([
      Payment.find(paymentQ),
      Income.find(incomeQ),
      Expense.find(expenseQ)
    ]);

    let transactions = [];
    let totalCashInflow = 0;
    let totalCashOutflow = 0;

    payments.forEach(p => {
      const amt = parseFloat(p.paymentAmount) || 0;
      totalCashInflow += amt;
      transactions.push({
        date: p.paymentDate,
        transactionType: 'Payment Received',
        referenceId: p.paymentId,
        description: `Payment for Loan ${p.loanId}`,
        amount: amt,
        flowType: 'Inflow'
      });
    });

    incomes.forEach(i => {
      const amt = parseFloat(i.amount) || 0;
      totalCashInflow += amt;
      transactions.push({
        date: i.incomeDate,
        transactionType: 'Other Income',
        referenceId: i.incomeId || '-',
        description: i.description,
        amount: amt,
        flowType: 'Inflow'
      });
    });

    expenses.forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      totalCashOutflow += amt;
      transactions.push({
        date: e.expenseDate,
        transactionType: 'Expense',
        referenceId: e.expenseId || '-',
        description: e.description,
        amount: amt,
        flowType: 'Outflow'
      });
    });

    // Sort newest first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      totalCashInflow,
      totalCashOutflow,
      netCashPosition: totalCashInflow - totalCashOutflow,
      totalTransactions: transactions.length,
      transactions
    });
  } catch (error) { next(error); }
};

// @desc    Get Auction Accounts Report
// @route   GET /api/reports/auction-accounts
// @access  Public
const getAuctionAccountsReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;

    const query = {
      status: { $in: ['Auction Ready', 'Auctioned'] }
    };

    if (status && ['Auction Ready', 'Auctioned'].includes(status)) {
      query.status = status;
    }

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = new RegExp(customerId, 'i');
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => {
      const today = new Date();
      const loanDate = new Date(loan.loanDate);
      const diffTime = Math.abs(today - loanDate);
      const pendingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        loanId: loan.loanId,
        customerId: loan.customerId,
        customerName: loan.name,
        loanDate: loan.loanDate,
        loanAmount: parseFloat(loan.loanAmount) || 0,
        remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
        status: loan.status,
        pendingDays: pendingDays
      };
    });

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Business Report
// @route   GET /api/reports/business-report
// @access  Public
const getBusinessReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateQuery = {};
    if (fromDate || toDate) {
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        dateQuery.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    }

    const loanQ = Object.keys(dateQuery).length > 0 ? { loanDate: dateQuery } : {};
    const paymentQ = Object.keys(dateQuery).length > 0 ? { paymentDate: dateQuery } : {};
    const topupQ = Object.keys(dateQuery).length > 0 ? { topupDate: dateQuery } : {};
    const repledgeQ = Object.keys(dateQuery).length > 0 ? { repledgeDate: dateQuery } : {};
    const incomeQ = Object.keys(dateQuery).length > 0 ? { incomeDate: dateQuery } : {};
    const expenseQ = Object.keys(dateQuery).length > 0 ? { expenseDate: dateQuery } : {};
    const customerQ = Object.keys(dateQuery).length > 0 ? { createdAt: dateQuery } : {};

    const [
      customers,
      loans,
      payments,
      topups,
      repledges,
      incomes,
      expenses
    ] = await Promise.all([
      Customer.find(customerQ),
      Loan.find(loanQ),
      Payment.find(paymentQ),
      TopUp.find(topupQ),
      Repledge.find(repledgeQ),
      Income.find(incomeQ),
      Expense.find(expenseQ)
    ]);

    // Customer Metrics
    const totalCustomers = customers.length;
    
    // Find active customers (those who have an active/overdue loan)
    const activeLoanCustomerIds = new Set(
      loans.filter(l => ['Active', 'Overdue', 'TopUp', 'Repledged'].includes(l.status)).map(l => l.customerId)
    );
    const activeCustomers = activeLoanCustomerIds.size;

    // Loan Metrics
    const totalLoans = loans.length;
    const totalLoanAmount = loans.reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);
    const totalOutstandingAmount = loans.reduce((sum, l) => sum + (parseFloat(l.remainingLoanAmount) || 0), 0);
    const closedLoans = loans.filter(l => l.status === 'Closed').length;

    // Payment Metrics
    const totalCollections = payments.reduce((sum, p) => sum + (parseFloat(p.paymentAmount) || 0), 0);
    const totalPrincipalCollections = payments.reduce((sum, p) => sum + (parseFloat(p.principalAmount) || 0), 0);
    const totalInterestCollections = payments.reduce((sum, p) => sum + (parseFloat(p.interestAmount) || 0), 0);

    // TopUp / Repledge Metrics
    const totalTopUpAmount = topups.reduce((sum, t) => sum + (parseFloat(t.topupAmount) || 0), 0);
    const totalRepledges = repledges.length;

    // Business Metrics
    const totalIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netCashPosition = (totalCollections + totalIncome) - totalExpenses;

    res.json({
      metrics: {
        totalCustomers,
        activeCustomers,
        totalLoans,
        totalLoanAmount,
        totalOutstandingAmount,
        closedLoans,
        totalCollections,
        totalPrincipalCollections,
        totalInterestCollections,
        totalTopUpAmount,
        totalRepledges,
        totalIncome,
        totalExpenses,
        netCashPosition
      }
    });
  } catch (error) { next(error); }
};


// @desc    Get Daily Closing Summary Report (Ledger Format)
// @route   GET /api/reports/daily-closing-summary
// @access  Public
const getDailyClosingSummary = async (req, res, next) => {
  try {
    const { date, period } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const endOfPeriod = new Date(targetDate);
    endOfPeriod.setUTCHours(23, 59, 59, 999);

    const startOfPeriod = new Date(targetDate);
    if (period === 'weekly') {
      startOfPeriod.setDate(startOfPeriod.getDate() - 7);
    } else if (period === 'monthly') {
      startOfPeriod.setMonth(startOfPeriod.getMonth() - 1);
    } else if (period === 'yearly') {
      startOfPeriod.setFullYear(startOfPeriod.getFullYear() - 1);
    }
    startOfPeriod.setUTCHours(0, 0, 0, 0);

    const getSum = (arr) => arr.length > 0 ? arr[0].total : 0;

    // 1. OPENING BALANCE (All prior to startOfPeriod)
    const [pInc, pPay, pRemIn, pExp, pLoan, pTop, pRep, pRemOut] = await Promise.all([
      // Inflows
      Income.aggregate([{ $match: { incomeDate: { $lt: startOfPeriod } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      Payment.aggregate([{ $match: { paymentDate: { $lt: startOfPeriod } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$paymentAmount" } } } }]),
      Remittance.aggregate([{ $match: { remittanceDate: { $lt: startOfPeriod }, type: 'Received' } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      // Outflows
      Expense.aggregate([{ $match: { expenseDate: { $lt: startOfPeriod } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      Loan.aggregate([{ $match: { loanDate: { $lt: startOfPeriod } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$loanAmount" } } } }]),
      TopUp.aggregate([{ $match: { topupDate: { $lt: startOfPeriod } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$topupAmount" } } } }]),
      Repledge.aggregate([{ $match: { repledgeDate: { $lt: startOfPeriod } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$additionalLoanAmount" } } } }]),
      Remittance.aggregate([{ $match: { remittanceDate: { $lt: startOfPeriod }, type: 'Sent' } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }])
    ]);

    const openingBalance = (getSum(pInc) + getSum(pPay) + getSum(pRemIn)) - (getSum(pExp) + getSum(pLoan) + getSum(pTop) + getSum(pRep) + getSum(pRemOut));

    // 2. PERIOD'S TRANSACTIONS
    const [incomes, expenses, payments, denominations, goldStocks, remittances] = await Promise.all([
      Income.find({ incomeDate: { $gte: startOfPeriod, $lte: endOfPeriod } }),
      Expense.find({ expenseDate: { $gte: startOfPeriod, $lte: endOfPeriod } }),
      Payment.find({ paymentDate: { $gte: startOfPeriod, $lte: endOfPeriod } }),
      Denomination.find({ entryDate: { $gte: startOfPeriod, $lte: endOfPeriod } }),
      Loan.find({ loanDate: { $gte: startOfPeriod, $lte: endOfPeriod } }).populate('customerId'),
      Remittance.find({ remittanceDate: { $gte: startOfPeriod, $lte: endOfPeriod } })
    ]);

    // Income Mapping (Varavu)
    let incomeItems = [];
    
    // Payments (Interest, Principal, Document)
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPenalty = 0;
    payments.forEach(p => {
      totalInterest += parseFloat(p.interestAmount) || 0;
      totalPrincipal += parseFloat(p.principalAmount) || 0;
      totalPenalty += parseFloat(p.penaltyAmount) || 0;
    });

    if (totalInterest > 0) incomeItems.push({ title: 'Receipt Interest Amount Collected', amount: totalInterest });
    if (totalPrincipal > 0) incomeItems.push({ title: 'A/C . Receipt Principal Collected', amount: totalPrincipal });
    if (totalPenalty > 0) incomeItems.push({ title: 'Receipt Doc. Collected', amount: totalPenalty });

    // Remittance Received
    const remittanceReceived = remittances.filter(r => r.type === 'Received').reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    if (remittanceReceived > 0) incomeItems.push({ title: 'Remittance', amount: remittanceReceived });

    // Individual Incomes
    incomes.forEach(i => {
      incomeItems.push({ title: i.incomeCategory || i.description || 'Income', amount: parseFloat(i.amount) || 0 });
    });

    // Expense Mapping (Selavu)
    let expenseItems = [];
    
    // General Expenses
    expenses.forEach(e => {
      expenseItems.push({ title: e.expenseCategory || e.description || 'Expense', amount: parseFloat(e.amount) || 0 });
    });

    // Loans Issued Today
    const loansIssued = goldStocks.reduce((acc, l) => acc + (parseFloat(l.loanAmount) || 0), 0);
    if (loansIssued > 0) expenseItems.push({ title: 'LOAN', amount: loansIssued });

    // Remittance Sent
    const remittanceSent = remittances.filter(r => r.type === 'Sent').reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    if (remittanceSent > 0) expenseItems.push({ title: 'Remittance Sent', amount: remittanceSent });

    const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    const closingBalance = openingBalance + totalIncome - totalExpense;

    // Denominations
    let notes = {
      "2000": { count: 0, amount: 0 },
      "500": { count: 0, amount: 0 },
      "200": { count: 0, amount: 0 },
      "100": { count: 0, amount: 0 },
      "50": { count: 0, amount: 0 },
      "20": { count: 0, amount: 0 },
      "10": { count: 0, amount: 0 },
      "5": { count: 0, amount: 0 },
      "2": { count: 0, amount: 0 },
      "1": { count: 0, amount: 0 },
      "Coins": { count: 0, amount: 0 }
    };
    let denominationTotal = 0;
    let rawDenomObj = null;

    if (denominations.length > 0) {
      const latestDenom = denominations[denominations.length - 1];
      rawDenomObj = latestDenom;
      const noteValues = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      noteValues.forEach(val => {
        const fieldName = `notes${val}`;
        const count = latestDenom[fieldName] || 0;
        notes[val.toString()] = { count, amount: val * count };
        denominationTotal += val * count;
      });
      // Handle coins
      const coinsAmount = latestDenom.coinsTotal || 0;
      notes["Coins"] = { count: coinsAmount, amount: coinsAmount };
      denominationTotal += coinsAmount;
    }

    // Gold Stock from Loans created today
    const goldStock = goldStocks.map(l => ({
      loanId: l.loanId || l._id.toString(),
      customerName: l.customerId ? l.customerId.name : 'Unknown',
      weight: l.grossWeight ? l.grossWeight + 'g' : '-'
    }));

    res.json({
      date: targetDate.toISOString().split('T')[0],
      openingBalance,
      closingBalance,
      income: {
        items: incomeItems,
        total: totalIncome
      },
      expense: {
        items: expenseItems,
        total: totalExpense
      },
      denominations: {
        notes,
        total: denominationTotal,
        rawDenomination: rawDenomObj
      },
      goldStock
    });
  } catch (error) { next(error); }
};

// @desc    Get Borrower Details Report
// @route   GET /api/reports/borrower-details
// @access  Protected
const getBorrowerDetailsReport = async (req, res, next) => {
  try {
    const { search, branch, startDate, endDate } = req.query;
    
    let query = { isDeleted: { $ne: true } };
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (branch && branch !== 'All') {
      query.branch = branch;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const customers = await Customer.find(query).lean();
    const customerIds = customers.map(c => c.customerId);

    const loans = await Loan.find({ customerId: { $in: customerIds } }).lean();

    const result = customers.map(c => {
      const customerLoans = loans.filter(l => l.customerId === c.customerId);
      const totalLoan = customerLoans.reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);
      const outstanding = customerLoans.reduce((sum, l) => sum + (parseFloat(l.remainingLoanAmount) || 0), 0);

      return {
        id: c._id,
        customerId: c.customerId,
        customerName: c.customerName,
        mobileNumber: c.mobileNumber,
        branchName: c.branch,
        loanCount: customerLoans.length,
        totalLoan,
        outstanding,
        status: c.kycStatus === 'Verified' ? 'Approved' : 'Pending'
      };
    });

    res.json({ success: true, data: result });
  } catch (error) { 
    next(error); 
  }
};

// @desc    Get Loan Ledger
// @route   GET /api/reports/ledger
// @access  Protected
const getLoanLedger = async (req, res, next) => {
  try {
    const { mobileNo, borrowerName, branch, schemeType, fromDate, toDate } = req.query;

    let loanQuery = {};
    if (mobileNo) loanQuery.mobileNo = { $regex: new RegExp(mobileNo, 'i') };
    if (borrowerName) loanQuery.name = { $regex: new RegExp(borrowerName, 'i') };
    if (branch) loanQuery.branch = { $regex: new RegExp(branch, 'i') };
    if (schemeType) loanQuery.schemeType = { $regex: new RegExp(schemeType, 'i') };
    if (fromDate || toDate) {
      loanQuery.loanDate = {};
      if (fromDate) loanQuery.loanDate.$gte = new Date(fromDate);
      if (toDate) loanQuery.loanDate.$lte = new Date(toDate);
    }

    const loans = await Loan.find(loanQuery);
    const loanIds = loans.map(l => l.loanId);

    // Get all payments for these loans
    const payments = await Payment.find({ loanId: { $in: loanIds } });
    
    // Also get TopUps for these loans as they increase the balance
    const topups = await TopUp.find({ loanId: { $in: loanIds } });

    let ledgerEntries = [];

    // For each loan, generate its initial ledger entry and subsequent payment entries
    loans.forEach(loan => {
      let balance = parseFloat(loan.loanAmount) || 0;

      // Initial Disbursement Entry
      ledgerEntries.push({
        _id: `loan_${loan._id}`,
        loanNo: loan.loanId,
        borrower: loan.name,
        date: loan.loanDate,
        description: 'Loan Disbursement',
        debit: balance,
        credit: 0,
        balance: balance,
        status: loan.status
      });

      // Filter and sort related topups
      const loanTopups = topups.filter(t => t.loanId === loan.loanId).sort((a, b) => new Date(a.topupDate) - new Date(b.topupDate));
      
      loanTopups.forEach(topup => {
        const amount = parseFloat(topup.topupAmount) || 0;
        balance += amount;
        ledgerEntries.push({
          _id: `topup_${topup._id}`,
          loanNo: loan.loanId,
          borrower: loan.name,
          date: topup.topupDate,
          description: 'Top-Up',
          debit: amount,
          credit: 0,
          balance: balance,
          status: loan.status
        });
      });

      // Filter and sort related payments
      const loanPayments = payments.filter(p => p.loanId === loan.loanId).sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

      loanPayments.forEach(payment => {
        const creditAmount = parseFloat(payment.principalAmount) || 0; 
        balance -= creditAmount;

        ledgerEntries.push({
          _id: `pay_${payment._id}`,
          loanNo: loan.loanId,
          borrower: loan.name,
          date: payment.paymentDate,
          description: `Payment - ${payment.paymentType}`,
          debit: 0,
          credit: parseFloat(payment.paymentAmount) || 0,
          principalCredit: creditAmount,
          balance: balance,
          status: loan.status
        });
      });
    });

    // Sort all entries globally by date
    ledgerEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(ledgerEntries);
  } catch (error) { next(error); }
};

// @desc    Get Loan Requisition Report
// @route   GET /api/reports/loan-requisition
// @access  Public
const getLoanRequisitionReport = async (req, res, next) => {
  try {
    const { borrowerName, phoneNumber, status, date, customerId } = req.query;
    let query = {};

    if (borrowerName) {
      query.name = { $regex: new RegExp(borrowerName, 'i') };
    }
    if (phoneNumber) {
      query.mobileNo = { $regex: new RegExp(phoneNumber, 'i') };
    }
    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }
    if (status) {
      query.status = status;
    }
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      query.loanDate = { $gte: start, $lte: end };
    }

    const loans = await Loan.find(query).sort({ loanDate: -1 }).populate('customerObjectId');

    res.json({
      success: true,
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailySummary,
  getLoanReport,
  getLoanOutstandingReport,
  getInterestPendingReport,
  getClosedAccountsReport,
  getRepledgeReport,
  getAccountSummaryReport,
  getTodayCollectionReport,
  getTodayCollectionById,
  exportTodayCollection,
  getDatewisePendingReport,
  getCashAssetsReport,
  getAuctionAccountsReport,
  getBusinessReport,
  getDailyClosingSummary,
  getBorrowerDetailsReport,
  getLoanLedger,
  getLoanRequisitionReport
};
