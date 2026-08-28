import { ROLE_PERMISSIONS } from '../constants/rolePermissions.js';
import { ROLES } from '../constants/roles.js';

export const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User identity not found.',
      });
    }

    const { role } = req.user;
    if (role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const allowedPermissions = ROLE_PERMISSIONS[role] || [];
    if (!allowedPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${requiredPermission}].`,
      });
    }

    next();
  };
};