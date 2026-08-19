const ApiError = require('../utils/ApiError');
const Denomination = require('../models/Denomination');

// @desc    Get next Denomination ID
// @route   GET /api/denominations/next-id
// @access  Public
const getNextDenominationId = async (req, res, next) => {
  try {
    const lastDenom = await Denomination.findOne().sort({ createdAt: -1 });
    let nextId = 'DEN000001';
    
    if (lastDenom && lastDenom.denominationId && lastDenom.denominationId.startsWith('DEN')) {
      const currentNumber = parseInt(lastDenom.denominationId.replace('DEN', ''), 10);
      if (!isNaN(currentNumber)) {
        nextId = `DEN${String(currentNumber + 1).padStart(6, '0')}`;
      }
    }
    
    res.json({ nextId });
  } catch (error) { next(error); }
};

// @desc    Create new denomination
// @route   POST /api/denominations
// @access  Public
const createDenomination = async (req, res, next) => {
  try {
    const {
      denominationId, entryDate, cashInHandTotal,
      notes500, notes200, notes100, notes50, notes20, notes10, notes5, notes2, notes1, coinsTotal,
      enteredBy, verifiedBy, verifiedTime, remarks
    } = req.body;

    // Recalculate backend logic
    const grandTotal = 
      (Number(notes500) || 0) * 500 +
      (Number(notes200) || 0) * 200 +
      (Number(notes100) || 0) * 100 +
      (Number(notes50) || 0) * 50 +
      (Number(notes20) || 0) * 20 +
      (Number(notes10) || 0) * 10 +
      (Number(notes5) || 0) * 5 +
      (Number(notes2) || 0) * 2 +
      (Number(notes1) || 0) * 1 +
      (Number(coinsTotal) || 0);

    const denomExists = await Denomination.findOne({ denominationId });
    if (denomExists) {
      return res.status(400).json({ message: `Denomination ID ${denominationId} already exists` });
    }

    const denomination = await Denomination.create({
      denominationId, entryDate, cashInHandTotal,
      notes500, notes200, notes100, notes50, notes20, notes10, notes5, notes2, notes1, coinsTotal,
      grandTotal, enteredBy, verifiedBy, verifiedTime, remarks
    });

    res.status(201).json(denomination);
  } catch (error) { next(error); }
};

// @desc    Get all denominations
// @route   GET /api/denominations
// @access  Public
const getDenominations = async (req, res, next) => {
  try {
    const denominations = await Denomination.find().sort({ createdAt: -1 });
    res.json(denominations);
  } catch (error) { next(error); }
};

// @desc    Get denomination by ID
// @route   GET /api/denominations/:denominationId
// @access  Public
const getDenominationById = async (req, res, next) => {
  try {
    const { denominationId } = req.params;
    const denomination = await Denomination.findOne({ denominationId });
    if (!denomination) {
      return next(new ApiError(404, 'Denomination not found' ));
    }
    res.json(denomination);
  } catch (error) { next(error); }
};

// @desc    Update denomination
// @route   PUT /api/denominations/:denominationId
// @access  Public
const updateDenomination = async (req, res, next) => {
  try {
    const { denominationId } = req.params;
    let updateData = { ...req.body };

    delete updateData.denominationId;
    delete updateData.createdAt;

    // Recalculate backend logic
    if (updateData.notes500 !== undefined || updateData.coinsTotal !== undefined) {
      updateData.grandTotal = 
        (Number(updateData.notes500) || 0) * 500 +
        (Number(updateData.notes200) || 0) * 200 +
        (Number(updateData.notes100) || 0) * 100 +
        (Number(updateData.notes50) || 0) * 50 +
        (Number(updateData.notes20) || 0) * 20 +
        (Number(updateData.notes10) || 0) * 10 +
        (Number(updateData.notes5) || 0) * 5 +
        (Number(updateData.notes2) || 0) * 2 +
        (Number(updateData.notes1) || 0) * 1 +
        (Number(updateData.coinsTotal) || 0);
    }

    const updatedDenomination = await Denomination.findOneAndUpdate(
      { denominationId }, 
      updateData, 
      { returnDocument: 'after' }
    );

    if (!updatedDenomination) {
      return next(new ApiError(404, 'Denomination not found' ));
    }

    res.json(updatedDenomination);
  } catch (error) { next(error); }
};

module.exports = {
  getNextDenominationId,
  createDenomination,
  getDenominations,
  getDenominationById,
  updateDenomination
};
