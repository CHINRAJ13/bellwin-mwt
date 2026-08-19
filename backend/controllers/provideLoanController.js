const ApiError = require('../utils/ApiError');
const { Customer } = require('../models/Customer');
const GoldScheme = require('../models/GoldScheme');

exports.getProvideLoanDetails = async (req, res, next) => {
    try {
        const { customerId } = req.params;

        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(customerId);
        const query = isValidObjectId 
            ? { $or: [{ customerId: customerId }, { _id: customerId }] }
            : { customerId: customerId };

        // Fetch Customer Details
        const customer = await Customer.findOne(query);
        if (!customer) {
            return next(new ApiError(404, "Customer not found" ));
        }

        // Fetch Active Gold Scheme
        const scheme = await GoldScheme.findOne({ 
            customerId: customer.customerId || customer._id, 
            status: "Active" 
        });

        if (!scheme) {
            return next(new ApiError(404, "No Active Gold Scheme Found" ));
        }

        // Return combined details
        res.status(200).json({
            customer: {
                _id: customer._id,
                customerId: customer.customerId,
                name: customer.customerName,
                mobileNo: customer.mobileNumber,
                fatherHusbandName: customer.guardianName,
                address: `${customer.doorStreet || ''} ${customer.area || ''} ${customer.city || ''}`.trim(),
                status: customer.status,
                approvalStatus: customer.approvalStatus
            },
            scheme: {
                schemeId: scheme.schemeId,
                schemeName: scheme.schemeName,
                loanAmount: scheme.amount,
                interestPercent: scheme.interestPercent,
                gramRate: scheme.gramRate,
                minimumGram: scheme.minimumGram,
                maturePeriod: scheme.maturePeriod,
                interestRepaymentMonths: scheme.interestRepaymentMonths,
                documentCharges: scheme.documentCharges,
                penaltyPercent: scheme.penaltyPercent,
                employeeId: scheme.employeeId,
                employeeName: scheme.employeeName
            }
        });
    } catch (error) {
        next(new ApiError(500, "Error fetching provide loan details"));
    }
};
