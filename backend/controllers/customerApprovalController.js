const ApiError = require('../utils/ApiError');
const customerApprovalService = require('../services/customerApprovalService');

/**
 * @desc    Search customer for approval module
 * @route   GET /api/customer-approval/search
 * @access  Private
 */
const searchCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.query;
        const user = req.user; // Provided by auth middleware or guestUser

        const data = await customerApprovalService.findCustomerForApproval(customerId, user);
        
        res.json(data);
    } catch (error) {
        console.error('searchCustomer error:', error);
        const status = error.status || 500;
        const message = error.message || 'Server error';
        res.status(status).json({ 
            success: false, 
            message,
            debug: error.debug // Requirement 11
        });
    }
};

/**
 * @desc    Debug customer find (Requirement 8)
 * @route   GET /api/customer-approval/debug/:customerId
 */
const getDebugInfo = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const user = req.user;
        const customer = await require('../models/Customer').Customer.findOne({ 
            customerId: { $regex: `^${customerId}$`, $options: 'i' } 
        });

        res.json({
            searchedId: customerId,
            foundCustomer: !!customer,
            actualDatabaseCustomerId: customer?.customerId || null,
            userRole: user.role
        });
    } catch (error) {
        next(new ApiError(500, error.message ));
    }
};

/**
 * @desc    Get loan status for a specific customer
 * @route   GET /api/customer-approval/status/:customerId
 * @access  Private
 */
const getStatus = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const data = await customerApprovalService.getLoanStatus(customerId);
        
        res.json(data);
    } catch (error) {
        console.error('getStatus error:', error);
        const status = error.status || 500;
        const message = error.message || 'Server error';
        next(new ApiError(status || 500, message));
    }
};

const getPendingCustomers = async (req, res, next) => {
    try {
        const query = { 
            status: 'Customer Approval Pending', 
            isDeleted: { $ne: true } 
        };
        // console.log("Pending Query:", query);
        const customers = await customerApprovalService.getPendingApprovals();
        
        const mappedCustomers = customers.map(c => {
            const customerObj = typeof c.toObject === 'function' ? c.toObject() : JSON.parse(JSON.stringify(c));
            if (customerObj.createdBy && customerObj.createdBy.employeeId) {
                const emp = customerObj.createdBy.employeeId;
                customerObj.createdBy.name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || customerObj.createdBy.username || 'System';
                customerObj.createdBy.employeeId = emp.employeeId; // the string ID like BEL-0001
                customerObj.branchName = emp.branch || customerObj.branchName;
            } else if (customerObj.createdBy) {
                customerObj.createdBy.name = customerObj.createdBy.username || 'System';
                customerObj.createdBy.employeeId = null;
            }
            return customerObj;
        });

        res.json({ success: true, data: mappedCustomers });
    } catch (error) {
        next(new ApiError(error.status || 500, error.message || 'Server error'));
    }
};

const handleApprovalAction = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const { action, remarks, overrideDuplicate } = req.body;
        const adminUser = req.user;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        if (adminUser.role !== 'admin' && adminUser.role !== 'superAdmin') {
            return next(new ApiError(403, 'Only admins can perform approval actions'));
        }

        const customer = await customerApprovalService.processApprovalAction(
            customerId, action, remarks, adminUser, overrideDuplicate, ipAddress, userAgent
        );
        
        res.json({ success: true, message: `Customer ${action.toLowerCase()} successfully`, data: customer });
    } catch (error) {
        if (error.status === 409) {
            return res.status(409).json({
                success: false,
                message: error.message,
                duplicateType: error.duplicateType,
                duplicates: error.duplicates
            });
        }
        next(new ApiError(error.status || 500, error.message || 'Server error'));
    }
};

module.exports = {
    searchCustomer,
    getStatus,
    getDebugInfo,
    getPendingCustomers,
    handleApprovalAction
};
