const ApiError = require('../utils/ApiError');
const { Customer } = require('../models/Customer');
const Counter = require('../models/Counter');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ─────────────────────────────────────────────────────────────────────────────
// Helper — append audit event
// ─────────────────────────────────────────────────────────────────────────────
const addAudit = (customer, action, user, note = '') => {
    customer.auditLog.push({
        action,
        performedBy: user._id,
        role: user.role,
        note,
        timestamp: new Date(),
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (employee + admin)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload document to Cloudinary (standalone)
// @route   POST /api/customers/upload
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Helper — Manual Cloudinary Upload from Buffer
// ─────────────────────────────────────────────────────────────────────────────
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadFromBuffer = (buffer, folder, public_id) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, public_id, overwrite: true, resource_type: 'auto' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload document to Cloudinary (standalone)
// @route   POST /api/customers/upload
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadCustomerDocument = async (req, res, next) => {
    try {
        const files = req.files || {};
        const result = {};

        // If no customerId in query, we can't use the fixed structure properly
        // For standalone, we might use a temp ID or wait for creation
        const customerId = req.query.customerId || `temp_${Date.now()}`;
        const folder = `belwin-jewels/customers/${customerId}`;

        if (req.files) {
            // Because we use memoryStorage for standalone too now
            const photo = req.files.photo?.[0];
            const aadhaar = req.files.aadhaarDoc?.[0];
            const proof2 = req.files.proof2Doc?.[0];

            if (photo) {
                const upload = await uploadFromBuffer(photo.buffer, folder, 'photo');
                result.photo = { url: upload.secure_url, publicId: upload.public_id };
            }
            if (aadhaar) {
                const upload = await uploadFromBuffer(aadhaar.buffer, folder, 'aadhaar');
                result.aadhaarDoc = { url: upload.secure_url, publicId: upload.public_id };
            }
            if (proof2) {
                const upload = await uploadFromBuffer(proof2.buffer, folder, 'proof2');
                result.proof2Doc = { url: upload.secure_url, publicId: upload.public_id };
            }
        }

        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (employee + admin)
// ─────────────────────────────────────────────────────────────────────────────
const createCustomer = async (req, res, next) => {
    const newlyUploadedPublicIds = [];
    
    try {
        // 1. Generate customerId FIRST
        const customerId = await Customer.getNextId();
        const folder = `belwin-jewels/customers/${customerId}`;

        const {
            customerName, guardianName, dateOfBirth, age, gender,
            mobileNumber, alternateNumber, email, aadhaarNumber, panNumber,
            doorStreet, area, city, district, state, postalCode,
            permanentAddress, temporaryAddress, voterId, occupation,
            remarks, proof2Name, proof2Number,
            customerPhotoUrl, customerPhotoPublicId,
            aadhaarDocumentUrl, aadhaarDocumentPublicId,
            panDocumentUrl, panDocumentPublicId,
            passbookDocumentUrl, passbookDocumentPublicId,
            proof2DocumentUrl, proof2DocumentPublicId,
        } = req.body;

        // 2. Handle manual uploads if files provided as buffers
        let photoUrl = customerPhotoUrl, photoId = customerPhotoPublicId;
        let aadhaarUrl = aadhaarDocumentUrl, aadhaarId = aadhaarDocumentPublicId;
        let panUrl = panDocumentUrl, panId = panDocumentPublicId;
        let passbookUrl = passbookDocumentUrl, passbookId = passbookDocumentPublicId;
        let proof2Url = proof2DocumentUrl, proof2Id = proof2DocumentPublicId;

        if (req.files) {
            const photo = req.files.photo?.[0];
            const aadhaar = req.files.aadhaarDoc?.[0];
            const pan = req.files.panDoc?.[0];
            const passbook = req.files.passbookDoc?.[0];
            const proof2 = req.files.proof2Doc?.[0];

            if (photo) {
                const upload = await uploadFromBuffer(photo.buffer, folder, 'photo');
                photoUrl = upload.secure_url; photoId = upload.public_id;
                newlyUploadedPublicIds.push(photoId);
            }
            if (aadhaar) {
                const upload = await uploadFromBuffer(aadhaar.buffer, folder, 'aadhaar');
                aadhaarUrl = upload.secure_url; aadhaarId = upload.public_id;
                newlyUploadedPublicIds.push(aadhaarId);
            }
            if (pan) {
                const upload = await uploadFromBuffer(pan.buffer, folder, 'pan');
                panUrl = upload.secure_url; panId = upload.public_id;
                newlyUploadedPublicIds.push(panId);
            }
            if (passbook) {
                const upload = await uploadFromBuffer(passbook.buffer, folder, 'passbook');
                passbookUrl = upload.secure_url; passbookId = upload.public_id;
                newlyUploadedPublicIds.push(passbookId);
            }
            if (proof2) {
                const upload = await uploadFromBuffer(proof2.buffer, folder, 'proof2');
                proof2Url = upload.secure_url; proof2Id = upload.public_id;
                newlyUploadedPublicIds.push(proof2Id);
            }
        }

        // 3. Create record
        const customer = new Customer({
            customerId, // Manually set generated ID
            customerName, guardianName, dateOfBirth, age, gender,
            mobileNumber, alternateNumber, email, aadhaarNumber, panNumber,
            doorStreet, area, city, district, state, postalCode,
            permanentAddress, temporaryAddress, voterId, occupation,
            remarks, proof2Name, proof2Number,
            nominee: {
                nomineeName: req.body['nominee.nomineeName'] || req.body.nomineeName || '',
                nomineeRelationship: req.body['nominee.nomineeRelationship'] || req.body.nomineeRelationship || '',
                nomineeAge: parseInt(req.body['nominee.nomineeAge'] || req.body.nomineeAge) || null,
                nomineeAddress: req.body['nominee.nomineeAddress'] || req.body.nomineeAddress || ''
            },
            customerPhotoUrl: photoUrl,
            customerPhotoPublicId: photoId,
            aadhaarDocumentUrl: aadhaarUrl,
            aadhaarDocumentPublicId: aadhaarId,
            panDocumentUrl: panUrl,
            panDocumentPublicId: panId,
            passbookDocumentUrl: passbookUrl,
            passbookDocumentPublicId: passbookId,
            proof2DocumentUrl: proof2Url,
            proof2DocumentPublicId: proof2Id,
            status: 'Customer Approval Pending',
            employeeId: req.user._id,
            createdBy: req.user._id,
            branchId: req.user.branch || req.user.branchId || null,
            branchName: req.user.branchName || '',
            // Initialize workflow tracking
            approvalStatus: 'Pending',
            workflowHistory: [{
                action: 'Customer Created',
                performedBy: {
                    id: req.user._id,
                    employeeId: req.user.employeeId,
                    name: req.user.name,
                    role: req.user.role
                },
                date: new Date(),
                remarks: 'Initial customer creation'
            }]
        });

        addAudit(customer, 'CREATED', req.user);
        
        // console.log(`[DEBUG] About to save customer. ID: ${customer.customerId}`);
        // console.log(`[DEBUG] MongoDB Connection Host: ${require('mongoose').connection.host}, DB Name: ${require('mongoose').connection.name}`);
        
        try {
            await customer.save();
            // console.log(`[DEBUG] Customer saved successfully! ID: ${customer._id}`);
        } catch (saveError) {
            console.error(`[DEBUG ERROR] Failed to save customer:`, saveError);
            throw saveError;
        }

        res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (error) {
        console.error('createCustomer error:', error);
        // Rollback Cloudinary
        for (const pid of newlyUploadedPublicIds) {
            await deleteFromCloudinary(pid).catch(() => {});
        }
        next(new ApiError(500, error.message || 'Server error'));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all customers (with search, filter, pagination)
// @route   GET /api/customers
// @access  Private (admin sees all, employee sees own)
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 10,
            search = '',
            status,
            gender,
            city,
            startDate,
            endDate,
            branch,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const query = { isDeleted: { $ne: true } };
        if (req.user) {
            const isGuest = req.user._id === '000000000000000000000000';
            if (req.user.role !== 'admin' && !isGuest) {
                query.createdBy = req.user._id;
            }
        }

        if (search.trim()) {
            query.$or = [
                { customerName:  { $regex: search, $options: 'i' } },
                { mobileNumber:  { $regex: search, $options: 'i' } },
                { customerId:    { $regex: search, $options: 'i' } },
                { aadhaarNumber: { $regex: search, $options: 'i' } },
            ];
        }

        if (status)           query.status = status;
        if (gender)           query.gender = gender;
        if (branch && branch !== 'All') query.branchName = new RegExp('^' + branch.trim() + '$', 'i');
        if (city)             query.city   = { $regex: city, $options: 'i' };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate)   query.createdAt.$lte = new Date(endDate);
        }

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Customer.countDocuments(query);

        let customers = await Customer
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        // Manual populate for createdBy to avoid CastError with admin-override-id
        const mongoose = require('mongoose');
        const userIds = [];
        customers.forEach(c => {
            if (c.createdBy && mongoose.Types.ObjectId.isValid(c.createdBy)) {
                userIds.push(c.createdBy);
            }
        });

        const User = mongoose.model('User');
        const users = await User.find({ _id: { $in: userIds } }).select('username role').lean();
        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        customers = customers.map(c => {
            if (c.createdBy === 'admin-override-id') {
                c.createdBy = { _id: 'admin-override-id', username: 'admin', role: 'admin' };
            } else if (c.createdBy && userMap[c.createdBy.toString()]) {
                c.createdBy = userMap[c.createdBy.toString()];
            } else {
                c.createdBy = null;
            }
            return c;
        });

        res.json({
            success: true,
            data: customers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');
        let query = { isDeleted: { $ne: true } };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            // Check case-insensitive match for customerId
            query.customerId = { $regex: `^${id.trim()}$`, $options: 'i' };
        }

        const customer = await Customer.findOne(query).lean();

        if (!customer) {
            return next(new ApiError(404, 'Customer not found' ));
        }

        // Manual populate for createdBy
        if (customer.createdBy) {
            if (customer.createdBy === 'admin-override-id') {
                customer.createdBy = { _id: 'admin-override-id', username: 'admin', role: 'admin' };
            } else if (mongoose.Types.ObjectId.isValid(customer.createdBy)) {
                const User = mongoose.model('User');
                const creator = await User.findById(customer.createdBy).select('username role').lean();
                customer.createdBy = creator || null;
            } else {
                customer.createdBy = null;
            }
        }

        // Manual populate for auditLog.performedBy
        if (customer.auditLog && customer.auditLog.length > 0) {
            const userIds = [];
            customer.auditLog.forEach(log => {
                if (log.performedBy && mongoose.Types.ObjectId.isValid(log.performedBy)) {
                    userIds.push(log.performedBy);
                }
            });

            const User = mongoose.model('User');
            const users = await User.find({ _id: { $in: userIds } }).select('username role').lean();
            const userMap = {};
            users.forEach(u => {
                userMap[u._id.toString()] = u;
            });

            customer.auditLog = customer.auditLog.map(log => {
                if (log.performedBy === 'admin-override-id') {
                    log.performedBy = { _id: 'admin-override-id', username: 'admin', role: 'admin' };
                } else if (log.performedBy && userMap[log.performedBy.toString()]) {
                    log.performedBy = userMap[log.performedBy.toString()];
                } else {
                    log.performedBy = null;
                }
                return log;
            });
        }

        const isGuest = req.user._id === '000000000000000000000000';
        if (!isGuest && req.user.role !== 'admin') {
            const ownerId = customer.createdBy?._id?.toString() || customer.createdBy?.toString();
            if (ownerId && ownerId !== req.user._id.toString()) {
                return next(new ApiError(403, 'Access denied' ));
            }
        }

        res.json({ success: true, data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update customer info
// @route   PUT /api/customers/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        if (customer.status === 'Approved' || customer.status === 'Rejected') {
            return res.status(403).json({
                success: false,
                message: "Customer is locked. Editing is not allowed."
            });
        }

        const isGuest = req.user._id === '000000000000000000000000';
        if (!isGuest && req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
            const ownerId = customer.createdBy?.toString();
            if (ownerId && ownerId !== req.user._id.toString()) {
                return next(new ApiError(403, 'Access denied' ));
            }
        }

        const allowed = [
            'customerName','guardianName','dateOfBirth','age','gender',
            'mobileNumber','alternateNumber','aadhaarNumber','panNumber',
            'doorStreet','area','city','postalCode','district','state',
            'permanentAddress','temporaryAddress','voterId','occupation',
            'remarks','proof2Name','proof2Number'
        ];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) customer[field] = req.body[field];
        });
        
        if (req.body.nominee) {
            customer.nominee = {
                nomineeName: req.body.nominee.nomineeName || '',
                nomineeRelationship: req.body.nominee.nomineeRelationship || '',
                nomineeAge: parseInt(req.body.nominee.nomineeAge) || null,
                nomineeAddress: req.body.nominee.nomineeAddress || ''
            };
        }

        if (!isGuest) customer.updatedBy = req.user._id;
        
        // Handle Correction Required resubmission
        if (customer.status === 'Correction Required') {
            customer.status = 'Customer Approval Pending';
            customer.approvalStatus = 'Pending';
            customer.adminRemarks = '';
            customer.workflowHistory.push({
                action: 'Customer Updated and Resubmitted',
                performedBy: {
                    id: req.user._id,
                    employeeId: req.user.employeeId,
                    name: req.user.name,
                    role: req.user.role
                },
                date: new Date(),
                remarks: 'Customer resubmitted after correction.'
            });
        }

        addAudit(customer, 'UPDATED', req.user);
        await customer.save();

        res.json({ success: true, message: 'Customer updated', data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload / replace documents
// @route   POST /api/customers/:id/documents
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadDocuments = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        const folder = `belwin-jewels/customers/${customer.customerId}`;
        const files = req.files || {};

        if (req.files) {
            const photo = req.files.photo?.[0];
            const aadhaar = req.files.aadhaarDoc?.[0];
            const proof2 = req.files.proof2Doc?.[0];

            if (photo) {
                const upload = await uploadFromBuffer(photo.buffer, folder, 'photo');
                customer.customerPhotoUrl = upload.secure_url;
                customer.customerPhotoPublicId = upload.public_id;
            }
            if (aadhaar) {
                const upload = await uploadFromBuffer(aadhaar.buffer, folder, 'aadhaar');
                customer.aadhaarDocumentUrl = upload.secure_url;
                customer.aadhaarDocumentPublicId = upload.public_id;
            }
            if (proof2) {
                const upload = await uploadFromBuffer(proof2.buffer, folder, 'proof2');
                customer.proof2DocumentUrl = upload.secure_url;
                customer.proof2DocumentPublicId = upload.public_id;
            }
        }

        addAudit(customer, 'DOCUMENTS_UPDATED', req.user);
        await customer.save();
        res.json({ success: true, message: 'Documents updated', data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    KYC workflow
// ─────────────────────────────────────────────────────────────────────────────
const kycVerify = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        const next = {
            'Customer Approval Pending': 'KYC Verification Pending',
            'KYC Verification Pending':  'KYC Verified',
        }[customer.status];

        if (!next) return next(new ApiError(400, 'Invalid status transition' ));

        customer.status = next;
        addAudit(customer, `STATUS_CHANGED_TO_${next.replace(/ /g,'_').toUpperCase()}`, req.user);
        await customer.save();
        res.json({ success: true, message: `Status updated to ${next}`, data: customer });
    } catch (error) { next(error); }
};

const approveCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));
        if (customer.status !== 'KYC Verified') return next(new ApiError(400, 'Not KYC Verified' ));

        customer.status = 'Approved';
        addAudit(customer, 'APPROVED', req.user);
        await customer.save();
        res.json({ success: true, message: 'Customer approved', data: customer });
    } catch (error) { next(error); }
};

const rejectCustomer = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        customer.status = 'Rejected';
        customer.rejectionReason = reason;
        addAudit(customer, 'REJECTED', req.user, reason);
        await customer.save();
        res.json({ success: true, message: 'Customer rejected', data: customer });
    } catch (error) { next(error); }
};

const deleteCustomer = async (req, res, next) => {
    try {
        const { hardDelete, deleteReason = '' } = req.query;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        if (hardDelete === 'true') {
            if (req.user.role !== 'superAdmin') {
                return next(new ApiError(403, 'Hard delete requires Super Admin privileges' ));
            }
            // Use fixed folder names for safety or stored IDs
            const folder = `belwin-jewels/customers/${customer.customerId}`;
            await deleteFromCloudinary(`${folder}/photo`);
            await deleteFromCloudinary(`${folder}/aadhaar`);
            await deleteFromCloudinary(`${folder}/proof2`);
            
            await Customer.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: 'Customer permanently deleted' });
        }

        customer.isDeleted = true;
        customer.deletedAt = new Date();
        customer.deleteReason = deleteReason.trim();
        customer.deletedBy = req.user._id;
        addAudit(customer, 'DELETED', req.user, deleteReason.trim());
        await customer.save();
        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error('deleteCustomer error:', error);
        if (error.name === 'CastError') {
            return next(new ApiError(400, 'Invalid customer ID format' ));
        }
        next(new ApiError(500, error.message || 'Server error' ));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get audit trail for a customer
// @route   GET /api/customers/:id/audit
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAuditLog = async (req, res, next) => {
    try {
        const customer = await Customer
            .findOne({ _id: req.params.id })
            .select('customerId customerName auditLog')
            .lean();

        if (customer && customer.auditLog && customer.auditLog.length > 0) {
            const mongoose = require('mongoose');
            const userIds = [];
            customer.auditLog.forEach(log => {
                if (log.performedBy && mongoose.Types.ObjectId.isValid(log.performedBy)) {
                    userIds.push(log.performedBy);
                }
            });

            const User = mongoose.model('User');
            const users = await User.find({ _id: { $in: userIds } }).select('username role').lean();
            const userMap = {};
            users.forEach(u => {
                userMap[u._id.toString()] = u;
            });

            customer.auditLog = customer.auditLog.map(log => {
                if (log.performedBy === 'admin-override-id') {
                    log.performedBy = { _id: 'admin-override-id', username: 'admin', role: 'admin' };
                } else if (log.performedBy && userMap[log.performedBy.toString()]) {
                    log.performedBy = userMap[log.performedBy.toString()];
                } else {
                    log.performedBy = null;
                }
                return log;
            });
        }

        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        res.json({ success: true, data: customer });
    } catch (error) { next(error); }
};

const getNextCustomerId = async (req, res, next) => {
    try {
        const counter = await Counter.findOne({ _id: 'customerId' });
        const nextSeq = (counter?.seq || 0) + 1;
        const customerId = `CUST${String(nextSeq).padStart(6, '0')}`;
        res.json({ success: true, customerId });
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all customers whose approvalStatus is Pending
// @route   GET /api/customers/pending
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getPendingCustomers = async (req, res, next) => {
    try {
        const query = { approvalStatus: 'Pending', isDeleted: { $ne: true } };
        const isGuest = req.user._id === '000000000000000000000000';
        if (req.user.role !== 'admin' && !isGuest) {
            query.createdBy = req.user._id;
        }

        const customers = await Customer
            .find(query)
            .lean();

        // Manual populate for createdBy to avoid CastError with admin-override-id
        const mongoose = require('mongoose');
        const userIds = [];
        customers.forEach(c => {
            if (c.createdBy && mongoose.Types.ObjectId.isValid(c.createdBy)) {
                userIds.push(c.createdBy);
            }
        });

        const User = mongoose.model('User');
        const users = await User.find({ _id: { $in: userIds } }).select('username role').lean();
        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        const populatedCustomers = customers.map(c => {
            if (c.createdBy === 'admin-override-id') {
                c.createdBy = { _id: 'admin-override-id', username: 'admin', role: 'admin' };
            } else if (c.createdBy && userMap[c.createdBy.toString()]) {
                c.createdBy = userMap[c.createdBy.toString()];
            } else {
                c.createdBy = null;
            }
            return c;
        });

        res.json({ success: true, data: populatedCustomers });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve customer by MongoDB _id or customerId
// @route   PUT /api/customers/approve/:customerId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const approveCustomerByApprovalId = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const mongoose = require('mongoose');
        let query = { isDeleted: { $ne: true } };

        if (mongoose.Types.ObjectId.isValid(customerId)) {
            query._id = customerId;
        } else {
            query.customerId = { $regex: `^${customerId.trim()}$`, $options: 'i' };
        }

        const customer = await Customer.findOne(query);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found' ));
        }

        if (customer.approvalStatus === 'Approved') {
            return next(new ApiError(400, 'Customer is already approved' ));
        }

        // Update fields
        customer.approvalStatus = 'Approved';
        customer.approvedBy = req.user.username || 'admin';
        customer.approvedDate = new Date();

        // Sync legacy status field if appropriate
        customer.status = 'Approved';

        addAudit(customer, 'APPROVED', req.user, req.body.note || 'Approved via pending review');
        await customer.save();

        res.json({ success: true, message: 'Customer approved successfully', data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject customer by MongoDB _id or customerId
// @route   PUT /api/customers/reject/:customerId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const rejectCustomerByApprovalId = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const { reason } = req.body;
        const mongoose = require('mongoose');
        let query = { isDeleted: { $ne: true } };

        if (mongoose.Types.ObjectId.isValid(customerId)) {
            query._id = customerId;
        } else {
            query.customerId = { $regex: `^${customerId.trim()}$`, $options: 'i' };
        }

        const customer = await Customer.findOne(query);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found' ));
        }

        if (customer.approvalStatus === 'Rejected') {
            return next(new ApiError(400, 'Customer is already rejected' ));
        }

        // Update fields
        customer.approvalStatus = 'Rejected';
        customer.rejectionReason = reason || 'No reason provided';
        customer.rejectedDate = new Date();

        // Sync legacy status field if appropriate
        customer.status = 'Rejected';

        addAudit(customer, 'REJECTED', req.user, reason || 'Rejected via pending review');
        await customer.save();

        res.json({ success: true, message: 'Customer rejected successfully', data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Block or Unblock Customer
// @route   PUT /api/customers/:id/block
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const toggleBlockCustomer = async (req, res, next) => {
    try {
        const { isBlocked, reason, date, remarks } = req.body;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found'));

        customer.isBlocked = isBlocked;
        if (isBlocked) {
            customer.status = 'Blocked';
            customer.blockReason = reason;
            customer.blockDate = date || new Date();
        } else {
            customer.status = 'Approved'; // Restore status
            customer.unblockDate = date || new Date();
        }

        const note = reason + (remarks ? ` | Remarks: ${remarks}` : '');
        addAudit(customer, isBlocked ? 'BLOCKED' : 'UNBLOCKED', req.user, note || (isBlocked ? 'Blocked by admin' : 'Restored by admin'));
        await customer.save();

        res.json({ success: true, message: `Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`, data: customer });
    } catch (error) { next(error); }
};

const getBlockLogs = async (req, res, next) => {
    try {
        const customers = await Customer.find({
            'auditLog.action': { $in: ['BLOCKED', 'UNBLOCKED'] }
        }).lean();

        // Collect performedBy user ids
        const mongoose = require('mongoose');
        const userIds = [];
        customers.forEach(c => {
            if (c.auditLog && c.auditLog.length > 0) {
                c.auditLog.forEach(a => {
                    if (a.performedBy && mongoose.Types.ObjectId.isValid(a.performedBy)) {
                        userIds.push(a.performedBy);
                    }
                });
            }
        });

        const User = mongoose.model('User');
        const users = await User.find({ _id: { $in: userIds } }).select('username name').lean();
        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        // Perform manual mapping
        customers.forEach(c => {
            if (c.auditLog && c.auditLog.length > 0) {
                c.auditLog.forEach(a => {
                    if (a.performedBy === 'admin-override-id') {
                        a.performedBy = { _id: 'admin-override-id', username: 'admin', name: 'admin' };
                    } else if (a.performedBy && userMap[a.performedBy.toString()]) {
                        a.performedBy = userMap[a.performedBy.toString()];
                    } else {
                        a.performedBy = null;
                    }
                });
            }
        });

        let logs = [];
        customers.forEach(c => {
            const blockAudits = c.auditLog.filter(a => a.action === 'BLOCKED' || a.action === 'UNBLOCKED');
            blockAudits.forEach(a => {
                let reason = a.note || '';
                let remarks = '';
                if (reason.includes(' | Remarks: ')) {
                    const parts = reason.split(' | Remarks: ');
                    reason = parts[0];
                    remarks = parts[1];
                }

                logs.push({
                    _id: c._id.toString() + '_' + new Date(a.timestamp).getTime(),
                    date: new Date(a.timestamp).toISOString().split('T')[0],
                    customerId: c.customerId,
                    customerName: c.customerName,
                    action: a.action === 'BLOCKED' ? 'Block' : 'Unblock',
                    reason: reason,
                    approvedBy: a.performedBy ? (a.performedBy.name || a.performedBy.username) : 'Admin',
                    remarks: remarks
                });
            });
        });

        logs.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, data: logs });
    } catch (error) { next(error); }
};

module.exports = {
    createCustomer,
    uploadCustomerDocument,
    getNextCustomerId,
    getCustomers,
    getCustomerById,
    updateCustomer,
    uploadDocuments,
    kycVerify,
    approveCustomer,
    rejectCustomer,
    deleteCustomer,
    getAuditLog,
    getPendingCustomers,
    approveCustomerByApprovalId,
    rejectCustomerByApprovalId,
    toggleBlockCustomer,
    getBlockLogs,
};
