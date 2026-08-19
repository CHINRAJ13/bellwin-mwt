const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { customerMultiUpload, memoryUpload } = require('../config/cloudinary');
const {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateRejection,
} = require('../middleware/validateCustomer');

// ── Multer error handlers ──────────────────────────────────────────────────────
const uploadMiddleware = (req, res, next) => {
    customerMultiUpload(req, res, (err) => {
        if (!err) return next();
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    });
};

const memoryMiddleware = (req, res, next) => {
    memoryUpload.fields([
        { name: 'photo',       maxCount: 1 },
        { name: 'aadhaarDoc',  maxCount: 1 },
        { name: 'panDoc',      maxCount: 1 },
        { name: 'proof2Doc',   maxCount: 1 },
    ])(req, res, (err) => {
        if (!err) return next();
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    });
};

// ── Inject a default system user when no auth token provided ─────────────────
// This employee portal has no login flow; we attach a guest context so
// createdBy / auditLog fields are always populated safely.
const {
    createCustomer,
    uploadCustomerDocument,
    getCustomers,
    getCustomerById,
    updateCustomer,
    uploadDocuments,
    kycVerify,
    approveCustomer,
    rejectCustomer,
    deleteCustomer,
    getAuditLog,
    getNextCustomerId,
    getPendingCustomers,
    approveCustomerByApprovalId,
    rejectCustomerByApprovalId,
    toggleBlockCustomer,
    getBlockLogs,
} = require('../controllers/customerController');


// ── Routes ─────────────────────────────────────────────────────────────────────
router.get('/audit/blocks', protect, getBlockLogs);
router.get('/next-id', protect, getNextCustomerId);
router.get('/search', getCustomers);
router.get('/filter', getCustomers);
router.get('/pending', protect, getPendingCustomers);
router.put('/approve/:customerId', protect, approveCustomerByApprovalId);
router.put('/reject/:customerId', protect, validateRejection, rejectCustomerByApprovalId);

/**
 * POST   /api/customers/upload -> Standalone upload (returns metadata)
 */
router.post('/upload', protect, memoryMiddleware, protect, uploadCustomerDocument);

/**
 * POST   /api/customers      → Create customer (+ optional file uploads)
 * GET    /api/customers      → List / search / filter / paginate
 */
router.route('/')
    .post(protect, memoryMiddleware, protect, validateCreateCustomer, createCustomer)
    .get(getCustomers);

/**
 * GET    /api/customers/:id  → Single customer
 * PUT    /api/customers/:id  → Update fields
 * DELETE /api/customers/:id  → Soft delete
 */
router.route('/:id')
    .get(protect, getCustomerById)
    .put(protect, validateUpdateCustomer, updateCustomer)
    .delete(protect, deleteCustomer);

/**
 * POST   /api/customers/:id/documents  → Upload / replace Cloudinary files
 */
router.post('/:id/documents', protect, memoryMiddleware, protect, uploadDocuments);

/**
 * PUT    /api/customers/:id/kyc-verify → KYC pipeline step
 */
router.put('/:id/kyc-verify', protect, kycVerify);

/**
 * PUT    /api/customers/:id/approve    → Approve customer
 */
router.put('/:id/approve', protect, approveCustomer);

/**
 * PUT    /api/customers/:id/reject     → Reject with reason
 */
router.put('/:id/reject', protect, validateRejection, rejectCustomer);

/**
 * GET    /api/customers/:id/audit      → Full audit trail
 */
router.get('/:id/audit', protect, getAuditLog);

// Block / Unblock customer
router.put('/:id/block', protect, toggleBlockCustomer);

module.exports = router;
