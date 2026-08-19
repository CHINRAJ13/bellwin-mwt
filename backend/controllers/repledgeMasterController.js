const ApiError = require('../utils/ApiError');
const RepledgeBank = require('../models/RepledgeBank');
const RepledgeScheme = require('../models/RepledgeScheme');
const RepledgeRepayment = require('../models/RepledgeRepayment');

// --- Repledge Bank CRUD ---
exports.createBank = async (req, res, next) => {
  try {
    const bank = await RepledgeBank.create(req.body);
    res.status(201).json(bank);
  } catch (error) { next(error); }
};

exports.getBanks = async (req, res, next) => {
  try {
    const banks = await RepledgeBank.find().sort({ createdAt: -1 });
    res.json(banks);
  } catch (error) { next(error); }
};

exports.updateBank = async (req, res, next) => {
  try {
    const bank = await RepledgeBank.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!bank) return next(new ApiError(404, 'Bank not found'));
    res.json(bank);
  } catch (error) { next(error); }
};

exports.deleteBank = async (req, res, next) => {
  try {
    const bank = await RepledgeBank.findByIdAndDelete(req.params.id);
    if (!bank) return next(new ApiError(404, 'Bank not found'));
    res.json({ message: 'Bank deleted successfully' });
  } catch (error) { next(error); }
};

// --- Repledge Scheme CRUD ---
exports.createScheme = async (req, res, next) => {
  try {
    const scheme = await RepledgeScheme.create(req.body);
    res.status(201).json(scheme);
  } catch (error) { next(error); }
};

exports.getSchemes = async (req, res, next) => {
  try {
    const schemes = await RepledgeScheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) { next(error); }
};

exports.updateScheme = async (req, res, next) => {
  try {
    const scheme = await RepledgeScheme.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!scheme) return next(new ApiError(404, 'Scheme not found'));
    res.json(scheme);
  } catch (error) { next(error); }
};

exports.deleteScheme = async (req, res, next) => {
  try {
    const scheme = await RepledgeScheme.findByIdAndDelete(req.params.id);
    if (!scheme) return next(new ApiError(404, 'Scheme not found'));
    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) { next(error); }
};

// --- Repledge Repayment CRUD ---
exports.createRepayment = async (req, res, next) => {
  try {
    const repayment = await RepledgeRepayment.create(req.body);
    res.status(201).json(repayment);
  } catch (error) { next(error); }
};

exports.getRepayments = async (req, res, next) => {
  try {
    const repayments = await RepledgeRepayment.find().sort({ createdAt: -1 });
    res.json(repayments);
  } catch (error) { next(error); }
};

exports.updateRepayment = async (req, res, next) => {
  try {
    const repayment = await RepledgeRepayment.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!repayment) return next(new ApiError(404, 'Repayment not found'));
    res.json(repayment);
  } catch (error) { next(error); }
};

exports.deleteRepayment = async (req, res, next) => {
  try {
    const repayment = await RepledgeRepayment.findByIdAndDelete(req.params.id);
    if (!repayment) return next(new ApiError(404, 'Repayment not found'));
    res.json({ message: 'Repayment deleted successfully' });
  } catch (error) { next(error); }
};
