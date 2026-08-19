const express = require('express');
const router = express.Router();

const {
    getEmployees,
    getEmployeeStats,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getNextEmployeeId,
    toggleEmployeeStatus,
    resetPassword,
    promoteEmployee
} = require('../controllers/employeeController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const { memoryUpload } = require('../config/cloudinary');

router.get('/stats', protect, getEmployeeStats);
router.get('/next-id', protect, getNextEmployeeId);
router.post('/reset-password', protect, authorize('admin', 'hr'), resetPassword);
router.patch('/toggle-status/:id', protect, authorize('admin', 'hr'), toggleEmployeeStatus);
router.patch('/:id/promote', protect, authorize('admin', 'hr'), promoteEmployee);

router.route('/')
    .get(protect, getEmployees)
    .post(protect, authorize('admin', 'hr'), memoryUpload.single('document'), createEmployee);

router.route('/:id')
    .get(protect, getEmployeeById)
    .put(protect, authorize('admin', 'hr'), memoryUpload.single('document'), updateEmployee)
    .delete(protect, authorize('admin', 'hr'), deleteEmployee);

module.exports = router;
