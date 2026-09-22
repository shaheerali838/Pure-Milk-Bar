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
    .max(30)
    .allow('', null)
    .optional(),

  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'Supplier name is required',
      'string.empty': 'Supplier name cannot be empty',
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .required()
    .messages({
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number cannot be empty',
      'string.pattern.base': 'Phone number must be 7–20 digits',
    }),

  contact: Joi.string().trim().allow('', null),

  villageOrLocation: Joi.string()
    .trim()
    .max(100)
    .default('Central Location'),

  area: Joi.string().trim().max(100).allow('', null),
  address: Joi.string().trim().max(300).allow('', null),

  milkType: Joi.string()
    .trim()
    .uppercase()
    .valid(...MILK_TYPES)
    .default('BUFFALO'),

  baseRatePerLiter: Joi.number()
    .min(0)
    .default(220),

  baseRate: Joi.number().min(0).allow(null),
  ratePerLiter: Joi.number().min(0).allow(null),
  expectedDailyQuantity: Joi.number().min(0).allow(null),
  avgLiters: Joi.number().min(0).allow(null),

  standardFat: Joi.number()
    .min(0)
    .max(15)
    .default(6.0),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, '')
    .default(null),
}).options({ stripUnknown: true });

// ─── UPDATE Supplier Schema ──────────────────────────────────────────────────
export const updateSupplierSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(1)
    .max(30),

  name: Joi.string()
    .trim()
    .min(1)
    .max(100),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/),

  villageOrLocation: Joi.string()
    .trim()
    .max(100),

  area: Joi.string().trim().max(100).allow('', null),
  address: Joi.string().trim().max(300).allow('', null),

  milkType: Joi.string()
    .trim()
    .uppercase()
    .valid(...MILK_TYPES),

  baseRatePerLiter: Joi.number()
    .min(0),

  baseRate: Joi.number().min(0).allow(null),
  ratePerLiter: Joi.number().min(0).allow(null),

  standardFat: Joi.number()
    .min(0)
    .max(15),

  isActive: Joi.boolean(),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, ''),
}).options({ stripUnknown: true }).min(1);

// ─── GET Suppliers Query Schema ─────────────────────────────────────────────
export const getSuppliersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  milkType: Joi.string().valid(...MILK_TYPES),
  isActive: Joi.boolean(),
  search: Joi.string().trim().max(50),
}).options({ stripUnknown: true });

// ─── Supplier ID Param Schema ───────────────────────────────────────────────
export const supplierIdParamSchema = Joi.object({
  id: Joi.string().required(),
}).options({ stripUnknown: true });

export default {
  createSupplierSchema,
  updateSupplierSchema,
  getSuppliersQuerySchema,
  supplierIdParamSchema,
};
