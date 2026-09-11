/**
 * Layer 5: Joi Validation Schemas for Supplier domain.
 * Defines strict schemas for body, query, and params.
 * Uses .options({ stripUnknown: true }) to prevent mass assignment.
 */
import Joi from 'joi';

// ─── Shared Constants ───────────────────────────────────────────────────────
const MILK_TYPES = ['COW', 'BUFFALO', 'MIXED'];

// ─── Reusable ObjectId Validator ────────────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// ─── CREATE Supplier Schema ──────────────────────────────────────────────────
export const createSupplierSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(20)
    .required()
    .messages({
      'any.required': 'Supplier code is required',
      'string.empty': 'Supplier code cannot be empty',
      'string.max': 'Supplier code cannot exceed 20 characters',
    }),

  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Supplier name is required',
      'string.empty': 'Supplier name cannot be empty',
      'string.max': 'Supplier name cannot exceed 100 characters',
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s]{7,15}$/)
    .required()
    .messages({
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number cannot be empty',
      'string.pattern.base': 'Phone number must be 7–15 digits',
    }),

  villageOrLocation: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Village or location is required',
      'string.empty': 'Village or location cannot be empty',
    }),

  milkType: Joi.string()
    .valid(...MILK_TYPES)
    .required()
    .messages({
      'any.required': 'Milk type is required',
      'any.only': `Milk type must be one of: ${MILK_TYPES.join(', ')}`,
    }),

  baseRatePerLiter: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Base rate per liter is required',
      'number.min': 'Base rate cannot be negative',
    }),

  standardFat: Joi.number()
    .min(0)
    .default(6.0)
    .messages({
      'number.min': 'Standard FAT cannot be negative',
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, '')
    .default(null)
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
}).options({ stripUnknown: true });

// ─── UPDATE Supplier Schema ──────────────────────────────────────────────────
export const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s]{7,15}$/)
    .messages({
      'string.pattern.base': 'Phone number must be 7–15 digits',
    }),

  villageOrLocation: Joi.string().trim().min(2).max(100),

  milkType: Joi.string()
    .valid(...MILK_TYPES)
    .messages({
      'any.only': `Milk type must be one of: ${MILK_TYPES.join(', ')}`,
    }),

  baseRatePerLiter: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Base rate cannot be negative',
    }),

  standardFat: Joi.number().min(0),

  isActive: Joi.boolean(),

  notes: Joi.string().trim().max(500).allow(null, ''),
})
  .options({ stripUnknown: true })
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

// ─── QUERY Params Schema ─────────────────────────────────────────────────────
export const getSuppliersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  milkType: Joi.string().valid(...MILK_TYPES),
  isActive: Joi.boolean(),
  search: Joi.string().trim().max(50),
}).options({ stripUnknown: true });

// ─── URL Params Schema ───────────────────────────────────────────────────────
export const supplierIdParamSchema = Joi.object({
  id: objectId.required().messages({
    'string.pattern.name': 'Invalid MongoDB ObjectId format',
    'any.required': 'Supplier ID is required',
  }),
}).options({ stripUnknown: true });
