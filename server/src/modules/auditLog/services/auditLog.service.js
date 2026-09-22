import mongoose from 'mongoose';
import AuditLog from '../../../models/AuditLog.model.js';
import User from '../../../models/User.model.js';

/**
 * Safe Helper to create an AuditLog entry internally in any service or middleware
 */
export const logAuditEvent = async ({
  reqUser,
  action,
  resource,
  resourceId = null,
  beforeSnapshot = null,
  afterSnapshot = null,
  status = 'SUCCESS',
  details = null,
  ipAddress = '127.0.0.1',
}) => {
  try {
    let username = 'system';
    let userRole = 'SYSTEM';
    let userId = reqUser?.id || reqUser?._id;

    if (reqUser && reqUser.id) {
      const userObj = await User.findById(reqUser.id).select('username role');
      if (userObj) {
        username = userObj.username;
        userRole = userObj.role || reqUser.role;
      } else {
        username = reqUser.username || 'unknown';
        userRole = reqUser.role || 'USER';
      }
    }

    // Mask sensitive fields in snapshots if present
    const sanitizeSnapshot = (snap) => {
      if (!snap || typeof snap !== 'object') return snap;
      const clean = { ...snap };
      ['password', 'token', 'refreshToken', 'secret'].forEach((key) => {
        if (key in clean) clean[key] = '***MASKED***';
      });
      return clean;
    };

    return await AuditLog.create({
      userId,
      username,
      userRole,
      ipAddress,
      action,
      resource,
      resourceId: resourceId ? resourceId.toString() : null,
      beforeSnapshot: sanitizeSnapshot(beforeSnapshot),
      afterSnapshot: sanitizeSnapshot(afterSnapshot),
      status,
      details,
    });
  } catch (err) {
    console.error('AuditLog creation failed:', err.message);
    return null;
  }
};

/**
 * 1. GET /api/v1/audit-logs - Get Audit Logs List with Pagination & Filtering
 */
export const getAuditLogsService = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};

  if (queryParams.userId) {
    filter.userId = queryParams.userId;
  }

  if (queryParams.action) {
    filter.action = { $regex: queryParams.action, $options: 'i' };
  }

  if (queryParams.resource) {
    filter.resource = { $regex: queryParams.resource, $options: 'i' };
  }

  if (queryParams.resourceId) {
    filter.resourceId = queryParams.resourceId;
  }

  if (queryParams.status) {
    filter.status = queryParams.status.toUpperCase();
  }

  if (queryParams.startDate || queryParams.endDate) {
    filter.timestamp = {};
    if (queryParams.startDate) {
      const s = new Date(queryParams.startDate);
      s.setHours(0, 0, 0, 0);
      filter.timestamp.$gte = s;
    }
    if (queryParams.endDate) {
      const e = new Date(queryParams.endDate);
      e.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = e;
    }
  }

  if (queryParams.search) {
    // Escape special regex characters to prevent ReDoS
    const escapedSearch = queryParams.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');
    filter.$or = [
      { username: searchRegex },
      { action: searchRegex },
      { resource: searchRegex },
      { resourceId: searchRegex },
      { details: searchRegex },
    ];
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'name username role email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Helper: Compute diff comparison between before and after snapshots
 */
const computeSnapshotDiff = (before, after) => {
  if (!before && !after) return null;
  if (!before) return { type: 'CREATED', after };
  if (!after) return { type: 'DELETED', before };

  const diff = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
    const beforeVal = JSON.stringify(before[key]);
    const afterVal = JSON.stringify(after[key]);
    if (beforeVal !== afterVal) {
      diff[key] = {
        before: before[key],
        after: after[key],
      };
    }
  }

  return { type: 'MODIFIED', diff };
};

/**
 * 2. GET /api/v1/audit-logs/:id - Get Audit Log Details by ID
 */
export const getAuditLogByIdService = async (id) => {
  const cleanId = typeof id === 'string' ? id.trim() : id;

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const error = new Error(`Invalid audit log ID format '${cleanId}'`);
    error.statusCode = 400;
    throw error;
  }

  const log = await AuditLog.findById(cleanId).populate('userId', 'name username role email');

  if (!log) {
    const error = new Error(`Audit log record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const logObj = log.toObject();
  logObj.diffSummary = computeSnapshotDiff(logObj.beforeSnapshot, logObj.afterSnapshot);

  return logObj;
};

/**
 * 3. GET /api/v1/audit-logs/resource/:resource/:resourceId - Entity History
 */
export const getAuditLogsByResourceService = async (resource, resourceId, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Escape resource string for regex
  const escapedResource = resource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = {
    resource: { $regex: `^${escapedResource}$`, $options: 'i' },
    resourceId: resourceId.toString(),
  };

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'name username role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    resource,
    resourceId,
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * 4. GET /api/v1/audit-logs/stats - Dashboard Metrics & Activity Stats
 */
export const getAuditStatsService = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalLogs, todayLogs, statusCounts, resourceBreakdown, topUsers] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ timestamp: { $gte: startOfToday } }),
    AuditLog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    AuditLog.aggregate([
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AuditLog.aggregate([
      { $group: { _id: { userId: '$userId', username: '$username' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const formattedStatus = {
    SUCCESS: 0,
    FAILED: 0,
    WARNING: 0,
  };
  statusCounts.forEach((item) => {
    if (item._id) formattedStatus[item._id] = item.count;
  });

  return {
    totalLogs,
    todayLogs,
    statusCounts: formattedStatus,
    resourceBreakdown: resourceBreakdown.map((r) => ({ resource: r._id, count: r.count })),
    topActiveUsers: topUsers.map((u) => ({
      userId: u._id.userId,
      username: u._id.username,
      activityCount: u.count,
    })),
  };
};

/**
 * 5. GET /api/v1/audit-logs/export - Export Audit Logs Data (JSON / CSV)
 */
export const exportAuditLogsService = async (queryParams = {}) => {
  const { logs } = await getAuditLogsService({ ...queryParams, limit: 5000, page: 1 });
  const format = queryParams.format === 'csv' ? 'csv' : 'json';

  if (format === 'csv') {
    const headers = ['Timestamp', 'Username', 'UserRole', 'IPAddress', 'Action', 'Resource', 'ResourceId', 'Status', 'Details'];
    const rows = logs.map((log) => [
      `"${new Date(log.timestamp).toISOString()}"`,
      `"${log.username || ''}"`,
      `"${log.userRole || ''}"`,
      `"${log.ipAddress || ''}"`,
      `"${log.action || ''}"`,
      `"${log.resource || ''}"`,
      `"${log.resourceId || ''}"`,
      `"${log.status || ''}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return { format: 'csv', data: csvContent, filename: `audit-logs-${Date.now()}.csv` };
  }

  return { format: 'json', data: logs };
};
