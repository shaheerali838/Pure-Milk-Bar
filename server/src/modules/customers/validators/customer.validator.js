import Joi from 'joi';

// Create Customer Schema
export const createCustomerSchema = Joi.object({
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
      'string.empty': 'Customer name is required',
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid phone number',
    }),
  address: Joi.string().trim().max(300).allow('', null),
  area: Joi.string().trim().max(100).allow('', null),
  deliveryRoute: Joi.string().trim().max(100).allow('', null),
  creditLimit: Joi.number().min(0).default(5000),
  openingBalance: Joi.number().allow(null).default(0),
  currentBalance: Joi.number().allow(null).default(0),
  khataBalance: Joi.number().allow(null).default(0),
  preferredPayment: Joi.string()
    .trim()
    .uppercase()
    .valid('KHATA', 'CASH', 'ONLINE', 'ONLINE PAYMENT', 'EASYPAISA', 'JAZZCASH')
    .default('KHATA'),
  status: Joi.string()
    .trim()
    .uppercase()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
    .default('ACTIVE'),
}).options({ stripUnknown: true });

// Update Customer Schema
export const updateCustomerSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(30),
  name: Joi.string().trim().min(1).max(100),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/),
  address: Joi.string().trim().max(300).allow('', null),
  area: Joi.string().trim().max(100).allow('', null),
  deliveryRoute: Joi.string().trim().max(100).allow('', null),
  creditLimit: Joi.number().min(0),
  currentBalance: Joi.number(),
  preferredPayment: Joi.string()
    .trim()
    .uppercase()
    .valid('KHATA', 'CASH', 'ONLINE', 'ONLINE PAYMENT', 'EASYPAISA', 'JAZZCASH'),
  status: Joi.string()
    .trim()
    .uppercase()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED'),
}).options({ stripUnknown: true }).min(1);

// Set Customer Status Schema
export const setStatusSchema = Joi.object({
  status: Joi.string()
    .trim()
    .uppercase()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
    .required()
    .messages({
      'any.required': 'Customer status is required',
    }),
}).options({ stripUnknown: true });

// Update Credit Limit Schema
export const updateCreditLimitSchema = Joi.object({
  creditLimit: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Credit limit is required',
    }),
}).options({ stripUnknown: true });

// Record Khata Payment Schema
export const recordKhataPaymentSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Payment amount is required',
    }),
  paymentMethod: Joi.string()
    .trim()
    .uppercase()
    .valid('CASH', 'ONLINE', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA')
    .default('CASH'),
  referenceNo: Joi.string().trim().max(50).allow('', null),
  notes: Joi.string().trim().max(250).allow('', null),
}).options({ stripUnknown: true });

// Generic validation runner
const runValidation = (schema, req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      success: false,
      message: error.details[0]?.message || 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};

export const validateCreateCustomer = (req, res, next) => runValidation(createCustomerSchema, req, res, next);
export const validateUpdateCustomer = (req, res, next) => runValidation(updateCustomerSchema, req, res, next);
export const validateSetStatus = (req, res, next) => runValidation(setStatusSchema, req, res, next);
export const validateUpdateCreditLimit = (req, res, next) => runValidation(updateCreditLimitSchema, req, res, next);
export const validateRecordKhataPayment = (req, res, next) => runValidation(recordKhataPaymentSchema, req, res, next);

export default {
  createCustomerSchema,
  updateCustomerSchema,
  setStatusSchema,
  updateCreditLimitSchema,
  recordKhataPaymentSchema,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateSetStatus,
  validateUpdateCreditLimit,
  validateRecordKhataPayment,
};
