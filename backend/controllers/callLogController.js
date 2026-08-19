const ApiError = require('../utils/ApiError');
const { CallLog } = require('../models/CallLog');
const { Customer } = require('../models/Customer');

// Create a new call log
exports.createCallLog = async (req, res, next) => {
    try {
        const {
            customerId,
            loanId,
            customerName,
            mobileNumber,
            callDate,
            callTime,
            callType,
            callStatus,
            followupDate,
            remarks,
            employeeName
        } = req.body;

        // Basic validation
        if (!customerId || !callDate || !callStatus) {
            return next(new ApiError(400, 'customerId, callDate, and callStatus are required'
            ));
        }

        const callLog = new CallLog({
            customerId,
            loanId,
            customerName,
            mobileNumber,
            callDate,
            callTime,
            callType,
            callStatus,
            followupDate,
            remarks,
            employeeName
        });

        await callLog.save();

        res.status(201).json({
            success: true,
            data: callLog,
            message: 'Call log created successfully'
        });
    } catch (error) { next(error); }
};

// Get all call logs
exports.getCallLogs = async (req, res, next) => {
    try {
        const callLogs = await CallLog.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: callLogs
        });
    } catch (error) { next(error); }
};

// Get call log by ID
exports.getCallLogById = async (req, res, next) => {
    try {
        const callLog = await CallLog.findOne({ callId: req.params.callId });
        if (!callLog) {
            return next(new ApiError(404, 'Call log not found'
            ));
        }
        res.status(200).json({
            success: true,
            data: callLog
        });
    } catch (error) { next(error); }
};

// Get call logs by customer ID
exports.getCallLogsByCustomerId = async (req, res, next) => {
    try {
        const callLogs = await CallLog.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: callLogs
        });
    } catch (error) { next(error); }
};

// Get call logs report with filters and summary
exports.getCallLogsReport = async (req, res, next) => {
    try {
        const { fromDate, toDate, customerId, callStatus, employeeName } = req.query;
        
        let filter = {};

        if (fromDate || toDate) {
            filter.callDate = {};
            if (fromDate) filter.callDate.$gte = new Date(fromDate);
            if (toDate) filter.callDate.$lte = new Date(toDate);
        }
        
        if (customerId) filter.customerId = new RegExp(customerId, 'i');
        if (callStatus) filter.callStatus = callStatus;
        if (employeeName) filter.employeeName = new RegExp(employeeName, 'i');

        const callLogs = await CallLog.find(filter).sort({ callDate: -1, createdAt: -1 });

        // Calculate summary
        let totalCalls = callLogs.length;
        let pendingFollowups = 0;
        let completedCalls = 0;
        let noResponseCalls = 0;

        callLogs.forEach(log => {
            if (log.callStatus === 'Followup Required') pendingFollowups++;
            else if (log.callStatus === 'Completed') completedCalls++;
            else if (log.callStatus === 'No Response') noResponseCalls++;
        });

        res.status(200).json({
            success: true,
            data: callLogs,
            summary: {
                totalCalls,
                pendingFollowups,
                completedCalls,
                noResponseCalls
            }
        });
    } catch (error) { next(error); }
};
