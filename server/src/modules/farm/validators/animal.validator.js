import Joi from 'joi';

// ─── Shared Constants ───────────────────────────────────────────────────────
const ANIMAL_TYPES = ['COW', 'BUFFALO'];
const LACTATION_STAGES = ['EARLY', 'MID', 'LATE', 'DRY'];
const HEALTH_STATUSES = ['HEALTHY', 'UNDER_TREATMENT', 'QUARANTINE', 'SICK'];

// ─── Reusable ObjectId Validator ────────────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// ─── CREATE Animal Schema ───────────────────────────────────────────────────
export const createAnimalSchema = Joi.object({
  tagNumber: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .uppercase()
    .required()
    .messages({
      'any.required': 'Ear tag number is required',
      'string.empty': 'Tag number cannot be empty',
      'string.max': 'Tag number cannot exceed 20 characters',
    }),

  name: Joi.string()
    .trim()
    .max(50)
    .allow(null, '')
    .default(null)
    .messages({
      'string.max': 'Name cannot exceed 50 characters',
    }),

  type: Joi.string()
    .valid(...ANIMAL_TYPES)
    .required()
    .messages({
      'any.required': 'Animal type is required',
      'any.only': `Animal type must be one of: ${ANIMAL_TYPES.join(', ')}`,
    }),

  breed: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'any.required': 'Breed is required',
      'string.empty': 'Breed cannot be empty',
      'string.max': 'Breed cannot exceed 50 characters',
    }),

  dob: Joi.date()
    .iso()
    .allow(null)
    .default(null)
    .messages({
      'date.format': 'DOB must be a valid ISO 8601 date',
    }),

  lactationStage: Joi.string()
    .valid(...LACTATION_STAGES)
    .default('EARLY')
    .messages({
      'any.only': `Lactation stage must be one of: ${LACTATION_STAGES.join(', ')}`,
    }),

  lactationCycle: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Lactation cycle must be a whole number',
      'number.min': 'Lactation cycle must be at least 1',
    }),

  dailyAvgYield: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Daily average yield cannot be negative',
    }),

  healthStatus: Joi.string()
    .valid(...HEALTH_STATUSES)
    .default('HEALTHY')
    .messages({
      'any.only': `Health status must be one of: ${HEALTH_STATUSES.join(', ')}`,
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

// ─── UPDATE Animal Schema ───────────────────────────────────────────────────
export const updateAnimalSchema = Joi.object({
  tagNumber: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .uppercase()
    .messages({
      'string.empty': 'Tag number cannot be empty',
      'string.max': 'Tag number cannot exceed 20 characters',
    }),

  name: Joi.string()
    .trim()
    .max(50)
    .allow(null, ''),

  type: Joi.string()
    .valid(...ANIMAL_TYPES)
    .messages({
      'any.only': `Animal type must be one of: ${ANIMAL_TYPES.join(', ')}`,
    }),

  breed: Joi.string()
    .trim()
    .min(1)
    .max(50),

  dob: Joi.date()
    .iso()
    .allow(null),

  lactationStage: Joi.string()
    .valid(...LACTATION_STAGES),

  lactationCycle: Joi.number()
    .integer()
    .min(1),

  dailyAvgYield: Joi.number()
    .min(0),

  healthStatus: Joi.string()
    .valid(...HEALTH_STATUSES),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null, ''),

  isActive: Joi.boolean(),
}).options({ stripUnknown: true }).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// ─── QUERY Params Schema ────────────────────────────────────────────────────
export const getAnimalsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid(...ANIMAL_TYPES),
  healthStatus: Joi.string().valid(...HEALTH_STATUSES),
  lactationStage: Joi.string().valid(...LACTATION_STAGES),
  isActive: Joi.boolean(),
  search: Joi.string().trim().max(50),
}).options({ stripUnknown: true });

// ─── URL Params Schema ─────────────────────────────────────────────────────
export const animalIdParamSchema = Joi.object({
  id: objectId.required().messages({
    'string.pattern.name': 'Invalid MongoDB ObjectId format',
    'any.required': 'Animal ID is required',
  }),
}).options({ stripUnknown: true });
