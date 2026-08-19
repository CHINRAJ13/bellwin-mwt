const ApiError = require('../utils/ApiError');
const GoldScheme = require('../models/GoldScheme');
const { Customer } = require('../models/Customer');

exports.createGoldScheme = async (req, res, next) => {
    try {
        const {
            customerId,
            schemeName,
            interestPercent,
            amount,
            gramRate,
            minimumGram,
            maturePeriod,
            interestRepaymentMonths,
            documentCharges,
            penaltyPercent,
        } = req.body;

        if (!customerId) return next(new ApiError(400, "Customer ID is required" ));

        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(customerId);
        
        const query = isValidObjectId 
            ? { $or: [{ customerId: customerId }, { _id: customerId }] }
            : { customerId: customerId };

        const customer = await Customer.findOne(query);
        if (!customer) return next(new ApiError(404, "Customer not found" ));

        const existingScheme = await GoldScheme.findOne({ 
            customerId: customer.customerId || customer._id, 
            status: "Active" 
        });
        if (existingScheme) {
            return next(new ApiError(400, "Customer already has an active Gold Scheme" ));
        }

        // Get Employee info from token (or fallback if using guestUser middleware)
        const employeeId = req.user ? req.user._id : 'unknown';
        const employeeName = req.user && req.user.username ? req.user.username : 'System';

        const newScheme = new GoldScheme({
            customerId: customer.customerId || customer._id,
            customerName: customer.customerName,
            customerMobile: customer.mobileNumber,
            customerBranch: 'Head Office', // Branch is removed from Customer model but required by prompt, using default
            employeeId,
            employeeName,
            schemeName,
            interestPercent,
            amount,
            gramRate,
            minimumGram,
            maturePeriod,
            interestRepaymentMonths,
            documentCharges,
            penaltyPercent,
            status: "Active"
        });

        await newScheme.save();
        res.status(201).json({ message: "Gold Scheme created successfully", scheme: newScheme });
    } catch (error) {
        next(new ApiError(500, "Error creating Gold Scheme"));
    }
};

exports.getGoldSchemes = async (req, res, next) => {
    try {
        const schemes = await GoldScheme.find().sort({ createdAt: -1 });
        res.status(200).json(schemes);
    } catch (error) {
        next(new ApiError(500, "Error fetching schemes"));
    }
};

exports.getGoldSchemeByCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const scheme = await GoldScheme.findOne({ customerId, status: 'Active' });
        if (!scheme) {
            return next(new ApiError(404, "No Active Gold Scheme Found" ));
        }
        res.status(200).json(scheme);
    } catch (error) {
        next(new ApiError(500, "Error fetching scheme"));
    }
};

exports.updateGoldScheme = async (req, res, next) => {
    try {
        const scheme = await GoldScheme.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!scheme) return next(new ApiError(404, "Scheme not found" ));
        res.status(200).json({ message: "Scheme updated", scheme });
    } catch (error) {
        next(new ApiError(500, "Error updating scheme"));
    }
};

exports.deleteGoldScheme = async (req, res, next) => {
    try {
        const scheme = await GoldScheme.findByIdAndDelete(req.params.id);
        if (!scheme) return next(new ApiError(404, "Scheme not found" ));
        res.status(200).json({ message: "Scheme deleted successfully" });
    } catch (error) {
        next(new ApiError(500, "Error deleting scheme"));
    }
};
