import Joi from 'joi';

// ─── Shared Constants ───────────────────────────────────────────────────────
const SHIFTS = ['MORNING', 'EVENING'];
const STATUSES = ['ACCEPTED', 'REJECTED', 'PENDING'];

// ─── Reusable ObjectId Validator ────────────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// ─── CREATE MilkProcurement Schema ──────────────────────────────────────────
export const createProcurementSchema = Joi.object({
  supplierId: objectId
    .required()
    .messages({
      'any.required': 'Supplier ID is required',
      'string.pattern.name': 'Invalid Supplier ID format',
    }),

  batchNumber: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(30)
    .required()
    .messages({
      'any.required': 'Batch number is required',
      'string.empty': 'Batch number cannot be empty',
      'string.max': 'Batch number cannot exceed 30 characters',
    }),

  date: Joi.date()
    .iso()
    .default(() => new Date())
    .messages({
      'date.format': 'Date must be a valid ISO 8601 date',
    }),

  shift: Joi.string()
    .valid(...SHIFTS)
    .required()
    .messages({
      'any.required': 'Shift is required',
      'any.only': `Shift must be one of: ${SHIFTS.join(', ')}`,
    }),

  quantityLiters: Joi.number()
    .min(0.1)
    .required()
    .messages({
      'any.required': 'Quantity in liters is required',
      'number.min': 'Quantity must be greater than 0',
    }),

  fatPercentage: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'FAT percentage is required',
      'number.min': 'FAT percentage cannot be negative',
    }),

  lactometerReading: Joi.number()
    .required()
    .messages({
      'any.required': 'Lactometer reading (LR) is required',
    }),

  snfCalculated: Joi.number()
    .required()
    .messages({
      'any.required': 'Calculated SNF is required',
    }),

  ratePerLiter: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Rate per liter is required',
      'number.min': 'Rate per liter cannot be negative',
    }),

  totalAmount: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Total amount is required',
      'number.min': 'Total amount cannot be negative',
    }),

  amountPaid: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Amount paid cannot be negative',
    }),

  balanceAddedToKhata: Joi.number()
    .required()
    .messages({
      'any.required': 'Balance added to khata is required',
    }),

  dockInspectorId: objectId
    .required()
    .messages({
      'any.required': 'Dock inspector User ID is required',
      'string.pattern.name': 'Invalid Dock Inspector ID format',
    }),

  status: Joi.string()
    .valid(...STATUSES)
    .default('ACCEPTED')
    .messages({
      'any.only': `Status must be one of: ${STATUSES.join(', ')}`,
    }),
}).options({ stripUnknown: true });

// ─── UPDATE MilkProcurement Schema ──────────────────────────────────────────
export const updateProcurementSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .messages({
      'any.only': `Status must be one of: ${STATUSES.join(', ')}`,
    }),

  amountPaid: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Amount paid cannot be negative',
    }),

  notes: Joi.string().trim().max(500).allow(null, ''),
})
  .options({ stripUnknown: true })
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

// ─── QUERY Params Schema ─────────────────────────────────────────────────────
export const getProcurementsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  supplierId: objectId,
  shift: Joi.string().valid(...SHIFTS),
  status: Joi.string().valid(...STATUSES),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')),
}).options({ stripUnknown: true });

// ─── URL Params Schema ───────────────────────────────────────────────────────
export const procurementIdParamSchema = Joi.object({
  id: objectId.required().messages({
    'string.pattern.name': 'Invalid MongoDB ObjectId format',
    'any.required': 'Procurement ID is required',
  }),
}).options({ stripUnknown: true });
