import Joi from 'joi';

// ─── Shared Constants ───────────────────────────────────────────────────────
const SHIFTS = ['MORNING', 'EVENING'];

// ─── Reusable ObjectId Validator ────────────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// ─── CREATE MilkingYieldLog Schema ──────────────────────────────────────────
export const createMilkingYieldLogSchema = Joi.object({
  animalId: Joi.string()
    .allow('', null)
    .optional(),

  animalTag: Joi.string()
    .trim()
    .allow('', null)
    .optional(),

  tag: Joi.string()
    .trim()
    .allow('', null)
    .optional(),

  tagNumber: Joi.string()
    .trim()
    .allow('', null)
    .optional(),

  date: Joi.alternatives()
    .try(
      Joi.date().iso(),
      Joi.string().isoDate(),
      Joi.string().regex(/^\d{4}-\d{2}-\d{2}/),
      Joi.date()
    )
    .default(() => new Date())
    .optional(),

  shift: Joi.string()
    .custom((val, helpers) => {
      const u = String(val || '').toUpperCase().trim();
      if (SHIFTS.includes(u)) return u;
      return helpers.error('any.only');
    })
    .default('MORNING')
    .messages({
      'any.only': `Shift must be one of: ${SHIFTS.join(', ')}`,
    }),

  yieldLiters: Joi.number()
    .min(0)
    .max(500)
    .optional(),

  yield: Joi.number()
    .min(0)
    .max(500)
    .optional(),

  quantityLiters: Joi.number()
    .min(0)
    .max(500)
    .optional(),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, '')
    .default(null)
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),

  operatorId: Joi.string()
    .allow(null, '')
    .optional(),
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
