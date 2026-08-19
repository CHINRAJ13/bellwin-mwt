const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// ── Storage factory ──────────────────────────────────────────────────────────
// Creates a multer-cloudinary storage engine for a specific customer sub-folder
// and allowed formats.
const createStorage = (subFolder, allowedFormats) =>
    new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const customerId = req.params.id || 'temp';
            return {
                folder: `belwin-erp/customers/${customerId}/${subFolder}`,
                allowed_formats: allowedFormats,
                resource_type: 'auto',
                // Overwrite previous file in same slot to keep storage clean
                public_id: `${subFolder}_${Date.now()}`,
            };
        },
    });

// ── Multer instances ──────────────────────────────────────────────────────────
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_DOC_SIZE   = 10 * 1024 * 1024; // 10 MB

const photoUpload = multer({
    storage: createStorage('photo', ['jpg', 'jpeg', 'png', 'webp']),
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Customer photo must be an image (jpg, jpeg, png, webp)'));
        }
        cb(null, true);
    },
});

const aadhaarUpload = multer({
    storage: createStorage('aadhaar', ['jpg', 'jpeg', 'png', 'pdf']),
    limits: { fileSize: MAX_DOC_SIZE },
    fileFilter(req, file, cb) {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Aadhaar document must be jpg, png or pdf'));
        }
        cb(null, true);
    },
});

const proof2Upload = multer({
    storage: createStorage('proof2', ['jpg', 'jpeg', 'png', 'pdf']),
    limits: { fileSize: MAX_DOC_SIZE },
    fileFilter(req, file, cb) {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Proof 2 document must be jpg, png or pdf'));
        }
        cb(null, true);
    },
});

// Combined upload for all 3 files in one multipart request
const customerMultiUpload = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const customerId = req.params.id || `temp_${Date.now()}`;
            let subFolder;
            if (file.fieldname === 'photo')       subFolder = 'photo';
            else if (file.fieldname === 'aadhaarDoc') subFolder = 'aadhaar';
            else                                   subFolder = 'proof2';

            const allowedImages = ['image/jpeg','image/jpg','image/png','image/webp'];
            const allowedDocs   = ['image/jpeg','image/jpg','image/png','application/pdf'];

            if (file.fieldname === 'photo' && !allowedImages.includes(file.mimetype)) {
                throw new Error('Customer photo must be an image');
            }
            if (['aadhaarDoc','proof2Doc'].includes(file.fieldname) && !allowedDocs.includes(file.mimetype)) {
                throw new Error(`${file.fieldname} must be jpg, png or pdf`);
            }

            return {
                folder: `belwin-jewels/customers/${customerId}`,
                resource_type: 'auto',
                public_id: subFolder,
                overwrite: true,
            };
        },
    }),
    limits: { fileSize: MAX_DOC_SIZE },
}).fields([
    { name: 'photo',      maxCount: 1 },
    { name: 'aadhaarDoc', maxCount: 1 },
    { name: 'proof2Doc',  maxCount: 1 },
]);

// ── Generic memory-storage multer ─────────────────────────────────────────────
// Used when we want to handle Cloudinary uploads manually in the controller
// to control IDs/folder structure dynamically.
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_DOC_SIZE },
});

// ── Delete helper ─────────────────────────────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    } catch (err) {
        console.error('Cloudinary delete error:', err.message);
    }
};

module.exports = { cloudinary, customerMultiUpload, memoryUpload, deleteFromCloudinary };
