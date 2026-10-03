import { Router } from 'express';
import validate from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

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

// Protect all Farm routes
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMAL ROUTES — /api/farm/animals
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/animals/stats',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  animalController.getAnimalStats
);

router.post(
  '/animals',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ body: createAnimalSchema }),
  animalController.createAnimal
);

router.get(
  '/animals',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ query: getAnimalsQuerySchema }),
  animalController.getAllAnimals
);

router.get(
  '/animals/:id',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ params: animalIdParamSchema }),
  animalController.getAnimalById
);

router.patch(
  '/animals/:id',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ params: animalIdParamSchema, body: updateAnimalSchema }),
  animalController.updateAnimal
);

router.post(
  '/animals/:id/intake',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  animalController.addIntakeRecord
);

router.delete(
  '/animals/:id',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ params: animalIdParamSchema }),
  animalController.deleteAnimal
);

// ═══════════════════════════════════════════════════════════════════════════
//  MILKING YIELD LOG ROUTES — /api/farm/milking-logs
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/milking-logs/daily-summary',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  milkingYieldLogController.getDailyYieldSummary
);

router.post(
  '/milking-logs',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ body: createMilkingYieldLogSchema }),
  milkingYieldLogController.createMilkingYieldLog
);

router.get(
  '/milking-logs',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ query: getMilkingYieldLogsQuerySchema }),
  milkingYieldLogController.getAllMilkingYieldLogs
);

router.get(
  '/milking-logs/:id',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ params: milkingYieldLogIdParamSchema }),
  milkingYieldLogController.getMilkingYieldLogById
);

router.patch(
  '/milking-logs/:id',
  authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR', 'CASHIER'),
  validate({ params: milkingYieldLogIdParamSchema, body: updateMilkingYieldLogSchema }),
  milkingYieldLogController.updateMilkingYieldLog
);

router.delete(
  '/milking-logs/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: milkingYieldLogIdParamSchema }),
  milkingYieldLogController.deleteMilkingYieldLog
);

export default router;
