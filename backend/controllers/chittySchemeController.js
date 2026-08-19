const ChittyScheme = require('../models/ChittyScheme');
const ApiError = require('../utils/ApiError');

// @desc    Get all chitty schemes with pagination and search
// @route   GET /api/chitty-schemes
// @access  Private/Admin
const getChittySchemes = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { schemeCode: { $regex: search, $options: 'i' } },
                { schemeName: { $regex: search, $options: 'i' } }
            ];
        }

        const limitNum = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * limitNum;

        const totalCount = await ChittyScheme.countDocuments(query);
        const schemes = await ChittyScheme.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            schemes,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: parseInt(page, 10),
            totalCount
        });
    } catch (error) {
        // console.error('Error fetching chitty schemes:', error);
        next(new ApiError(500, 'Server error fetching chitty schemes'));
    }
};

// @desc    Get single chitty scheme
// @route   GET /api/chitty-schemes/:id
// @access  Private/Admin
const getChittySchemeById = async (req, res, next) => {
    try {
        const scheme = await ChittyScheme.findById(req.params.id);
        if (!scheme) {
            return next(new ApiError(404, 'Chitty scheme not found'));
        }
        res.json(scheme);
    } catch (error) {
        next(new ApiError(500, 'Server error fetching chitty scheme'));
    }
};

// @desc    Create new chitty scheme
// @route   POST /api/chitty-schemes
// @access  Private/Admin
const createChittyScheme = async (req, res, next) => {
    try {
        const existingScheme = await ChittyScheme.findOne({ schemeCode: req.body.schemeCode.trim() });
        if (existingScheme) {
            return next(new ApiError(400, 'Scheme code already exists'));
        }

        const scheme = new ChittyScheme(req.body);
        const createdScheme = await scheme.save();
        res.status(201).json(createdScheme);
    } catch (error) {
        next(new ApiError(400, error.message || 'Invalid chitty scheme data'));
    }
};

// @desc    Update chitty scheme
// @route   PUT /api/chitty-schemes/:id
// @access  Private/Admin
const updateChittyScheme = async (req, res, next) => {
    try {
        const scheme = await ChittyScheme.findById(req.params.id);
        if (!scheme) {
            return next(new ApiError(404, 'Chitty scheme not found'));
        }

        if (req.body.schemeCode && req.body.schemeCode !== scheme.schemeCode) {
            const existingScheme = await ChittyScheme.findOne({ schemeCode: req.body.schemeCode.trim() });
            if (existingScheme) {
                return next(new ApiError(400, 'Scheme code already in use by another scheme'));
            }
        }

        Object.assign(scheme, req.body);
        const updatedScheme = await scheme.save();
        res.json(updatedScheme);
    } catch (error) {
        next(new ApiError(400, 'Invalid chitty scheme data'));
    }
};

// @desc    Delete chitty scheme
// @route   DELETE /api/chitty-schemes/:id
// @access  Private/Admin
const deleteChittyScheme = async (req, res, next) => {
    try {
        const scheme = await ChittyScheme.findById(req.params.id);
        if (!scheme) {
            return next(new ApiError(404, 'Chitty scheme not found'));
        }

        await ChittyScheme.deleteOne({ _id: scheme._id });
        res.json({ message: 'Chitty scheme removed successfully' });
    } catch (error) {
        next(new ApiError(500, 'Server error deleting chitty scheme'));
    }
};

module.exports = {
    getChittySchemes,
    getChittySchemeById,
    createChittyScheme,
    updateChittyScheme,
    deleteChittyScheme
};
