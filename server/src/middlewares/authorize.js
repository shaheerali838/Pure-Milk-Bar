/**
 * RBAC Authorization Middleware
 * Currently disabled per project instruction to allow open access during integration.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Pass through without role restrictions
    next();
  };
};

export default authorize;
