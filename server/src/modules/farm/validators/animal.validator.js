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

  hasCalf: Joi.boolean().allow(null).default(false),
  calfTag: Joi.string().trim().allow(null, ''),
  calfGender: Joi.string().trim().allow(null, ''),
  calfDob: Joi.alternatives().try(Joi.date().iso(), Joi.string()).allow(null, ''),
  calfAge: Joi.string().trim().allow(null, ''),
  calfNotes: Joi.string().trim().max(1000).allow(null, ''),

  isSold: Joi.boolean().allow(null).default(false),
  saleDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()).allow(null, ''),
  salePrice: Joi.number().min(0).allow(null, ''),
  saleNotes: Joi.string().trim().allow(null, ''),

  image: Joi.string()
    .allow(null, '')
    .optional(),

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

  expectedMorningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  expectedEveningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  purchaseMorningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  purchaseEveningYield: Joi.number()
    .min(0)
    .allow(null, ''),

  purchaseExpectedYield: Joi.number()
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

  hasCalf: Joi.boolean().allow(null),
  calfTag: Joi.string().trim().allow(null, ''),
  calfGender: Joi.string().trim().allow(null, ''),
  calfDob: Joi.alternatives().try(Joi.date().iso(), Joi.string()).allow(null, ''),
  calfAge: Joi.string().trim().allow(null, ''),
  calfNotes: Joi.string().trim().max(1000).allow(null, ''),

  isSold: Joi.boolean().allow(null),
  saleDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()).allow(null, ''),
  salePrice: Joi.number().min(0).allow(null, ''),
  saleNotes: Joi.string().trim().allow(null, ''),

  image: Joi.string()
    .allow(null, '')
    .optional(),

  isActive: Joi.boolean(),

  intakeHistory: Joi.array().optional(),
}).options({ stripUnknown: true }).min(1);

// ─── CREATE Animal Sale Schema ──────────────────────────────────────────────
export const createAnimalSaleSchema = Joi.object({
  animalId: Joi.string().required(),
  salePrice: Joi.number().min(0).required(),
  buyerName: Joi.string().trim().required(),
  buyerPhone: Joi.string().trim().allow('', null).default(''),
  buyerAddress: Joi.string().trim().allow('', null).default(''),
  saleDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()).allow(null, '').default(() => new Date()),
  paymentMethod: Joi.string().allow('', null).default('Cash'),
  hasCalfIncluded: Joi.boolean().allow(null).default(false),
  notes: Joi.string().trim().allow('', null).default(''),
}).options({ stripUnknown: true });

// ─── QUERY Params Schema ────────────────────────────────────────────────────
export const getAnimalsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(10000).default(100),
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
