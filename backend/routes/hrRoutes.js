const express = require('express');
const router = express.Router();

const { createHR, getDashboardStats, getHRProfile } = require('../controllers/hrController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Admin-only: create HR user
router.post('/create', protect, admin, createHR);

// HR-only routes
router.get('/dashboard-stats', protect, authorize('hr', 'admin'), getDashboardStats);
router.get('/profile', protect, authorize('hr'), getHRProfile);

module.exports = router;
