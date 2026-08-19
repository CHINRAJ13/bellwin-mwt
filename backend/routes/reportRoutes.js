const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/reportController');
const { protect, authorize, requirePermission } = require('../middleware/authMiddleware');
const { getLedgerStatement, getCashBookStatement, getProfitLossStatement, getTrialBalanceReport, getBalanceSheetReport } = require('../controllers/accounts/ledgerReportController');

// GET /api/reports/ledger-statement
router.get('/ledger-statement', protect, getLedgerStatement);

// GET /api/reports/cash-book-statement
router.get('/cash-book-statement', protect, getCashBookStatement);

// GET /api/reports/profit-loss-statement
router.get('/profit-loss-statement', protect, getProfitLossStatement);

// GET /api/reports/trial-balance
router.get('/trial-balance', protect, getTrialBalanceReport);

// GET /api/reports/balance-sheet
router.get('/balance-sheet', protect, getBalanceSheetReport);

// GET /api/reports/ledger
router.get('/ledger', protect, requirePermission('reports'), getLoanLedger);

// GET /api/reports/daily-closing-summary
router.get('/daily-closing-summary', protect, requirePermission('reports'), getDailyClosingSummary);

// GET /api/reports/daily-summary
router.get('/daily-summary', protect, requirePermission('reports'), getDailySummary);

// GET /api/reports/loan-report
router.get('/loan-report', protect, requirePermission('reports'), getLoanReport);

// GET /api/reports/loan-outstanding
router.get('/loan-outstanding', protect, requirePermission('reports'), getLoanOutstandingReport);

// GET /api/reports/interest-pending
router.get('/interest-pending', protect, requirePermission('reports'), getInterestPendingReport);

// GET /api/reports/closed-accounts
router.get('/closed-accounts', protect, requirePermission('reports'), getClosedAccountsReport);

// GET /api/reports/repledge-report
router.get('/repledge-report', protect, requirePermission('reports'), getRepledgeReport);

// GET /api/reports/account-summary
router.get('/account-summary', protect, requirePermission('reports'), getAccountSummaryReport);

// GET /api/reports/today-collection — Protected, paginated report
router.get('/today-collection/export', protect, requirePermission('reports'), authorize('admin', 'hr', 'employee'), exportTodayCollection);
router.get('/today-collection/:receiptId', protect, requirePermission('reports'), authorize('admin', 'hr', 'employee'), getTodayCollectionById);
router.get('/today-collection', protect, requirePermission('reports'), authorize('admin', 'hr', 'employee'), getTodayCollectionReport);

// GET /api/reports/datewise-pending
router.get('/datewise-pending', protect, requirePermission('reports'), getDatewisePendingReport);

// GET /api/reports/cash-assets
router.get('/cash-assets', protect, requirePermission('reports'), getCashAssetsReport);

// GET /api/reports/auction-accounts
router.get('/auction-accounts', protect, requirePermission('reports'), getAuctionAccountsReport);

// GET /api/reports/business-report
router.get('/business-report', protect, getBusinessReport);

// GET /api/reports/borrower-details
router.get('/borrower-details', protect, requirePermission('reports'), getBorrowerDetailsReport);

// GET /api/reports/loan-requisition
router.get('/loan-requisition', protect, requirePermission('reports'), getLoanRequisitionReport);

module.exports = router;
