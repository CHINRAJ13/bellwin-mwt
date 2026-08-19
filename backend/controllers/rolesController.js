const Role = require('../models/Role');
const Employee = require('../models/Employee');

/* =============================
   GET ALL ROLES
   GET /api/roles
============================= */
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json({ success: true, roles });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   CREATE ROLE
   POST /api/roles
============================= */
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Role name already exists' });
    }

    const role = await Role.create({
      name: name.trim(),
      description: description || '',
      permissions: permissions || [],
      createdBy: req.user?.id
    });

    return res.status(201).json({ success: true, message: 'Role created', role });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   UPDATE ROLE
   PUT /api/roles/:id
============================= */
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    if (role.isSystem && req.body.name && req.body.name !== role.name) {
      return res.status(400).json({ success: false, message: 'Cannot rename system roles' });
    }

    const updated = await Role.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );

    return res.json({ success: true, message: 'Role updated', role: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   DELETE ROLE
   DELETE /api/roles/:id
============================= */
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    if (role.isSystem) {
      return res.status(403).json({ success: false, message: 'Cannot delete system roles' });
    }

    await Role.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   ASSIGN ROLE PERMISSIONS TO EMPLOYEE
   PUT /api/roles/assign/:employeeId
============================= */
exports.assignPermissions = async (req, res) => {
  try {
    const { permissions, role } = req.body;
    const { employeeId } = req.params;

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const updateData = {};
    if (permissions !== undefined) updateData.permissions = permissions;
    if (role !== undefined) updateData.role = role;

    const updated = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updateData },
      { returnDocument: 'after' }
    ).select('-passwordHash');

    // Sync role to User account if it exists
    if (role !== undefined) {
      const User = require('../models/User');
      await User.findOneAndUpdate({ employeeId: employeeId }, { role: role });
    }

    return res.json({ success: true, message: 'Permissions updated', employee: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   SEED DEFAULT ROLES (util route)
   POST /api/roles/seed
============================= */
exports.seedDefaultRoles = async (req, res) => {
  try {
    const defaults = [
      {
        name: 'Super Admin',
        description: 'Full access to all modules',
        permissions: ['*'],
        isSystem: true
      },
      {
        name: 'HR',
        description: 'Human Resources Management',
        permissions: [
          'employees:view', 'employees:add', 'employees:edit',
          'attendance:view', 'attendance:add', 'attendance:edit',
          'salary:view', 'salary:generate', 'salary:export'
        ],
        isSystem: true
      },
      {
        name: 'Manager',
        description: 'Branch & Team Management',
        permissions: [
          'employees:view', 'attendance:view', 'attendance:approve',
          'salary:view', 'reports:view'
        ],
        isSystem: true
      },
      {
        name: 'Employee',
        description: 'Standard employee access',
        permissions: ['dashboard:view', 'info:view'],
        isSystem: true
      }
    ];

    for (const d of defaults) {
      await Role.findOneAndUpdate(
        { name: d.name },
        d,
        { upsert: true, returnDocument: 'after' }
      );
    }

    return res.json({ success: true, message: 'Default roles seeded' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
