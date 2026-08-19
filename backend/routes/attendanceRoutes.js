const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getAttendanceSummary,
  deleteAttendance
} = require('../controllers/attendanceController');

router.get('/', protect, getAttendance);
router.get('/summary', protect, getAttendanceSummary);
router.post('/mark', protect, markAttendance);
router.post('/bulk', protect, bulkMarkAttendance);
router.delete('/:id', protect, deleteAttendance);

module.exports = router;
