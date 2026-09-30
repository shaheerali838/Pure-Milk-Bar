import { Router } from 'express';
import {
  getDailyClosingSummary,
  confirmDailyClosing,
  getDailyClosingHistory,
  recordWastage,
  getWastageLogs,
  createDailyClosing,
  getDailyClosings,
  getDailyClosingById,
  getDailyClosingByDate,
  reconcileDailyClosing,
  approveDailyClosing,
  reopenDailyClosing,
  getDailyClosingReport,
} from '../controllers/dailyClosing.controller.js';

import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

import {
  validateCreateDailyClosing,
  validateConfirmDailyClosing,
  validateReconcileDailyClosing,
  validateApproveDailyClosing,
  validateReopenDailyClosing,
  validateRecordWastage,
} from '../validators/dailyClosing.validator.js';

const router = Router();

// Protect all routes - Authentication Required
router.use(authenticate);

// 1. GET /api/v1/daily-closings/summary (Single unified endpoint for today & period views)
router.get(
  '/summary',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getDailyClosingSummary
);

// 2. POST /api/v1/daily-closings/confirm (One-click save & snapshot confirmation)
router.post(
  '/confirm',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateConfirmDailyClosing,
  confirmDailyClosing
);

// 3. GET /api/v1/daily-closings/history (Light history list for previous closings)
router.get(
  '/history',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getDailyClosingHistory
);

// 4. Wastage Routes
router
  .route('/wastage')
  .post(
    authorize('ADMIN', 'MANAGER', 'CASHIER'),
    validateRecordWastage,
    recordWastage
  )
  .get(
    authorize('ADMIN', 'MANAGER', 'CASHIER'),
    getWastageLogs
  );

// 5. Existing Routes (Preserved for compatibility)
router
  .route('/')
  .post(
    authorize('ADMIN', 'MANAGER', 'CASHIER'),
    validateCreateDailyClosing,
    createDailyClosing
  )
  .get(
    authorize('ADMIN', 'MANAGER'),
    getDailyClosings
  );

router.get(
  '/date/:date',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getDailyClosingByDate
);

router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getDailyClosingById
);

router.post(
  '/:id/reconcile',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateReconcileDailyClosing,
  reconcileDailyClosing
);

router.post(
  '/:id/approve',
  authorize('ADMIN', 'MANAGER'),
  validateApproveDailyClosing,
  approveDailyClosing
);

router.post(
  '/:id/reopen',
  authorize('ADMIN'),
  validateReopenDailyClosing,
  reopenDailyClosing
);

router.get(
  '/:id/report',
  authorize('ADMIN', 'MANAGER'),
  getDailyClosingReport
);

export default router;
