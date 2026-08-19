const mongoose = require('mongoose');
const { Customer } = require('../models/Customer');

const getPendingApprovals = async () => {
    const customers = await Customer.find({ 
        status: 'Customer Approval Pending', 
        isDeleted: { $ne: true } 
    }).lean();

    const userIds = [];
    customers.forEach(c => {
        if (c.createdBy && mongoose.Types.ObjectId.isValid(c.createdBy)) {
            userIds.push(c.createdBy);
        }
    });

    const User = mongoose.model('User');
    const users = await User.find({ _id: { $in: userIds } })
        .populate({
            path: 'employeeId',
            model: 'Employee',
            select: 'firstName lastName employeeId branch'
        })
        .select('username role employeeId')
        .lean();

    const userMap = {};
    users.forEach(u => {
        userMap[u._id.toString()] = u;
    });

    return customers.map(c => {
        if (c.createdBy === 'admin-override-id') {
            c.createdBy = {
                _id: 'admin-override-id',
                username: 'admin',
                role: 'admin',
                employeeId: null
            };
        } else if (c.createdBy && userMap[c.createdBy.toString()]) {
            c.createdBy = userMap[c.createdBy.toString()];
        } else {
            c.createdBy = null;
        }
        return c;
    });
};

const processApprovalAction = async (customerId, action, remarks, adminUser, overrideDuplicate, ipAddress, userAgent) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw { status: 404, message: 'Customer not found' };
    }

    if (customer.status !== 'Customer Approval Pending') {
        throw { status: 400, message: 'Customer is not in a pending state' };
    }

    // Duplicate Check only if action is Approve
    if (action === 'Approve') {
        const duplicates = await Customer.find({
            _id: { $ne: customer._id },
            isDeleted: { $ne: true },
            $or: [
                { aadhaarNumber: customer.aadhaarNumber, aadhaarNumber: { $ne: '' } },
                { panNumber: customer.panNumber, panNumber: { $ne: '' } },
                { mobileNumber: customer.mobileNumber }
            ]
        });

        if (duplicates.length > 0 && !overrideDuplicate) {
            const hardDuplicates = duplicates.filter(d => 
                (d.aadhaarNumber && d.aadhaarNumber === customer.aadhaarNumber) || 
                (d.panNumber && d.panNumber === customer.panNumber)
            );
            
            const duplicateType = hardDuplicates.length > 0 ? 'Hard' : 'Possible';
            
            throw { 
                status: 409, 
                message: `${duplicateType} Duplicate Detected`,
                duplicateType,
                duplicates: duplicates.map(d => ({
                    customerId: d.customerId,
                    customerName: d.customerName,
                    mobileNumber: d.mobileNumber,
                    aadhaarNumber: d.aadhaarNumber,
                    panNumber: d.panNumber,
                    status: d.status
                }))
            };
        }
    }

    const workflowAction = 
        action === 'Approve' && overrideDuplicate ? 'Duplicate Override Approval' :
        action === 'Approve' ? 'Approved' :
        action === 'Reject' ? 'Rejected' :
        'Sent Back For Correction';

    customer.workflowHistory.push({
        action: workflowAction,
        performedBy: {
            id: adminUser._id,
            employeeId: adminUser.employeeId,
            name: adminUser.name || adminUser.username,
            role: adminUser.role
        },
        date: new Date(),
        remarks: remarks || ''
    });

    customer.adminRemarks = remarks;

    if (action === 'Approve') {
        customer.status = 'Approved';
        customer.approvalStatus = 'Approved';
        customer.approvedBy = adminUser._id;
        customer.approvedDate = new Date();
        customer.approvalIpAddress = ipAddress;
        customer.approvalUserAgent = userAgent;
    } else if (action === 'Reject') {
        customer.status = 'Rejected';
        customer.approvalStatus = 'Rejected';
        customer.rejectedDate = new Date();
        customer.rejectionReason = remarks;
    } else if (action === 'Send Back') {
        customer.status = 'Correction Required';
    } else {
        throw { status: 400, message: 'Invalid action' };
    }

    await customer.save();
    return customer;
};

const findCustomerForApproval = async (customerId, user) => {
    if (!customerId) throw { status: 400, message: 'Invalid customerId' };
    const cleanId = customerId.trim();
    const customer = await Customer.findOne({ 
        customerId: { $regex: `^${cleanId}$`, $options: "i" }, 
        isDeleted: { $ne: true } 
    });
    if (!customer) throw { status: 404, message: 'No Customer Found' };
    return {
        customerId: customer.customerId,
        customerName: customer.customerName,
        mobile: customer.mobileNumber,
        employee: customer.createdBy ? 'Assigned' : 'Unassigned',
        createdAt: customer.createdAt,
        kycStatus: customer.status,
        loanDetails: customer.loanDetails,
        approvalStatus: customer.approvalStatus
    };
};

const getLoanStatus = async (customerId) => {
    if (!customerId) throw { status: 400, message: 'Invalid customerId' };
    const customer = await Customer.findOne({ customerId, isDeleted: { $ne: true } });
    if (!customer) throw { status: 404, message: 'Customer not found' };
    const { loanDetails, approvalStatus, rejectionReason } = customer;
    return {
        applicationNumber: loanDetails.applicationNumber || 'N/A',
        loanAmount: loanDetails.loanAmount || 0,
        loanType: loanDetails.loanType || 'N/A',
        appliedDate: loanDetails.appliedDate || customer.createdAt,
        currentStatus: approvalStatus,
        approvalDate: loanDetails.approvalDate || null,
        rejectionReason: rejectionReason || null
    };
};

module.exports = {
    getPendingApprovals,
    processApprovalAction,
    findCustomerForApproval,
    getLoanStatus
};
