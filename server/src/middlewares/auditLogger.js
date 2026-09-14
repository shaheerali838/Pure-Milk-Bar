import { logAuditEvent } from '../modules/auditLog/services/auditLog.service.js';

/**
 * System Security Audit Logging Middleware Interceptor
 * Usage in routes: auditInterceptor('CREATE_CUSTOMER', 'Customer')
 */
export const auditInterceptor = (actionName, resourceName) => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      res.json = originalJson; // Restore original

      // Only log on successful responses (2xx) or explicit failures
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = data?.data?.closing?._id || data?.data?.customer?._id || data?.data?.user?._id || data?.data?.id || req.params.id || null;

        logAuditEvent({
          reqUser: req.user,
          action: actionName,
          resource: resourceName,
          resourceId,
          afterSnapshot: data?.data || null,
          status: 'SUCCESS',
          details: `${actionName} executed successfully via API`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        }).catch((err) => console.error('AuditInterceptor error:', err.message));
      }

      return res.json.apply(this, arguments);
    };

    next();
  };
};
