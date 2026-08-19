const LoanSchemeConfig = require('../models/LoanSchemeConfig');

exports.createScheme = async (req, res, next) => {
  try {
    const scheme = await LoanSchemeConfig.create(req.body);
    res.status(201).json(scheme);
  } catch (err) { next(err); }
};

exports.getSchemes = async (req, res, next) => {
  try {
    const schemes = await LoanSchemeConfig.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (err) { next(err); }
};

exports.updateScheme = async (req, res, next) => {
  try {
    const scheme = await LoanSchemeConfig.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(scheme);
  } catch (err) { next(err); }
};

exports.deleteScheme = async (req, res, next) => {
  try {
    await LoanSchemeConfig.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
