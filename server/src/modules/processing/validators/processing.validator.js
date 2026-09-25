import Joi from 'joi';

const createBatchSchema = Joi.object({
  id: Joi.string().trim().allow('', null),
  _id: Joi.string().trim().allow('', null),
  batchNumber: Joi.string().trim().uppercase().max(30).allow('', null),
  product: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters long',
    }),
  milkUsedLiters: Joi.number().min(0).allow(null),
  milkUsedQuantity: Joi.number().min(0).allow(null),
  milkUsed: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow('', null),
  outputQuantity: Joi.number().min(0).allow(null),
  outputUnit: Joi.string().trim().valid('kg', 'liters', 'bottles', 'tubs', 'packs', 'grams').default('kg'),
  output: Joi.string().trim().allow('', null),
  fatPercentage: Joi.number().min(0).max(20).allow(null),
  fat: Joi.alternatives().try(Joi.number().min(0).max(20), Joi.string().trim()).allow('', null),
  date: Joi.alternatives().try(Joi.date().iso(), Joi.string().trim()).allow(null, ''),
  status: Joi.string()
    .trim()
    .valid('Completed', 'In Progress', 'Failed', 'COMPLETED', 'IN_PROGRESS', 'FAILED', 'READY_FOR_POS')
    .default('Completed'),
  stage: Joi.string()
    .trim()
    .valid('incubating', 'chilled', 'pos', 'sold_out', 'INCUBATING', 'CHILLED', 'POS', 'SOLD_OUT')
    .default('pos'),
  source: Joi.string().trim().allow('', null).default('Farm & Supplier Mix'),
  farmMilkUsed: Joi.number().min(0).allow(null).default(0),
  supplierMilkUsed: Joi.number().min(0).allow(null).default(0),
  posRate: Joi.string().trim().allow('', null).default('Rs. 320 / kg'),
  costEstimate: Joi.number().min(0).default(0),
  notes: Joi.string().trim().allow('', null).default(''),
});

const updateBatchSchema = Joi.object({
  id: Joi.string().trim().allow('', null),
  _id: Joi.string().trim().allow('', null),
  batchNumber: Joi.string().trim().uppercase().max(30).allow('', null),
  product: Joi.string().trim().min(2).max(100),
  milkUsedLiters: Joi.number().min(0),
  milkUsedQuantity: Joi.number().min(0),
  milkUsed: Joi.alternatives().try(Joi.number().min(0), Joi.string().trim()).allow('', null),
  outputQuantity: Joi.number().min(0),
  outputUnit: Joi.string().trim().valid('kg', 'liters', 'bottles', 'tubs', 'packs', 'grams'),
  output: Joi.string().trim().allow('', null),
  fatPercentage: Joi.number().min(0).max(20).allow(null),
  fat: Joi.alternatives().try(Joi.number().min(0).max(20), Joi.string().trim()).allow('', null),
  date: Joi.alternatives().try(Joi.date().iso(), Joi.string().trim()).allow(null, ''),
  status: Joi.string()
    .trim()
    .valid('Completed', 'In Progress', 'Failed', 'COMPLETED', 'IN_PROGRESS', 'FAILED', 'READY_FOR_POS'),
  stage: Joi.string()
    .trim()
    .valid('incubating', 'chilled', 'pos', 'sold_out', 'INCUBATING', 'CHILLED', 'POS', 'SOLD_OUT'),
  source: Joi.string().trim().allow('', null),
  farmMilkUsed: Joi.number().min(0).allow(null),
  supplierMilkUsed: Joi.number().min(0).allow(null),
  posRate: Joi.string().trim().allow('', null),
  costEstimate: Joi.number().min(0),
  notes: Joi.string().trim().allow('', null),
}).min(1);

const batchQuerySchema = Joi.object({
  search: Joi.string().trim().allow(''),
  product: Joi.string().trim().allow(''),
  status: Joi.string().trim().allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
  sortBy: Joi.string().trim().default('date'),
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

export const validateCreateBatch = (req, res, next) => {
  const validated = runValidation(createBatchSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateUpdateBatch = (req, res, next) => {
  const validated = runValidation(updateBatchSchema, req.body, next);
  if (validated !== undefined) {
    req.body = validated;
    next();
  }
};

export const validateBatchQuery = (req, res, next) => {
  const validated = runValidation(batchQuerySchema, req.query, next);
  if (validated !== undefined) {
    Object.assign(req.query, validated);
    next();
  }
};
