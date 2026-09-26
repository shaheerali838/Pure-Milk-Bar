import Joi from 'joi';

// ─── Enums & Constants ────────────────────────────────────────────────────────
const FULFILLMENT_TYPES = ['COUNTER', 'DELIVERY', 'TAKEAWAY'];
const PAYMENT_METHODS = ['CASH', 'KHATA', 'ONLINE', 'SPLIT'];
const UNIT_TYPES = ['LITER', 'KG', 'PACKET', 'PIECE'];

// ─── Reusable ObjectId Validator ──────────────────────────────────────────────
const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId')
  .messages({
    'string.pattern.name': 'Invalid MongoDB ObjectId format',
  });

// ─── Single Item Schema ───────────────────────────────────────────────────────
const orderItemSchema = Joi.object({
  productId: objectId.optional().allow(null),
  name: Joi.string().trim().min(1).max(120).required().messages({
    'any.required': 'Item name is required',
    'string.empty': 'Item name cannot be empty',
  }),
  sku: Joi.string().trim().uppercase().max(50).optional().allow('', null),
  unit: Joi.string().valid(...UNIT_TYPES).optional().default('PIECE'),
  quantity: Joi.number().positive().min(0.01).required().messages({
    'any.required': 'Item quantity is required',
    'number.positive': 'Item quantity must be greater than zero',
  }),
  unitPrice: Joi.number().min(0).required().messages({
    'any.required': 'Item unit price is required',
    'number.min': 'Unit price cannot be negative',
  }),
  subtotal: Joi.number().min(0).required().messages({
    'any.required': 'Item subtotal is required',
    'number.min': 'Item subtotal cannot be negative',
  }),
});

// ─── Online Payment Metadata Schema ───────────────────────────────────────────
const onlineTransferMetaSchema = Joi.object({
  provider: Joi.string().trim().max(50).optional().allow('', null),
  transactionId: Joi.string().trim().max(100).optional().allow('', null),
  bankName: Joi.string().trim().max(100).optional().allow('', null),
  accountTitle: Joi.string().trim().max(100).optional().allow('', null),
  notes: Joi.string().trim().max(255).optional().allow('', null),
}).optional().allow(null);

// ─── Split Payment Metadata Schema ────────────────────────────────────────────
const splitPaymentMetaSchema = Joi.object({
  cashAmount: Joi.number().min(0).default(0),
  onlineAmount: Joi.number().min(0).default(0),
  khataAmount: Joi.number().min(0).default(0),
  onlineReference: Joi.string().trim().max(100).optional().allow('', null),
}).optional().allow(null);

// ─── CREATE Order Schema ──────────────────────────────────────────────────────
export const createOrderSchema = Joi.object({
  receiptNumber: Joi.string().trim().uppercase().max(50).optional(),
  date: Joi.date().iso().optional(),
  cashierId: objectId.optional(),
  customerId: objectId.optional().allow(null),
  customerNameSnapshot: Joi.string().trim().max(100).optional().allow('', null),
  customerPhoneSnapshot: Joi.string().trim().max(30).optional().allow('', null),
  fulfillmentType: Joi.string()
    .valid(...FULFILLMENT_TYPES)
    .default('COUNTER')
    .messages({
      'any.only': `Fulfillment type must be one of: ${FULFILLMENT_TYPES.join(', ')}`,
    }),
  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .required()
    .messages({
      'any.required': 'Payment method is required',
      'any.only': `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
    }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'any.required': 'Order must have at least one item',
    'array.min': 'Order must have at least one item',
  }),
  subtotal: Joi.number().min(0).required().messages({
    'any.required': 'Subtotal is required',
    'number.min': 'Subtotal cannot be negative',
  }),
  discountAmount: Joi.number().min(0).default(0).messages({
    'number.min': 'Discount amount cannot be negative',
  }),
  deliveryFee: Joi.number().min(0).default(0).messages({
    'number.min': 'Delivery fee cannot be negative',
  }),
  grandTotal: Joi.number().min(0).required().messages({
    'any.required': 'Grand total is required',
    'number.min': 'Grand total cannot be negative',
  }),
  amountReceived: Joi.number().min(0).default(0).messages({
    'number.min': 'Amount received cannot be negative',
  }),
  changeGiven: Joi.number().min(0).default(0).messages({
    'number.min': 'Change given cannot be negative',
  }),
  onlineTransferMeta: onlineTransferMetaSchema,
  splitPaymentMeta: splitPaymentMetaSchema,
  deliveryMeta: Joi.object({
    riderId: objectId.optional().allow(null),
    riderNameSnapshot: Joi.string().trim().max(100).optional().allow('', null),
    dropAddress: Joi.string().trim().max(300).optional().allow('', null),
    deliverySubType: Joi.string().trim().max(50).optional().allow('', null),
  }).optional().allow(null),
  notes: Joi.string().trim().max(500).optional().allow('', null),
}).options({ stripUnknown: true });

// ─── QUERY Orders Schema ──────────────────────────────────────────────────────
export const getOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(100).optional(),
  fulfillmentType: Joi.string().valid(...FULFILLMENT_TYPES).optional(),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS).optional(),
  cashierId: objectId.optional(),
  customerId: objectId.optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('date', 'grandTotal', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
}).options({ stripUnknown: true });

// ─── URL Param: Order ID Schema ───────────────────────────────────────────────
export const orderIdParamSchema = Joi.object({
  id: objectId.required().messages({
    'any.required': 'Order ID is required',
  }),
}).options({ stripUnknown: true });

// ─── URL Param: Receipt Number Schema ─────────────────────────────────────────
export const receiptNumberParamSchema = Joi.object({
  receiptNumber: Joi.string().trim().uppercase().required().messages({
    'any.required': 'Receipt number is required',
    'string.empty': 'Receipt number cannot be empty',
  }),
}).options({ stripUnknown: true });

// ─── QUERY Daily Sales Stats Schema ───────────────────────────────────────────
export const dailySalesStatsQuerySchema = Joi.object({
  date: Joi.date().iso().optional(),
}).options({ stripUnknown: true });

// ─── CANCEL Order Body Schema ─────────────────────────────────────────────────
export const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(300).required().messages({
    'any.required': 'Reason for cancellation is required',
    'string.min': 'Reason must be at least 3 characters long',
    'string.empty': 'Reason cannot be empty',
  }),
}).options({ stripUnknown: true });
