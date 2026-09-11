
// Restricts access to routes based on user role attached to req.user
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      const error = new Error('Access denied. User role not found.');
      error.statusCode = 403;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error(
        `Access forbidden. Required role: [${allowedRoles.join(', ')}], your role: '${req.user.role}'`
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

export default authorize;
