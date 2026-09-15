import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByResource,
  getAuditStats,
  exportAuditLogs,
} from '../controllers/auditLog.controller.js';

import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

import {
  validateGetAuditLogsQuery,
  validateExportAuditLogsQuery,
} from '../validators/auditLog.validator.js';

const router = Router();

// Protect all audit routes - Authentication Required
router.use(authenticate);

// 1. GET /api/v1/audit-logs/stats (Audit Dashboard Metrics)
router.get(
  '/stats',
  authorize('ADMIN', 'MANAGER'),
  getAuditStats
);

// 2. GET /api/v1/audit-logs/export (Export Audit Trail - CSV / JSON)
router.get(
  '/export',
  authorize('ADMIN'),
  validateExportAuditLogsQuery,
  exportAuditLogs
);

// 3. GET /api/v1/audit-logs/resource/:resource/:resourceId (Resource Entity Audit History)
router.get(
  '/resource/:resource/:resourceId',
  authorize('ADMIN', 'MANAGER'),
  getAuditLogsByResource
);

// 4. GET /api/v1/audit-logs (Get Audit Logs List)
router.get(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validateGetAuditLogsQuery,
  getAuditLogs
);

// 5. GET /api/v1/audit-logs/:id (Get Specific Audit Log Details - MUST BE LAST)
router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  getAuditLogById
);

export default router;
