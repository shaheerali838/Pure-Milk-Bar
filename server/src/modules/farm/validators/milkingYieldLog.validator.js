import Joi from 'joi';

// ─── Shared Constants ───────────────────────────────────────────────────────
const SHIFTS = ['MORNING', 'EVENING'];

// ─── Reusable ObjectId Validator ────────────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// ─── CREATE MilkingYieldLog Schema ──────────────────────────────────────────
export const createMilkingYieldLogSchema = Joi.object({
  animalId: objectId
    .required()
    .messages({
      'any.required': 'Animal ID is required',
      'string.pattern.name': 'Invalid MongoDB ObjectId format for animalId',
    }),

  date: Joi.date()
    .iso()
    .required()
    .messages({
      'any.required': 'Milking date is required',
      'date.format': 'Date must be a valid ISO 8601 date',
    }),

  shift: Joi.string()
    .valid(...SHIFTS)
    .required()
    .messages({
      'any.required': 'Milking shift is required',
      'any.only': `Shift must be one of: ${SHIFTS.join(', ')}`,
    }),

  yieldLiters: Joi.number()
    .min(0)
    .max(50)
    .required()
    .messages({
      'any.required': 'Yield in liters is required',
      'number.min': 'Yield cannot be negative',
      'number.max': 'Yield exceeds realistic single-animal threshold (50L)',
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, '')
    .default(null)
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),

  // operatorId is normally injected from JWT (req.user._id).
  // Accepted here optionally for Thunder Client testing without auth middleware.
  operatorId: objectId
    .optional()
    .messages({
      'string.pattern.name': 'Invalid MongoDB ObjectId format for operatorId',
    }),
}).options({ stripUnknown: true });

// ─── UPDATE MilkingYieldLog Schema ──────────────────────────────────────────
export const updateMilkingYieldLogSchema = Joi.object({
  yieldLiters: Joi.number()
    .min(0)
    .max(50)
    .messages({
      'number.min': 'Yield cannot be negative',
      'number.max': 'Yield exceeds realistic single-animal threshold (50L)',
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, ''),
}).options({ stripUnknown: true }).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// ─── QUERY Params Schema ────────────────────────────────────────────────────
export const getMilkingYieldLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  animalId: objectId,
  shift: Joi.string().valid(...SHIFTS),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.min': 'endDate must be after startDate',
  }),
}).options({ stripUnknown: true });

// ─── URL Params Schema ─────────────────────────────────────────────────────
export const milkingYieldLogIdParamSchema = Joi.object({
  id: objectId.required().messages({
    'string.pattern.name': 'Invalid MongoDB ObjectId format',
    'any.required': 'Milking yield log ID is required',
  }),
}).options({ stripUnknown: true });
