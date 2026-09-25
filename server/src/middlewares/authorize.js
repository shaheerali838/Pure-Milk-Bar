import { ROLE_PERMISSIONS, ROLES } from '../config/rbac.config.js';

/**
 * RBAC Authorization Middleware
 * Can accept role names (e.g. 'ADMIN', 'MANAGER') OR granular permission strings (e.g. 'staff:delete', 'closing:approve_lock').
 */
export const authorize = (...requiredRules) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: No active user session.',
      });
    }

    const userRole = req.user.role;

    // ADMIN role possesses supreme access to all operations
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // Check if requiredRules is matching direct roles (e.g., authorize('ADMIN', 'MANAGER'))
    const matchingDirectRoles = requiredRules.filter((rule) =>
      Object.values(ROLES).includes(rule)
    );

    if (matchingDirectRoles.length > 0) {
      if (matchingDirectRoles.includes(userRole)) {
        return next();
      }
    }

    // Check if requiredRules is matching granular permissions (e.g., authorize('staff:view'))
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    const missingPermissions = requiredRules.filter((rule) => {
      // If rule is a direct role that didn't match, or a permission not in userPermissions
      if (Object.values(ROLES).includes(rule)) {
        return !matchingDirectRoles.includes(userRole);
      }
      return !userPermissions.includes(rule);
    });

    if (missingPermissions.length === 0) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Role [${userRole}] lacks the required authority [${requiredRules.join(', ')}].`,
    });
  };
};

export default authorize;
