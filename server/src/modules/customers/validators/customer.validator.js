import Joi from 'joi';

// Create Customer Schema
const createCustomerSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .max(20)
    .allow('', null),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Customer name is required',
      'string.min': 'Customer name must be at least 2 characters long',
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?3\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid Pakistani phone number (e.g. 03001234567)',
    }),
  address: Joi.string().trim().max(300).allow('', null),
  deliveryRoute: Joi.string().trim().max(100).allow('', null),
  creditLimit: Joi.number().min(0).default(5000),
  preferredPayment: Joi.string()
    .valid('KHATA', 'CASH', 'ONLINE')
    .default('KHATA'),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
    .default('ACTIVE'),
});

// Update Customer Schema
const updateCustomerSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(20),
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?3\d{9}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid Pakistani phone number (e.g. 03001234567)',
    }),
  address: Joi.string().trim().max(300).allow('', null),
  deliveryRoute: Joi.string().trim().max(100).allow('', null),
  creditLimit: Joi.number().min(0),
  preferredPayment: Joi.string().valid('KHATA', 'CASH', 'ONLINE'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED'),
}).min(1);

// Set Customer Status Schema
const setStatusSchema = Joi.object({
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
    .required()
    .messages({
      'any.required': 'Customer status is required',
      'any.only': 'Status must be one of ACTIVE, INACTIVE, or SUSPENDED',
    }),
});

// Update Credit Limit Schema
const updateCreditLimitSchema = Joi.object({
  creditLimit: Joi.number()
    .min(0)
    .required()
    .messages({
      'any.required': 'Credit limit is required',
      'number.min': 'Credit limit cannot be negative',
    }),
});

// Helper validation runner
const runValidation = (schema, data, next) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    const validationError = new Error(messages);
    validationError.statusCode = 422;
    return next(validationError);
  }
  return value;
};

export const validateCreateCustomer = (req, res, next) => {
  req.body = runValidation(createCustomerSchema, req.body, next) || req.body;
  next();
};

export const validateUpdateCustomer = (req, res, next) => {
  req.body = runValidation(updateCustomerSchema, req.body, next) || req.body;
  next();
};

export const validateSetStatus = (req, res, next) => {
  req.body = runValidation(setStatusSchema, req.body, next) || req.body;
  next();
};

export const validateUpdateCreditLimit = (req, res, next) => {
  req.body = runValidation(updateCreditLimitSchema, req.body, next) || req.body;
  next();
};
