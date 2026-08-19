const express = require('express');
const router = express.Router();
const schemeAllocationController = require('../controllers/schemeAllocationController');

router.post('/', schemeAllocationController.createAllocation);
router.get('/', schemeAllocationController.getAllocations);
router.get('/:id', schemeAllocationController.getAllocationById);
router.put('/:id', schemeAllocationController.updateAllocation);
router.delete('/:id', schemeAllocationController.deleteAllocation);

module.exports = router;
