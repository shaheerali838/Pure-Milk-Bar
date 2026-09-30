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

// 2. Confirm Daily Closing Schema (One-Click Save & Lock)
const confirmDailyClosingSchema = Joi.object({
  date: Joi.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
  }),
  physicalMilkLiters: Joi.number().min(0).required().messages({
    'number.base': 'Physical milk dip liters must be a valid number',
    'any.required': 'Physical milk dip liters is required',
  }),
  physicalCash: Joi.number().min(0).optional().allow(null, ''),
  varianceReason: Joi.string().trim().max(500).optional().allow('', null),
  notes: Joi.string().trim().max(500).optional().allow('', null),
  productPhysicalCounts: Joi.array().items(
    Joi.object({
      productId: Joi.string().optional().allow('', null),
      name: Joi.string().optional().allow('', null),
      count: Joi.number().min(0).required(),
    })
  ).optional().default([]),
});

// 3. Reconcile Daily Closing Schema (Cash counted made optional)
const reconcileDailyClosingSchema = Joi.object({
  physicalMilkDipLiters: Joi.number().min(0).required().messages({
    'number.base': 'Physical milk dip liters must be a valid number',
    'any.required': 'Physical milk dip liters reading is required',
  }),
  physicalCashCounted: Joi.number().min(0).optional().allow(null, ''),
  varianceReason: Joi.string().trim().max(500).optional().allow('', null),
  supervisorNotes: Joi.string().trim().max(500).allow('', null),
});

// 4. Approve Daily Closing Schema
const approveDailyClosingSchema = Joi.object({
  supervisorNotes: Joi.string().trim().max(500).allow('', null),
});

// 5. Reopen Daily Closing Schema
const reopenDailyClosingSchema = Joi.object({
  reopenReason: Joi.string().trim().min(3).max(500).required().messages({
    'string.empty': 'Reopen reason is required',
    'string.min': 'Reopen reason must be at least 3 characters long',
    'any.required': 'Reopen reason is required',
  }),
});

// 6. Record Wastage Schema
const recordWastageSchema = Joi.object({
  date: Joi.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: Joi.string().valid('MILK', 'PRODUCT').default('MILK'),
  productId: Joi.string().optional().allow('', null),
  productName: Joi.string().trim().max(120).optional().allow('', null),
  quantity: Joi.number().positive().min(0.01).required().messages({
    'any.required': 'Wastage quantity is required',
    'number.positive': 'Wastage quantity must be greater than zero',
  }),
  unit: Joi.string().valid('LITER', 'KG', 'PACKET', 'PIECE', 'BOTTLE').default('LITER'),
  reason: Joi.string().valid('SPOILED', 'SPILLAGE', 'CURDLED', 'LINE_WASHING', 'EXPIRED', 'OTHER').default('SPOILED'),
  note: Joi.string().trim().max(500).optional().allow('', null),
});

// Validator Middlewares
export const validateCreateDailyClosing = (req, res, next) => {
  const validated = runValidation(createDailyClosingSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateConfirmDailyClosing = (req, res, next) => {
  const validated = runValidation(confirmDailyClosingSchema, req.body, next);
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

export const validateRecordWastage = (req, res, next) => {
  const validated = runValidation(recordWastageSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};
