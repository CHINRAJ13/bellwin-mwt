const ApiError = require('../utils/ApiError');
const { Customer } = require('../models/Customer');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Repledge = require('../models/Repledge');
const Topup = require('../models/topupModel');

exports.getCustomerHistory = async (req, res, next) => {
    try {
        const { customerId } = req.params;

        // Try to find the customer either by generated customerId string or ObjectId
        let customer;
        if (customerId.length === 24) {
             customer = await Customer.findById(customerId);
        }
        if (!customer) {
             customer = await Customer.findOne({ customerId: new RegExp(`^${customerId}$`, 'i') });
        }

        if (!customer) {
            return next(new ApiError(404, 'Customer not found' ));
        }

        // We use the string customerId to fetch relations as seen in other models
        const searchId = customer.customerId;
        const _id = customer._id;

        // Query related data
        const [loans, payments, repledges, topups] = await Promise.all([
            Loan.find({ $or: [{ customerId: searchId }, { customerObjectId: _id }] }).sort({ createdAt: -1 }),
            Payment.find({ customerId: searchId }).sort({ createdAt: -1 }),
            Repledge.find({ customerId: searchId }).sort({ createdAt: -1 }),
            Topup.find({ customerId: searchId }).sort({ createdAt: -1 })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                customer,
                loans,
                payments,
                repledges,
                topups
            }
        });
    } catch (error) {
        console.error('Error fetching customer history:', error);
        return next(new ApiError(500, error.message ));
    }
};
