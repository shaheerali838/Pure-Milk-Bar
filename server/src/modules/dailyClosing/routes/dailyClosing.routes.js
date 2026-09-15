import { Router } from 'express';
import {
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
  validateReconcileDailyClosing,
  validateApproveDailyClosing,
  validateReopenDailyClosing,
} from '../validators/dailyClosing.validator.js';

const router = Router();

// Protect all routes - Authentication Required
router.use(authenticate);

// 1. POST /api/v1/daily-closings (Create/Start)
// 2. GET /api/v1/daily-closings (History List)
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

// 4. GET /api/v1/daily-closings/date/:date (Particular Date Lookup)
router.get(
  '/date/:date',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getDailyClosingByDate
);

// 3. GET /api/v1/daily-closings/:id (Specific Closing Details)
router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getDailyClosingById
);

// 5. POST /api/v1/daily-closings/:id/reconcile (Cash + Stock Reconciliation)
router.post(
  '/:id/reconcile',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateReconcileDailyClosing,
  reconcileDailyClosing
);

// 6. POST /api/v1/daily-closings/:id/approve (Manager/Admin Approval)
router.post(
  '/:id/approve',
  authorize('ADMIN', 'MANAGER'),
  validateApproveDailyClosing,
  approveDailyClosing
);

// 7. POST /api/v1/daily-closings/:id/reopen (Admin Only Reopen)
router.post(
  '/:id/reopen',
  authorize('ADMIN'),
  validateReopenDailyClosing,
  reopenDailyClosing
);

// 8. GET /api/v1/daily-closings/:id/report (Complete Audit Report)
router.get(
  '/:id/report',
  authorize('ADMIN', 'MANAGER'),
  getDailyClosingReport
);

export default router;
