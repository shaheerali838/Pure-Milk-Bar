import Joi from 'joi';

const createStaffSchema = Joi.object({
  staffCode: Joi.string().trim().uppercase().max(30).allow('', null),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Staff full name is required',
      'string.min': 'Name must be at least 2 characters long',
    }),
  role: Joi.string()
    .trim()
    .max(100)
    .default('Farm Work Man'),
  mobile: Joi.string().trim().allow('', null).default(''),
  phone: Joi.string().trim().allow('', null),
  email: Joi.string().trim().email().allow('', null).default(''),
  cnic: Joi.string().trim().allow('', null).default(''),
  shift: Joi.string()
    .trim()
    .valid('Morning', 'Evening', 'Both', 'Night', 'Full Day', 'Morning & Evening', 'Rotating')
    .default('Morning'),
  monthlySalary: Joi.number().min(0).default(0),
  dailySalary: Joi.number().min(0).allow(null),
  status: Joi.string()
    .trim()
    .valid('Active', 'On Leave', 'Inactive', 'Off Duty', 'Terminated')
    .default('Active'),
  route: Joi.string().trim().allow('', null).default('Not Assigned'),
  joinedDate: Joi.date().iso().allow(null, ''),
  notes: Joi.string().trim().allow('', null).default(''),
  userAccountId: Joi.string().hex().length(24).allow(null, ''),
});

const updateStaffSchema = Joi.object({
  staffCode: Joi.string().trim().uppercase().max(30).allow('', null),
  name: Joi.string().trim().min(2).max(100),
  role: Joi.string().trim().max(100),
  mobile: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().allow('', null),
  email: Joi.string().trim().email().allow('', null),
  cnic: Joi.string().trim().allow('', null),
  shift: Joi.string()
    .trim()
    .valid('Morning', 'Evening', 'Both', 'Night', 'Full Day', 'Morning & Evening', 'Rotating'),
  monthlySalary: Joi.number().min(0),
  dailySalary: Joi.number().min(0).allow(null),
  status: Joi.string()
    .trim()
    .valid('Active', 'On Leave', 'Inactive', 'Off Duty', 'Terminated'),
  route: Joi.string().trim().allow('', null),
  joinedDate: Joi.date().iso().allow(null, ''),
  notes: Joi.string().trim().allow('', null),
  userAccountId: Joi.string().hex().length(24).allow(null, ''),
}).min(1);

const setStatusSchema = Joi.object({
  status: Joi.string()
    .trim()
    .valid('Active', 'On Leave', 'Inactive', 'Off Duty', 'Terminated')
    .required()
    .messages({
      'any.required': 'Staff status is required',
      'any.only': 'Status must be one of Active, On Leave, Inactive, Off Duty, or Terminated',
    }),
});

const staffQuerySchema = Joi.object({
  search: Joi.string().trim().allow(''),
  role: Joi.string().trim().allow(''),
  shift: Joi.string().trim().allow(''),
  status: Joi.string().trim().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
  sortBy: Joi.string().trim().default('createdAt'),
  sortOrder: Joi.string().trim().valid('asc', 'desc').default('desc'),
});

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

export const validateCreateStaff = (req, res, next) => {
  const validated = runValidation(createStaffSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateUpdateStaff = (req, res, next) => {
  const validated = runValidation(updateStaffSchema, req.body, next);
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

export const validateStaffQuery = (req, res, next) => {
  const validated = runValidation(staffQuerySchema, req.query, next);
  if (validated !== undefined) {
    Object.assign(req.query, validated);
    next();
  }
};
