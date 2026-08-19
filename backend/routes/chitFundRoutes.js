const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createGroup, getGroups,
  addMember, getMembers,
  getContributions, payContribution,
  getEligibleWinners, finalizeEvent,
  requestDisbursement, payDisbursement, getDisbursements, approveDisbursement
} = require('../controllers/chitFundController');

const router = express.Router();

router.use(protect);

router.post('/groups', createGroup);
router.get('/groups', getGroups);

router.post('/groups/:groupId/members', addMember);
router.get('/groups/:groupId/members', getMembers);

router.get('/contributions', getContributions);
router.post('/contributions/:id/pay', payContribution);

router.get('/groups/:groupId/eligible-winners', getEligibleWinners);
router.post('/groups/:groupId/finalize-event', finalizeEvent);

router.get('/disbursements', getDisbursements);
router.post('/disbursements/request', requestDisbursement);
router.post('/disbursements/:id/approve', approveDisbursement); // Integrated with Approval flow
router.post('/disbursements/:id/pay', payDisbursement);

module.exports = router;
