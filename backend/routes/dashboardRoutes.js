const express = require('express');
const router = express.Router();

const { getEmployeeStats, getMenuPermissions, getAdminDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');

// Get permission-based menu
router.get('/menu', protect, getMenuPermissions);

// Get dashboard stats
router.get('/stats', protect,
  checkPermission('dashboard:view'),
  getEmployeeStats
);

// Get admin dashboard stats
router.get('/admin-stats', protect, getAdminDashboardData);

module.exports = router;