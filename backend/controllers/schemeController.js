const ApiError = require('../utils/ApiError');
const LoanSchemeConfig = require('../models/LoanSchemeConfig');

exports.createScheme = async (req, res, next) => {
    try {
        const {
            schemeName,
            interestRate,
            amountLimit,
            gramRate,
            minimumGram,
            maturePeriodMonths,
            interestRepaymentMonths,
            documentCharges,
            penalty,
            schemeType,
            status
        } = req.body;

        if (!schemeName) {
            return next(new ApiError(400, "Scheme Name is required"));
        }

        let prefix = 'GL';
        if (schemeType === 'Personal Loan') prefix = 'PL';
        else if (schemeType === 'Micro Finance') prefix = 'MF';
        else if (schemeType === 'Two Wheeler Loan') prefix = 'TW';

        // Find the latest scheme of THIS TYPE to increment the ID correctly
        const latestScheme = await LoanSchemeConfig.findOne({ schemeType }).sort({ createdAt: -1 });
        let newSchemeId = `${prefix}-001`;

        if (latestScheme && latestScheme.schemeId && latestScheme.schemeId.startsWith(`${prefix}-`)) {
            const currentNum = parseInt(latestScheme.schemeId.split('-')[1]);
            if (!isNaN(currentNum)) {
                newSchemeId = `${prefix}-${String(currentNum + 1).padStart(3, '0')}`;
            }
        }

        const newScheme = new LoanSchemeConfig({
            schemeId: newSchemeId,
            schemeCode: newSchemeId, // To satisfy old database index
            schemeName,
            interestRate: interestRate ? Number(interestRate) : undefined,
            amountLimit: amountLimit ? Number(amountLimit) : undefined,
            gramRate: gramRate ? Number(gramRate) : undefined,
            minimumGram: minimumGram ? Number(minimumGram) : undefined,
            maturePeriodMonths: maturePeriodMonths ? Number(maturePeriodMonths) : undefined,
            interestRepaymentMonths: interestRepaymentMonths ? Number(interestRepaymentMonths) : undefined,
            documentCharges: documentCharges ? Number(documentCharges) : undefined,
            penalty: penalty ? Number(penalty) : undefined,
            schemeType: schemeType || 'Bellwin Gold Loan',
            status: status || 'Active'
        });

        await newScheme.save();
        res.status(201).json({ message: "Scheme created successfully", scheme: newScheme });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Error creating scheme", stack: error.stack });
    }
};

exports.getSchemes = async (req, res, next) => {
    try {
        const type = req.query.type;
        const schemeId = req.query.schemeId;
        const query = {};
        if (type) query.schemeType = type;
        if (schemeId) query.schemeId = schemeId;
        
        const schemes = await LoanSchemeConfig.find(query).sort({ createdAt: -1 });
        res.status(200).json(schemes);
    } catch (error) {
        next(new ApiError(500, "Error fetching schemes: " + error.message));
    }
};

exports.getSchemeById = async (req, res, next) => {
    try {
        const scheme = await LoanSchemeConfig.findById(req.params.id);
        if (!scheme) {
            return next(new ApiError(404, "Scheme not found"));
        }
        res.status(200).json(scheme);
    } catch (error) {
        next(new ApiError(500, "Error fetching scheme"));
    }
};

exports.updateScheme = async (req, res, next) => {
    try {
        const scheme = await LoanSchemeConfig.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!scheme) return next(new ApiError(404, "Scheme not found"));
        res.status(200).json({ message: "Scheme updated", scheme });
    } catch (error) {
        next(new ApiError(500, "Error updating scheme"));
    }
};

exports.deleteScheme = async (req, res, next) => {
    try {
        const scheme = await LoanSchemeConfig.findByIdAndDelete(req.params.id);
        if (!scheme) return next(new ApiError(404, "Scheme not found"));
        res.status(200).json({ message: "Scheme deleted successfully" });
    } catch (error) {
        next(new ApiError(500, "Error deleting scheme"));
    }
};
