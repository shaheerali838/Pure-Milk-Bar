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

// 1. Create/Start Daily Closing Schema
const createDailyClosingSchema = Joi.object({
  closingDate: Joi.date().iso().allow('', null),
  openingMilkStock: Joi.number().min(0).default(0),
  openingCash: Joi.number().min(0).default(0),
  supervisorNotes: Joi.string().trim().max(500).allow('', null),
});

// 5. Reconcile Daily Closing Schema
const reconcileDailyClosingSchema = Joi.object({
  physicalMilkDipLiters: Joi.number().min(0).required().messages({
    'number.base': 'Physical milk dip liters must be a valid number',
    'any.required': 'Physical milk dip liters reading is required',
  }),
  physicalCashCounted: Joi.number().min(0).required().messages({
    'number.base': 'Physical cash counted must be a valid number',
    'any.required': 'Physical cash counted is required',
  }),
  supervisorNotes: Joi.string().trim().max(500).allow('', null),
});

// 6. Approve Daily Closing Schema
const approveDailyClosingSchema = Joi.object({
  supervisorNotes: Joi.string().trim().max(500).allow('', null),
});

// 7. Reopen Daily Closing Schema
const reopenDailyClosingSchema = Joi.object({
  reopenReason: Joi.string().trim().min(5).max(500).required().messages({
    'string.empty': 'Reopen reason is required',
    'string.min': 'Reopen reason must be at least 5 characters long',
    'any.required': 'Reopen reason is required',
  }),
});

// Validator Middlewares
export const validateCreateDailyClosing = (req, res, next) => {
  const validated = runValidation(createDailyClosingSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateReconcileDailyClosing = (req, res, next) => {
  const validated = runValidation(reconcileDailyClosingSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateApproveDailyClosing = (req, res, next) => {
  const validated = runValidation(approveDailyClosingSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateReopenDailyClosing = (req, res, next) => {
  const validated = runValidation(reopenDailyClosingSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};
