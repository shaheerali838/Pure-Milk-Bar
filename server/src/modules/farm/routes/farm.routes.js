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

router.get(
  '/animals/stats',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  animalController.getAnimalStats
);

router.post(
  '/animals',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ body: createAnimalSchema }),
  animalController.createAnimal
);

router.get(
  '/animals',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER']),
  validate({ query: getAnimalsQuerySchema }),
  animalController.getAllAnimals
);

router.get(
  '/animals/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: animalIdParamSchema }),
  animalController.getAnimalById
);

router.patch(
  '/animals/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: animalIdParamSchema, body: updateAnimalSchema }),
  animalController.updateAnimal
);

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

router.get(
  '/milking-logs/daily-summary',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  milkingYieldLogController.getDailyYieldSummary
);

router.post(
  '/milking-logs',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ body: createMilkingYieldLogSchema }),
  milkingYieldLogController.createMilkingYieldLog
);

router.get(
  '/milking-logs',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER']),
  validate({ query: getMilkingYieldLogsQuerySchema }),
  milkingYieldLogController.getAllMilkingYieldLogs
);

router.get(
  '/milking-logs/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: milkingYieldLogIdParamSchema }),
  milkingYieldLogController.getMilkingYieldLogById
);

router.patch(
  '/milking-logs/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'FARM_SUPERVISOR']),
  validate({ params: milkingYieldLogIdParamSchema, body: updateMilkingYieldLogSchema }),
  milkingYieldLogController.updateMilkingYieldLog
);

router.delete(
  '/milking-logs/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: milkingYieldLogIdParamSchema }),
  milkingYieldLogController.deleteMilkingYieldLog
);

export default router;
