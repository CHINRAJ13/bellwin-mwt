const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  seedDefaultRoles
} = require('../controllers/rolesController');

router.get('/', protect, getRoles);
router.post('/', protect, createRole);
router.post('/seed', protect, seedDefaultRoles);
router.put('/:id', protect, updateRole);
router.delete('/:id', protect, deleteRole);
router.put('/assign/:employeeId', protect, assignPermissions);

module.exports = router;
