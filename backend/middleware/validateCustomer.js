const { body, validationResult } = require('express-validator');

// ── Report validation errors ──────────────────────────────────────────────────
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

// ── Create customer validation rules ─────────────────────────────────────────
const validateCreateCustomer = [
    body('customerName')
        .trim().notEmpty().withMessage('Customer name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Customer name must be 2–100 characters'),

    body('guardianName')
        .trim().notEmpty().withMessage('Guardian name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Guardian name must be 2–100 characters'),

    body('age')
        .notEmpty().withMessage('Age is required')
        .toInt()
        .isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),

    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

    body('dateOfBirth')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Date of birth must be a valid date'),

    body('mobileNumber')
        .trim().notEmpty().withMessage('Mobile number is required')
        .customSanitizer(v => v ? v.replace(/\s/g, '') : v)
        .matches(/^[6-9]\d{9}$/).withMessage('Mobile number must be a valid 10-digit Indian number'),

    body('alternateNumber')
        .optional({ checkFalsy: true })
        .customSanitizer(v => v ? v.replace(/\s/g, '') : v)
        .matches(/^[6-9]\d{9}$/).withMessage('Alternate number must be a valid 10-digit Indian number'),

    body('aadhaarNumber')
        .optional({ checkFalsy: true })
        .customSanitizer(v => v ? v.replace(/\s/g, '') : v)
        .matches(/^\d{12}$/).withMessage('Aadhaar must be a 12-digit number'),

    body('panNumber')
        .optional({ checkFalsy: true })
        .customSanitizer(v => v ? v.replace(/\s/g, '').toUpperCase() : v)
        .isAlphanumeric().withMessage('PAN must contain only letters and numbers')
        .isLength({ min: 10, max: 10 }).withMessage('PAN must be exactly 10 characters'),

    body('doorStreet')
        .trim().notEmpty().withMessage('Door No/Street is required'),

    body('area')
        .trim().notEmpty().withMessage('Area is required'),

    body('postalCode')
        .optional({ checkFalsy: true })
        .matches(/^\d{6}$/).withMessage('Postal code must be 6 digits'),

    handleValidation,
];

// ── Update customer validation rules ─────────────────────────────────────────
const validateUpdateCustomer = [
    body('customerName')
        .optional()
        .trim().notEmpty().withMessage('Customer name cannot be empty')
        .isLength({ min: 2, max: 100 }).withMessage('Customer name must be 2–100 characters'),

    body('age')
        .optional({ checkFalsy: true })
        .toInt()
        .isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),

    body('mobileNumber')
        .optional()
        .customSanitizer(v => v ? v.replace(/\s/g, '') : v)
        .matches(/^[6-9]\d{9}$/).withMessage('Mobile number must be a valid 10-digit Indian number'),

    body('panNumber')
        .optional({ checkFalsy: true })
        .customSanitizer(v => v ? v.replace(/\s/g, '').toUpperCase() : v)
        .isAlphanumeric().withMessage('PAN must contain only letters and numbers')
        .isLength({ min: 10, max: 10 }).withMessage('PAN must be exactly 10 characters'),

    body('aadhaarNumber')
        .optional({ checkFalsy: true })
        .customSanitizer(v => v ? v.replace(/\s/g, '') : v)
        .matches(/^\d{12}$/).withMessage('Aadhaar must be a 12-digit number'),

    handleValidation,
];

// ── Reject reason validation ──────────────────────────────────────────────────
const validateRejection = [
    body('reason')
        .trim().notEmpty().withMessage('Rejection reason is required')
        .isLength({ min: 5, max: 500 }).withMessage('Rejection reason must be 5–500 characters'),

    handleValidation,
];

module.exports = { validateCreateCustomer, validateUpdateCustomer, validateRejection };
