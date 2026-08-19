const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/authMiddleware');
const {
  getTrialBalance,
  getCashBook,
  getBankBook,
  getDayBook,
  getProfitLoss,
  getBalanceSheet,
  getJournalReport,
  getLedgerReport
} = require('../controllers/accountsController');

// Apply protection and permission check to ALL accounts routes
router.use(protect);
router.use(requirePermission('accounts'));

router.get('/trial-balance', getTrialBalance);
router.get('/cash-book', getCashBook);
router.get('/bank-book', getBankBook);
router.get('/day-book', getDayBook);
router.get('/profit-loss', getProfitLoss);
router.get('/balance-sheet', getBalanceSheet);
router.get('/journal-report', getJournalReport);
router.get('/ledger-report', getLedgerReport);

const {
  accountsGroupController,
  ledgerController,
  paymentVoucherController,
  receiveVoucherController,
  journalVoucherController,
  contraVoucherController,
  bankDepositController,
  bankWithdrawalController
} = require('../controllers/accountsController');

const mapCrudRoutes = (path, controller) => {
  router.route(path)
    .get(controller.getAll)
    .post(controller.create);
  router.route(`${path}/:id`)
    .get(controller.getById)
    .put(controller.update)
    .delete(controller.delete);
};

mapCrudRoutes('/group', accountsGroupController);
mapCrudRoutes('/ledger', ledgerController);
mapCrudRoutes('/payment-voucher', paymentVoucherController);
mapCrudRoutes('/receive-voucher', receiveVoucherController);
mapCrudRoutes('/journal-voucher', journalVoucherController);
mapCrudRoutes('/contra-voucher', contraVoucherController);
mapCrudRoutes('/bank-deposit', bankDepositController);
mapCrudRoutes('/bank-withdrawal', bankWithdrawalController);

module.exports = router;
