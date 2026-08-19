const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const callLogController = require('../controllers/callLogController');

// Define routes
router.post('/', protect, callLogController.createCallLog);
router.get('/', protect, callLogController.getCallLogs);
router.get('/report', protect, callLogController.getCallLogsReport);
router.get('/:callId', protect, callLogController.getCallLogById);
router.get('/customer/:customerId', protect, callLogController.getCallLogsByCustomerId);

module.exports = router;
