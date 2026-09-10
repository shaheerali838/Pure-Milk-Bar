import Joi from 'joi';

// Helper for MongoDB ObjectId validation
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ----------------------------------------------------
// 1. Delivery Run Schemas
// ----------------------------------------------------

export const createDeliveryRunSchema = Joi.object({
  runCode: Joi.string().trim().uppercase().max(50).allow('', null),
  date: Joi.date().iso().default(Date.now),
  shift: Joi.string()
    .valid('MORNING', 'EVENING')
    .required()
    .messages({
      'any.required': 'Shift is required (MORNING or EVENING)',
      'any.only': 'Shift must be MORNING or EVENING',
    }),
  route: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Route name is required',
    }),
  riderId: Joi.string()
    .pattern(objectIdPattern)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Invalid Rider User ID format',
    }),
  riderNameSnapshot: Joi.string().trim().max(100).allow('', null),
  staffType: Joi.string()
    .valid('MOTORCYCLE_RIDER', 'WALKING_BOY', 'VAN_DRIVER')
    .default('MOTORCYCLE_RIDER'),
  customerId: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'any.required': 'Customer ID is required',
      'string.pattern.base': 'Invalid Customer ID format',
    }),
  customerName: Joi.string()
    .trim()
    .max(150)
    .required()
    .messages({
      'string.empty': 'Customer name is required',
    }),
  deliveryAddress: Joi.string()
    .trim()
    .max(300)
    .required()
    .messages({
      'string.empty': 'Delivery address is required',
    }),
  itemDescription: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.empty': 'Item description is required',
    }),
  qtyLiters: Joi.number()
    .positive()
    .min(0.1)
    .required()
    .messages({
      'any.required': 'Quantity in Liters is required',
      'number.min': 'Quantity must be at least 0.1 Liters',
    }),
  paymentMode: Joi.string()
    .valid('CASH', 'KHATA', 'ONLINE', 'PREPAID')
    .required()
    .messages({
      'any.required': 'Payment mode is required',
      'any.only': 'Payment mode must be CASH, KHATA, ONLINE, or PREPAID',
    }),
  codAmountToCollect: Joi.number().min(0).default(0),
  status: Joi.string()
    .valid('PENDING', 'DELIVERED', 'FAILED', 'SKIPPED')
    .default('PENDING'),
  deliveredAt: Joi.date().iso().allow(null),
  bottlesReturned: Joi.number().min(0).default(0),

  // Optional inline fuel log booking per ADR-002
  fuelLog: Joi.object({
    vehiclePlate: Joi.string().trim().uppercase().max(20).required(),
    expenseType: Joi.string()
      .valid('FUEL', 'MAINTENANCE', 'TOLL', 'OTHER')
      .default('FUEL'),
    liters: Joi.number().min(0).allow(null),
    costRupees: Joi.number().min(0).required(),
    odometerKm: Joi.number().min(0).allow(null),
    receiptNumber: Joi.string().trim().max(50).allow('', null),
  }).optional(),
});

export const updateDeliveryRunSchema = Joi.object({
  runCode: Joi.string().trim().uppercase().max(50),
  date: Joi.date().iso(),
  shift: Joi.string().valid('MORNING', 'EVENING'),
  route: Joi.string().trim().max(100),
  riderId: Joi.string().pattern(objectIdPattern).allow(null),
  riderNameSnapshot: Joi.string().trim().max(100).allow('', null),
  staffType: Joi.string().valid('MOTORCYCLE_RIDER', 'WALKING_BOY', 'VAN_DRIVER'),
  customerId: Joi.string().pattern(objectIdPattern),
  customerName: Joi.string().trim().max(150),
  deliveryAddress: Joi.string().trim().max(300),
  itemDescription: Joi.string().trim().max(200),
  qtyLiters: Joi.number().positive().min(0.1),
  paymentMode: Joi.string().valid('CASH', 'KHATA', 'ONLINE', 'PREPAID'),
  codAmountToCollect: Joi.number().min(0),
  status: Joi.string().valid('PENDING', 'DELIVERED', 'FAILED', 'SKIPPED'),
  deliveredAt: Joi.date().iso().allow(null),
  bottlesReturned: Joi.number().min(0),
}).min(1);

export const assignRiderSchema = Joi.object({
  riderId: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'any.required': 'Rider User ID is required',
      'string.pattern.base': 'Invalid Rider User ID format',
    }),
  riderNameSnapshot: Joi.string().trim().max(100).allow('', null),
});

export const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'DELIVERED', 'FAILED', 'SKIPPED')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be PENDING, DELIVERED, FAILED, or SKIPPED',
    }),
  deliveredAt: Joi.date().iso().allow(null),
  bottlesReturned: Joi.number().min(0).default(0),
  codAmountToCollect: Joi.number().min(0),
});

// ----------------------------------------------------
// 2. Vehicle Fuel Log Schemas
// ----------------------------------------------------

export const createVehicleFuelLogSchema = Joi.object({
  riderId: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'any.required': 'Rider User ID is required',
      'string.pattern.base': 'Invalid Rider User ID format',
    }),
  date: Joi.date().iso().default(Date.now),
  shift: Joi.string()
    .valid('MORNING', 'EVENING')
    .required()
    .messages({
      'any.required': 'Shift is required (MORNING or EVENING)',
      'any.only': 'Shift must be MORNING or EVENING',
    }),
  vehiclePlate: Joi.string()
    .trim()
    .uppercase()
    .max(20)
    .required()
    .messages({
      'string.empty': 'Vehicle plate number is required',
    }),
  expenseType: Joi.string()
    .valid('FUEL', 'MAINTENANCE', 'TOLL', 'OTHER')
    .default('FUEL'),
  liters: Joi.number().min(0).allow(null),
  costRupees: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Cost in Rupees is required',
      'number.min': 'Cost cannot be negative',
    }),
  odometerKm: Joi.number().min(0).allow(null),
  receiptNumber: Joi.string().trim().max(50).allow('', null),
  linkedDeliveryRunId: Joi.string().pattern(objectIdPattern).allow(null),
});

export const updateVehicleFuelLogSchema = Joi.object({
  riderId: Joi.string().pattern(objectIdPattern),
  date: Joi.date().iso(),
  shift: Joi.string().valid('MORNING', 'EVENING'),
  vehiclePlate: Joi.string().trim().uppercase().max(20),
  expenseType: Joi.string().valid('FUEL', 'MAINTENANCE', 'TOLL', 'OTHER'),
  liters: Joi.number().min(0).allow(null),
  costRupees: Joi.number().min(0),
  odometerKm: Joi.number().min(0).allow(null),
  receiptNumber: Joi.string().trim().max(50).allow('', null),
  linkedDeliveryRunId: Joi.string().pattern(objectIdPattern).allow(null),
}).min(1);

// ----------------------------------------------------
// Middleware Runner Helper
// ----------------------------------------------------

const runValidation = (schema, data, next) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    const validationError = new Error(messages);
    validationError.statusCode = 422;
    next(validationError);
    return null;
  }
  return value;
};

export const validateCreateDeliveryRun = (req, res, next) => {
  const validated = runValidation(createDeliveryRunSchema, req.body, next);
  if (validated !== null) {
    req.body = validated;
    next();
  }
};

export const validateUpdateDeliveryRun = (req, res, next) => {
  const validated = runValidation(updateDeliveryRunSchema, req.body, next);
  if (validated !== null) {
    req.body = validated;
    next();
  }
};

export const validateAssignRider = (req, res, next) => {
  const validated = runValidation(assignRiderSchema, req.body, next);
  if (validated !== null) {
    req.body = validated;
    next();
  }
};

export const validateUpdateDeliveryStatus = (req, res, next) => {
  const validated = runValidation(updateDeliveryStatusSchema, req.body, next);
  if (validated !== null) {
    req.body = validated;
    next();
  }
};

export const validateCreateVehicleFuelLog = (req, res, next) => {
  const validated = runValidation(createVehicleFuelLogSchema, req.body, next);
  if (validated !== null) {
    req.body = validated;
    next();
  }
};

export const validateUpdateVehicleFuelLog = (req, res, next) => {
  const validated = runValidation(updateVehicleFuelLogSchema, req.body, next);
  if (validated !== null) {
    req.body = validated;
    next();
  }
};
