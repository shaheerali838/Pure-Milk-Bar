import {
  getAuditLogsService,
  getAuditLogByIdService,
  getAuditLogsByResourceService,
  getAuditStatsService,
  exportAuditLogsService,
} from '../services/auditLog.service.js';

// 1. GET /api/v1/audit-logs - Get All Audit Logs (List + Filter)
export const getAuditLogs = async (req, res, next) => {
  try {
    const result = await getAuditLogsService(req.query);
    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/v1/audit-logs/stats - Audit Dashboard Stats & Analytics
export const getAuditStats = async (req, res, next) => {
  try {
    const stats = await getAuditStatsService();
    res.status(200).json({
      success: true,
      message: 'Audit statistics generated successfully',
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/v1/audit-logs/export - Export Audit Logs (JSON or CSV Download)
export const exportAuditLogs = async (req, res, next) => {
  try {
    const exportResult = await exportAuditLogsService(req.query);

    if (exportResult.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      return res.status(200).send(exportResult.data);
    }

    res.status(200).json({
      success: true,
      message: 'Audit logs exported successfully',
      data: { logs: exportResult.data },
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET /api/v1/audit-logs/resource/:resource/:resourceId - Entity Specific History
export const getAuditLogsByResource = async (req, res, next) => {
  try {
    const { resource, resourceId } = req.params;
    const result = await getAuditLogsByResourceService(resource, resourceId, req.query);
    res.status(200).json({
      success: true,
      message: `Audit history for resource '${resource}' retrieved successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET /api/v1/audit-logs/:id - Specific Audit Log Details by ID
export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await getAuditLogByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Audit log details retrieved successfully',
      data: { log },
    });
  } catch (error) {
    next(error);
  }
};
