const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Employee document already populated by auth middleware
      const employee = req.user.employeeId;

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Super Admin bypass
      if (employee.role === 'Super Admin') {
        return next();
      }

      // Permission check
      if (
        requiredPermission &&
        !employee.permissions.includes(requiredPermission)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to access this module'
        });
      }

      next();

    } catch (err) {
      console.error('RBAC Error:', err);

      return res.status(500).json({
        success: false,
        message: 'Server authorization error'
      });
    }
  };
};

module.exports = checkPermission;