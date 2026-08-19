const mongoose = require('mongoose');
const ChitGroup = require('../models/ChitGroup');
const ChitMember = require('../models/ChitMember');
const ChitContribution = require('../models/ChitContribution');
const ChitEvent = require('../models/ChitEvent');
const ChitDisbursement = require('../models/ChitDisbursement');
const ApiError = require('../utils/ApiError');
const ledgerService = require('../services/ledgerService');

// Group APIs
exports.createGroup = async (req, res, next) => {
  try {
    const group = new ChitGroup(req.body);
    await group.save();
    res.status(201).json({ success: true, data: group });
  } catch (err) { next(err); }
};

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await ChitGroup.find().populate('branch employee');
    res.status(200).json({ success: true, data: groups });
  } catch (err) { next(err); }
};

// Member APIs
exports.addMember = async (req, res, next) => {
  try {
    const group = await ChitGroup.findById(req.body.chitGroup);
    if (!group) return next(new ApiError(404, 'Group not found'));
    const memberCount = await ChitMember.countDocuments({ chitGroup: group._id });
    if (memberCount >= group.totalMembers) {
      return next(new ApiError(400, 'Group is already full'));
    }
    const member = new ChitMember({ ...req.body, memberNumber: memberCount + 1 });
    await member.save();
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

exports.getMembers = async (req, res, next) => {
  try {
    const members = await ChitMember.find({ chitGroup: req.params.groupId }).populate('customer');
    res.status(200).json({ success: true, data: members });
  } catch (err) { next(err); }
};

// Contributions & Idempotent Payments
exports.getContributions = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.groupId) query.chitGroup = req.query.groupId;
    if (req.query.memberId) query.member = req.query.memberId;
    const contributions = await ChitContribution.find(query).populate('member customer chitGroup');
    res.status(200).json({ success: true, data: contributions });
  } catch (err) { next(err); }
};

exports.payContribution = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, paymentMode, transactionReference } = req.body;
    
    if (transactionReference) {
      const existing = await ChitContribution.findOne({ transactionReference }).session(session);
      if (existing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({ success: true, data: existing, message: 'Already paid' });
      }
    }
    
    const contribution = await ChitContribution.findById(req.params.id).session(session);
    if (!contribution) throw new ApiError(404, 'Contribution not found');
    
    contribution.paidAmount += amount;
    contribution.balanceAmount = contribution.expectedAmount - contribution.paidAmount;
    contribution.status = contribution.balanceAmount <= 0 ? 'Paid' : 'Partial';
    contribution.paymentDate = new Date();
    contribution.paymentMode = paymentMode;
    contribution.transactionReference = transactionReference;
    
    await contribution.save({ session });
    
    const voucherInfo = {
      voucherNumber: contribution.contributionId,
      voucherType: 'Receive',
      referenceModule: 'ChitFund',
      referenceId: contribution.contributionId,
      remarks: 'Chit collection',
      createdBy: req.user?._id
    };
    
    await ledgerService.postLedgerEntry(`${paymentMode} A/C`, amount, 'Debit', voucherInfo, session);
    await ledgerService.postLedgerEntry('Chit Collection A/C', amount, 'Credit', voucherInfo, session);
    
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: contribution });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// Events & Rule Engine
exports.getEligibleWinners = async (req, res, next) => {
  try {
    const group = await ChitGroup.findById(req.params.groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));
    
    const members = await ChitMember.find({ chitGroup: group._id, status: 'Active', winnerStatus: 'None' }).populate('customer');
    const eligible = [];
    
    const minInstallments = group.duration === 10 ? 3 : (group.duration === 15 ? 4 : 5);
    
    for (let member of members) {
      const paidCount = await ChitContribution.countDocuments({ member: member._id, status: 'Paid' });
      if (paidCount < minInstallments) continue;
      
      let isEligible = true;
      let reasons = [];
      
      const totalPaid = await ChitContribution.aggregate([
        { $match: { member: member._id } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]);
      const paid = totalPaid[0]?.total || 0;
      const is80 = paid >= (group.chitValue * 0.8);
      
      if (!is80) {
        if (group.chitValue >= 50000 && member.securityCheques.length < 3) { isEligible = false; reasons.push('3 Cheques required'); }
        if (group.chitValue >= 100000 && member.guarantors.length < 2) { isEligible = false; reasons.push('2 Guarantors required'); }
        if (!member.nominee?.name) { isEligible = false; reasons.push('Nominee required'); }
      }
      
      if (isEligible) {
        eligible.push({ member, paidCount, totalPaid: paid, is80PercentCompleted: is80 });
      }
    }
    
    res.status(200).json({ success: true, data: eligible });
  } catch (err) { next(err); }
};

exports.finalizeEvent = async (req, res, next) => {
  try {
    const { chitMonth, eventDate, poolAmount, method, winnerId, winningDiscount } = req.body;
    
    const existingEvent = await ChitEvent.findOne({ chitGroup: req.params.groupId, chitMonth });
    if (existingEvent) return next(new ApiError(400, 'Event for this month already finalized'));
    
    const member = await ChitMember.findById(winnerId);
    if (!member || member.winnerStatus === 'Won') return next(new ApiError(400, 'Member not eligible or already won'));
    
    const event = new ChitEvent({
      chitGroup: req.params.groupId, chitMonth, eventDate, poolAmount, method, winner: winnerId, winningDiscount
    });
    await event.save();
    
    member.winnerStatus = 'Won';
    await member.save();
    
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
};

// Disbursement Pipeline & Approval
exports.requestDisbursement = async (req, res, next) => {
  try {
    const { eventId, paymentMode, otherCharges } = req.body;
    const event = await ChitEvent.findById(eventId).populate('chitGroup winner');
    if (!event) return next(new ApiError(404, 'Event not found'));
    
    const existing = await ChitDisbursement.findOne({ chitEvent: eventId });
    if (existing) return next(new ApiError(400, 'Disbursement already requested'));
    
    const group = event.chitGroup;
    
    const chitValue = group.chitValue;
    const auctionDiscount = event.winningDiscount || 0;
    const grossPrizeAmount = chitValue - auctionDiscount;
    const applicableCommission = chitValue * ((group.commissionPercentage || 4) / 100);
    const applicableDocumentFee = (chitValue / 100000) * (group.documentMaintenanceFeePerLakh || 500);
    const charges = otherCharges || 0;
    const netPayout = grossPrizeAmount - applicableCommission - applicableDocumentFee - charges;
    
    const disbursement = new ChitDisbursement({
      chitGroup: group._id,
      chitEvent: event._id,
      winner: event.winner._id,
      customer: event.winner.customer,
      chitValue, auctionDiscount, grossPrizeAmount, applicableCommission, applicableDocumentFee, otherCharges: charges, netPayout,
      paymentMode, disbursementDate: new Date(),
      status: 'Pending'
    });
    
    await disbursement.save();
    res.status(201).json({ success: true, data: disbursement });
  } catch (err) { next(err); }
};

exports.payDisbursement = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { paymentReference } = req.body;
    const disbursement = await ChitDisbursement.findById(req.params.id).session(session);
    if (!disbursement) throw new ApiError(404, 'Disbursement not found');
    
    if (disbursement.status === 'Paid') {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ success: true, data: disbursement, message: 'Already paid' });
    }
    
    if (disbursement.status !== 'Approved') {
      throw new ApiError(400, 'Disbursement not approved yet');
    }
    
    disbursement.status = 'Paid';
    disbursement.paymentReference = paymentReference;
    disbursement.disbursedBy = req.user?._id;
    await disbursement.save({ session });
    
    const voucherInfo = {
      voucherNumber: disbursement.payoutId,
      voucherType: 'Payment',
      referenceModule: 'ChitFund',
      referenceId: disbursement.payoutId,
      remarks: 'Chit prize payout',
      createdBy: req.user?._id
    };
    
    await ledgerService.postLedgerEntry('Chit Collection A/C', disbursement.grossPrizeAmount, 'Debit', voucherInfo, session);
    
    if (disbursement.applicableCommission > 0) {
      await ledgerService.postLedgerEntry('Chit Commission Income A/C', disbursement.applicableCommission, 'Credit', voucherInfo, session);
    }
    if (disbursement.applicableDocumentFee > 0) {
      await ledgerService.postLedgerEntry('Document Fee Income A/C', disbursement.applicableDocumentFee, 'Credit', voucherInfo, session);
    }
    
    await ledgerService.postLedgerEntry(`${disbursement.paymentMode} A/C`, disbursement.netPayout, 'Credit', voucherInfo, session);
    
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: disbursement });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.getDisbursements = async (req, res, next) => {
  try {
    const disbursements = await ChitDisbursement.find().populate('chitGroup chitEvent winner customer');
    res.status(200).json({ success: true, data: disbursements });
  } catch (err) { next(err); }
};

// Mock approval (for integration with Approval Module if needed directly here, or fetched by Approval Module)
exports.approveDisbursement = async (req, res, next) => {
  try {
    const disbursement = await ChitDisbursement.findById(req.params.id);
    if (!disbursement) return next(new ApiError(404, 'Disbursement not found'));
    
    disbursement.status = 'Approved';
    await disbursement.save();
    res.status(200).json({ success: true, data: disbursement });
  } catch (err) { next(err); }
};
