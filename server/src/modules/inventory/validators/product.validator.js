import Joi from 'joi';

// ─── Shared Constants ───────────────────────────────────────────────────────
const UNIT_TYPES = ['LITER', 'KG', 'PACKET', 'PIECE'];

// ─── Reusable ObjectId Validator ────────────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// ─── CREATE Product Schema ──────────────────────────────────────────────────
export const createProductSchema = Joi.object({
  sku: Joi.string()
    .trim()
    .min(1)
    .max(30)
    .uppercase()
    .required()
    .messages({
      'any.required': 'Product SKU is required',
      'string.empty': 'SKU cannot be empty',
      'string.max': 'SKU cannot exceed 30 characters',
    }),

  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'Product name is required',
      'string.empty': 'Product name cannot be empty',
      'string.max': 'Product name cannot exceed 100 characters',
    }),

  category: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'any.required': 'Category is required',
      'string.empty': 'Category cannot be empty',
      'string.max': 'Category cannot exceed 50 characters',
    }),

  unit: Joi.string()
    .valid(...UNIT_TYPES)
    .default('LITER')
    .messages({
      'any.only': `Unit must be one of: ${UNIT_TYPES.join(', ')}`,
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Retail selling price is required',
      'number.min': 'Price cannot be negative',
    }),

  costPrice: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Cost price is required',
      'number.min': 'Cost price cannot be negative',
    }),

  currentStock: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Stock cannot be negative',
    }),

  minimumAlertStock: Joi.number()
    .min(0)
    .default(10)
    .messages({
      'number.min': 'Minimum alert stock cannot be negative',
    }),

  isAvailableForPos: Joi.boolean()
    .default(true),

  isAvailableForDelivery: Joi.boolean()
    .default(true),
}).options({ stripUnknown: true });

// ─── UPDATE Product Schema ──────────────────────────────────────────────────
export const updateProductSchema = Joi.object({
  sku: Joi.string()
    .trim()
    .min(1)
    .max(30)
    .uppercase()
    .messages({
      'string.empty': 'SKU cannot be empty',
      'string.max': 'SKU cannot exceed 30 characters',
    }),

  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Product name cannot be empty',
      'string.max': 'Product name cannot exceed 100 characters',
    }),

  category: Joi.string()
    .trim()
    .min(1)
    .max(50),

  unit: Joi.string()
    .valid(...UNIT_TYPES)
    .messages({
      'any.only': `Unit must be one of: ${UNIT_TYPES.join(', ')}`,
    }),

  price: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Price cannot be negative',
    }),

  costPrice: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Cost price cannot be negative',
    }),

  currentStock: Joi.number()
    .min(0),

  minimumAlertStock: Joi.number()
    .min(0),

  isAvailableForPos: Joi.boolean(),

  isAvailableForDelivery: Joi.boolean(),
}).options({ stripUnknown: true }).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// ─── QUERY Params Schema ────────────────────────────────────────────────────
export const getProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string().trim().max(50),
  unit: Joi.string().valid(...UNIT_TYPES),
  isAvailableForPos: Joi.boolean(),
  isAvailableForDelivery: Joi.boolean(),
  search: Joi.string().trim().max(50),
}).options({ stripUnknown: true });

// ─── URL Params Schema ─────────────────────────────────────────────────────
export const productIdParamSchema = Joi.object({
  id: objectId.required().messages({
    'string.pattern.name': 'Invalid MongoDB ObjectId format',
    'any.required': 'Product ID is required',
  }),
}).options({ stripUnknown: true });
