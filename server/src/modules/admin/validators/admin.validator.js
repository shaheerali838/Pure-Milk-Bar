import Joi from 'joi';

// Create User Schema
const createUserSchema = Joi.object({
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters long',
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?3\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid Pakistani phone number (e.g. 03001234567)',
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .allow('', null),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
    }),
  role: Joi.string()
    .valid('ADMIN', 'MANAGER', 'CASHIER', 'RIDER', 'FARM_SUPERVISOR')
    .required()
    .messages({
      'any.only': 'Invalid role specified',
    }),
  shift: Joi.string()
    .valid('MORNING', 'EVENING', 'ROTATING')
    .default('MORNING'),
  assignedRouteId: Joi.string().hex().length(24).allow(null),
});

// Update User Schema
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string()
    .trim()
    .pattern(/^(\+92|0)?3\d{9}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid Pakistani phone number (e.g. 03001234567)',
    }),
  email: Joi.string().trim().lowercase().email().allow('', null),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'CASHIER', 'RIDER', 'FARM_SUPERVISOR'),
  shift: Joi.string().valid('MORNING', 'EVENING', 'ROTATING'),
  assignedRouteId: Joi.string().hex().length(24).allow(null),
}).min(1);

// Set Active Status Schema
const setStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive status boolean is required',
  }),
});

// Set Role Schema
const setRoleSchema = Joi.object({
  role: Joi.string()
    .valid('ADMIN', 'MANAGER', 'CASHIER', 'RIDER', 'FARM_SUPERVISOR')
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Invalid role specified',
    }),
});

// Reset Password Schema
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
    }),
});

// Helper validation runner
const runValidation = (schema, data, next) => {
  const { error, value } = schema.validate(data || {}, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    const validationError = new Error(messages);
    validationError.statusCode = 422;
    next(validationError);
    return undefined;
  }
  return value;
};

export const validateCreateUser = (req, res, next) => {
  const validated = runValidation(createUserSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateUpdateUser = (req, res, next) => {
  const validated = runValidation(updateUserSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateSetStatus = (req, res, next) => {
  const validated = runValidation(setStatusSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateSetRole = (req, res, next) => {
  const validated = runValidation(setRoleSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateResetPassword = (req, res, next) => {
  const validated = runValidation(resetPasswordSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};
