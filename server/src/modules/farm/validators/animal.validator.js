import Joi from 'joi';

// ─── CREATE Animal Schema ───────────────────────────────────────────────────
export const createAnimalSchema = Joi.object({
  tagNumber: Joi.string()
    .trim()
    .uppercase()
    .max(50)
    .allow('', null)
    .optional(),

  tag: Joi.string().trim().allow('', null),

  name: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .default(null),

  type: Joi.string()
    .trim()
    .uppercase()
    .default('COW'),

  species: Joi.string()
    .trim()
    .allow('', null),

  breed: Joi.string()
    .trim()
    .max(100)
    .allow('', null)
    .default('Sahiwal'),

  dob: Joi.date()
    .iso()
    .allow(null)
    .default(null),

  lactationStage: Joi.string()
    .trim()
    .allow('', null)
    .default('EARLY'),

  lactationStatus: Joi.string()
    .trim()
    .allow('', null)
    .default('Milking'),

  lactationCycle: Joi.number()
    .integer()
    .min(1)
    .default(1),

  dailyAvgYield: Joi.number()
    .min(0)
    .default(0),

  morningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  eveningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  expectedDailyYield: Joi.number()
    .min(0)
    .allow(null, ''),

  expectedYield: Joi.number()
    .min(0)
    .allow(null, ''),

  purchasePrice: Joi.number()
    .min(0)
    .allow(null, ''),

  acquisitionDate: Joi.string()
    .allow(null, ''),

  healthStatus: Joi.string()
    .trim()
    .allow('', null)
    .default('HEALTHY'),

  notes: Joi.string()
    .trim()
    .max(1000)
    .allow(null, '')
    .default(null),

  isActive: Joi.boolean().default(true),
}).options({ stripUnknown: true });

// ─── UPDATE Animal Schema ───────────────────────────────────────────────────
export const updateAnimalSchema = Joi.object({
  tagNumber: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .uppercase(),

  tag: Joi.string().trim().allow('', null),

  name: Joi.string()
    .trim()
    .max(100)
    .allow(null, ''),

  type: Joi.string()
    .trim()
    .uppercase(),

  species: Joi.string()
    .trim()
    .allow('', null),

  breed: Joi.string()
    .trim()
    .max(100)
    .allow('', null),

  dob: Joi.date()
    .iso()
    .allow(null),

  lactationStage: Joi.string()
    .trim()
    .allow('', null),

  lactationStatus: Joi.string()
    .trim()
    .allow('', null),

  lactationCycle: Joi.number()
    .integer()
    .min(1),

  dailyAvgYield: Joi.number()
    .min(0),

  morningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  eveningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  expectedDailyYield: Joi.number()
    .min(0)
    .allow(null, ''),

  expectedYield: Joi.number()
    .min(0)
    .allow(null, ''),

  purchasePrice: Joi.number()
    .min(0)
    .allow(null, ''),

  acquisitionDate: Joi.string()
    .allow(null, ''),

  healthStatus: Joi.string()
    .trim()
    .allow('', null),

  notes: Joi.string()
    .trim()
    .max(1000)
    .allow(null, ''),

  isActive: Joi.boolean(),
}).options({ stripUnknown: true }).min(1);

// ─── QUERY Params Schema ────────────────────────────────────────────────────
export const getAnimalsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(100),
  type: Joi.string(),
  healthStatus: Joi.string(),
  lactationStage: Joi.string(),
  isActive: Joi.boolean(),
  search: Joi.string().trim().max(100).allow('', null),
}).options({ stripUnknown: true });

// ─── URL Params Schema ─────────────────────────────────────────────────────
export const animalIdParamSchema = Joi.object({
  id: Joi.string().required(),
}).options({ stripUnknown: true });
