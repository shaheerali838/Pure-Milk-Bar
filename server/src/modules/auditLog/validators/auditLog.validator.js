import Joi from 'joi';

// Helper validation runner
const runValidation = (schema, data, next) => {
  const { error, value } = schema.validate(data || {}, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    const validationError = new Error(messages);
    validationError.statusCode = 422;
    next(validationError);
    return undefined;
  }
  return value;
};

// 1. Get Audit Logs Query Schema
const getAuditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  userId: Joi.string().trim().hex().length(24).allow('', null),
  action: Joi.string().trim().max(100).allow('', null),
  resource: Joi.string().trim().max(100).allow('', null),
  resourceId: Joi.string().trim().max(100).allow('', null),
  status: Joi.string().trim().valid('SUCCESS', 'FAILED', 'WARNING').uppercase().allow('', null),
  startDate: Joi.date().iso().allow('', null),
  endDate: Joi.date().iso().allow('', null),
  search: Joi.string().trim().max(200).allow('', null),
});

// 2. Export Audit Logs Query Schema
const exportAuditLogsQuerySchema = Joi.object({
  userId: Joi.string().trim().hex().length(24).allow('', null),
  action: Joi.string().trim().max(100).allow('', null),
  resource: Joi.string().trim().max(100).allow('', null),
  status: Joi.string().trim().valid('SUCCESS', 'FAILED', 'WARNING').uppercase().allow('', null),
  startDate: Joi.date().iso().allow('', null),
  endDate: Joi.date().iso().allow('', null),
  format: Joi.string().trim().valid('json', 'csv').default('json'),
});

// Validator Middlewares
export const validateGetAuditLogsQuery = (req, res, next) => {
  const validated = runValidation(getAuditLogsQuerySchema, req.query, next);
  if (validated !== undefined) {
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, validated);
    next();
  }
};

export const validateExportAuditLogsQuery = (req, res, next) => {
  const validated = runValidation(exportAuditLogsQuerySchema, req.query, next);
  if (validated !== undefined) {
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, validated);
    next();
  }
};

