/**
 * Layer 4: Farm Routes — Express Router with Middleware Binding
 *
 * Declares RESTful endpoints for the Farm module:
 *   - /api/farm/animals      → Animal CRUD + stats
 *   - /api/farm/milking-logs → MilkingYieldLog CRUD + daily summary
 *
 * Middleware binding order (per architecture spec):
 *   authenticate → authorize([...roles]) → validate(schema) → controllerMethod
 *
 * NOTE: authenticate & authorize middlewares are commented out for initial
 * Thunder Client testing. Uncomment when the auth module is wired up.
 */
import { Router } from 'express';
import validate from '../../../middlewares/validate.js';

// Controllers
import animalController from '../controllers/animal.controller.js';
import milkingYieldLogController from '../controllers/milkingYieldLog.controller.js';

// Validators — Animal
import {
  createAnimalSchema,
  updateAnimalSchema,
  getAnimalsQuerySchema,
  animalIdParamSchema,
} from '../validators/animal.validator.js';

// Validators — MilkingYieldLog
import {
  createMilkingYieldLogSchema,
  updateMilkingYieldLogSchema,
  getMilkingYieldLogsQuerySchema,
  milkingYieldLogIdParamSchema,
} from '../validators/milkingYieldLog.validator.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMAL ROUTES — /api/farm/animals
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/farm/animals/stats
 * Get aggregate statistics for the livestock directory.
 * NOTE: This route must be declared BEFORE /:id to avoid conflict.
 */
router.get(
  '/animals/stats',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  animalController.getAnimalStats
);

/**
 * POST /api/farm/animals
 * Register a new animal in the livestock directory.
 */
router.post(
  '/animals',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ body: createAnimalSchema }),
  animalController.createAnimal
);

/**
 * GET /api/farm/animals
 * List all animals with filtering, search, and pagination.
 */
router.get(
  '/animals',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER']),
  validate({ query: getAnimalsQuerySchema }),
  animalController.getAllAnimals
);

/**
 * GET /api/farm/animals/:id
 * Get a single animal by ID.
 */
router.get(
  '/animals/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: animalIdParamSchema }),
  animalController.getAnimalById
);

/**
 * PATCH /api/farm/animals/:id
 * Update an existing animal.
 */
router.patch(
  '/animals/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: animalIdParamSchema, body: updateAnimalSchema }),
  animalController.updateAnimal
);

/**
 * DELETE /api/farm/animals/:id
 * Soft-delete an animal (set isActive = false).
 */
router.delete(
  '/animals/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: animalIdParamSchema }),
  animalController.deleteAnimal
);

// ═══════════════════════════════════════════════════════════════════════════
//  MILKING YIELD LOG ROUTES — /api/farm/milking-logs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/farm/milking-logs/daily-summary
 * Get daily yield summary for a specific date.
 * NOTE: This route must be declared BEFORE /:id to avoid conflict.
 */
router.get(
  '/milking-logs/daily-summary',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  milkingYieldLogController.getDailyYieldSummary
);

/**
 * POST /api/farm/milking-logs
 * Record a new milking yield log entry.
 */
router.post(
  '/milking-logs',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ body: createMilkingYieldLogSchema }),
  milkingYieldLogController.createMilkingYieldLog
);

/**
 * GET /api/farm/milking-logs
 * List all milking yield logs with filtering and pagination.
 */
router.get(
  '/milking-logs',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER']),
  validate({ query: getMilkingYieldLogsQuerySchema }),
  milkingYieldLogController.getAllMilkingYieldLogs
);

/**
 * GET /api/farm/milking-logs/:id
 * Get a single milking yield log by ID.
 */
router.get(
  '/milking-logs/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: milkingYieldLogIdParamSchema }),
  milkingYieldLogController.getMilkingYieldLogById
);

/**
 * PATCH /api/farm/milking-logs/:id
 * Update a milking yield log entry.
 */
router.patch(
  '/milking-logs/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: milkingYieldLogIdParamSchema, body: updateMilkingYieldLogSchema }),
  milkingYieldLogController.updateMilkingYieldLog
);

/**
 * DELETE /api/farm/milking-logs/:id
 * Delete a milking yield log entry.
 */
router.delete(
  '/milking-logs/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: milkingYieldLogIdParamSchema }),
  milkingYieldLogController.deleteMilkingYieldLog
);

export default router;
