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
            status,
            // New MFI fields
            mfiType,
            minLoanAmount,
            maxLoanAmount,
            loanAmountBasis,
            interestCalculationMethod,
            penaltyType,
            penaltyValue,
            penaltyCalculation,
            gracePeriodDays,
            tenureUnit,
            minTenure,
            maxTenure,
            repaymentFrequency,
            processingFeeType,
            processingFeeValue,
            insuranceFee,
            documentationFee,
            minGroupMembers,
            maxGroupMembers
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

        // MFI validation
        let finalAmountLimit = amountLimit ? Number(amountLimit) : 0;
        let finalMaturePeriodMonths = maturePeriodMonths ? Number(maturePeriodMonths) : 0;
        let finalDocumentCharges = documentCharges ? Number(documentCharges) : 0;
        let finalPenalty = penalty ? Number(penalty) : 0;

        if (schemeType === 'Micro Finance') {
            if (!mfiType) {
                return next(new ApiError(400, "MFI Scheme Type is required"));
            }
            if (minLoanAmount === undefined || maxLoanAmount === undefined) {
                return next(new ApiError(400, "Minimum and Maximum Loan Amounts are required"));
            }
            if (Number(minLoanAmount) > Number(maxLoanAmount)) {
                return next(new ApiError(400, "Minimum Loan Amount cannot be greater than Maximum Loan Amount"));
            }
            if (Number(minLoanAmount) < 0 || Number(maxLoanAmount) < 0) {
                return next(new ApiError(400, "Loan amounts cannot be negative"));
            }
            if (interestRate !== undefined && Number(interestRate) < 0) {
                return next(new ApiError(400, "Interest Rate cannot be negative"));
            }
            if (minTenure === undefined || maxTenure === undefined) {
                return next(new ApiError(400, "Minimum and Maximum Tenure are required"));
            }
            if (Number(minTenure) > Number(maxTenure)) {
                return next(new ApiError(400, "Minimum Tenure cannot be greater than Maximum Tenure"));
            }
            if (Number(minTenure) < 0 || Number(maxTenure) < 0) {
                return next(new ApiError(400, "Tenure cannot be negative"));
            }
            if (processingFeeValue !== undefined && Number(processingFeeValue) < 0) {
                return next(new ApiError(400, "Processing Fee value cannot be negative"));
            }
            if (penaltyValue !== undefined && Number(penaltyValue) < 0) {
                return next(new ApiError(400, "Penalty value cannot be negative"));
            }
            if (insuranceFee !== undefined && Number(insuranceFee) < 0) {
                return next(new ApiError(400, "Insurance Fee cannot be negative"));
            }
            if (documentationFee !== undefined && Number(documentationFee) < 0) {
                return next(new ApiError(400, "Documentation Fee cannot be negative"));
            }

            if (mfiType === 'Group Loan') {
                if (!loanAmountBasis) {
                    return next(new ApiError(400, "Loan Amount Basis is required for Group Loans"));
                }
                if (minGroupMembers === undefined || maxGroupMembers === undefined) {
                    return next(new ApiError(400, "Group member boundaries are required"));
                }
                if (Number(minGroupMembers) > Number(maxGroupMembers)) {
                    return next(new ApiError(400, "Minimum Group Members cannot be greater than Maximum Group Members"));
                }
                if (Number(minGroupMembers) < 0 || Number(maxGroupMembers) < 0) {
                    return next(new ApiError(400, "Group members cannot be negative"));
                }
            }

            // Sync legacy fields
            finalAmountLimit = Number(maxLoanAmount);
            finalMaturePeriodMonths = tenureUnit === 'Months' ? Number(maxTenure) : Math.ceil(Number(maxTenure) / 30);
            finalDocumentCharges = Number(documentationFee);
            finalPenalty = Number(penaltyValue);
        }

        const newScheme = new LoanSchemeConfig({
            schemeId: newSchemeId,
            schemeCode: newSchemeId, // To satisfy old database index
            schemeName,
            interestRate: interestRate ? Number(interestRate) : undefined,
            amountLimit: finalAmountLimit,
            gramRate: gramRate ? Number(gramRate) : undefined,
            minimumGram: minimumGram ? Number(minimumGram) : undefined,
            maturePeriodMonths: finalMaturePeriodMonths,
            interestRepaymentMonths: interestRepaymentMonths ? Number(interestRepaymentMonths) : undefined,
            documentCharges: finalDocumentCharges,
            penalty: finalPenalty,
            schemeType: schemeType || 'Bellwin Gold Loan',
            status: status || 'Active',

            // MFI Fields
            mfiType,
            minLoanAmount: minLoanAmount != null ? Number(minLoanAmount) : undefined,
            maxLoanAmount: maxLoanAmount != null ? Number(maxLoanAmount) : undefined,
            loanAmountBasis,
            interestCalculationMethod,
            penaltyType,
            penaltyValue: penaltyValue != null ? Number(penaltyValue) : undefined,
            penaltyCalculation,
            gracePeriodDays: gracePeriodDays != null ? Number(gracePeriodDays) : undefined,
            tenureUnit,
            minTenure: minTenure != null ? Number(minTenure) : undefined,
            maxTenure: maxTenure != null ? Number(maxTenure) : undefined,
            repaymentFrequency,
            processingFeeType,
            processingFeeValue: processingFeeValue != null ? Number(processingFeeValue) : undefined,
            insuranceFee: insuranceFee != null ? Number(insuranceFee) : undefined,
            documentationFee: documentationFee != null ? Number(documentationFee) : undefined,
            minGroupMembers: minGroupMembers != null ? Number(minGroupMembers) : undefined,
            maxGroupMembers: maxGroupMembers != null ? Number(maxGroupMembers) : undefined
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
        const existing = await LoanSchemeConfig.findById(req.params.id);
        if (!existing) return next(new ApiError(404, "Scheme not found"));
        
        const merged = { ...existing.toObject(), ...req.body };
        
        if (merged.schemeType === 'Micro Finance') {
            if (merged.minLoanAmount !== undefined && merged.maxLoanAmount !== undefined) {
                if (Number(merged.minLoanAmount) > Number(merged.maxLoanAmount)) {
                    return next(new ApiError(400, "Minimum Loan Amount cannot be greater than Maximum Loan Amount"));
                }
            }
            if (merged.minTenure !== undefined && merged.maxTenure !== undefined) {
                if (Number(merged.minTenure) > Number(merged.maxTenure)) {
                    return next(new ApiError(400, "Minimum Tenure cannot be greater than Maximum Tenure"));
                }
            }
            if (merged.interestRate !== undefined && Number(merged.interestRate) < 0) {
                return next(new ApiError(400, "Interest Rate cannot be negative"));
            }
            if (merged.processingFeeValue !== undefined && Number(merged.processingFeeValue) < 0) {
                return next(new ApiError(400, "Processing Fee value cannot be negative"));
            }
            if (merged.penaltyValue !== undefined && Number(merged.penaltyValue) < 0) {
                return next(new ApiError(400, "Penalty value cannot be negative"));
            }
            if (merged.insuranceFee !== undefined && Number(merged.insuranceFee) < 0) {
                return next(new ApiError(400, "Insurance Fee cannot be negative"));
            }
            if (merged.documentationFee !== undefined && Number(merged.documentationFee) < 0) {
                return next(new ApiError(400, "Documentation Fee cannot be negative"));
            }

            if (merged.mfiType === 'Group Loan') {
                if (merged.minGroupMembers !== undefined && merged.maxGroupMembers !== undefined) {
                    if (Number(merged.minGroupMembers) > Number(merged.maxGroupMembers)) {
                        return next(new ApiError(400, "Minimum Group Members cannot be greater than Maximum Group Members"));
                    }
                }
            }

            // Sync legacy fields
            req.body.amountLimit = Number(merged.maxLoanAmount);
            req.body.maturePeriodMonths = merged.tenureUnit === 'Months' ? Number(merged.maxTenure) : Math.ceil(Number(merged.maxTenure) / 30);
            req.body.documentCharges = Number(merged.documentationFee);
            req.body.penalty = Number(merged.penaltyValue);
        }

        const scheme = await LoanSchemeConfig.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: "Scheme updated", scheme });
    } catch (error) {
        console.error(error);
        next(new ApiError(500, "Error updating scheme: " + error.message));
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
