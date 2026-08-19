const ApiError = require('../utils/ApiError');
const Followup = require('../models/Followup');

// @desc    Create a new followup
// @route   POST /api/followups
// @access  Public
const createFollowup = async (req, res, next) => {
    try {
        const {
            customerName,
            mobileNumber,
            loanNumber,
            dueAmount,
            dueDate,
            followupType,
            nextCallDate,
            staffName,
            remarks,
            callStatus
        } = req.body;

        const followup = await Followup.create({
            customerName,
            mobileNumber,
            loanNumber,
            dueAmount,
            dueDate,
            followupType,
            nextCallDate,
            staffName,
            remarks,
            callStatus
        });

        res.status(201).json({
            success: true,
            data: followup
        });
    } catch (error) {
        next(new ApiError(400, error.message
        ));
    }
};

// @desc    Get all followups
// @route   GET /api/followups
// @access  Public
const getFollowups = async (req, res, next) => {
    try {
        const followups = await Followup.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: followups.length,
            data: followups
        });
    } catch (error) {
        next(new ApiError(500, 'Server Error'
        ));
    }
};

module.exports = {
    createFollowup,
    getFollowups
};
