import { Router } from 'express';
import deliveryController from '../controllers/delivery.controller.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';
import {
  validateCreateDeliveryRun,
  validateUpdateDeliveryRun,
  validateAssignRider,
  validateUpdateDeliveryStatus,
  validateCreateVehicleFuelLog,
  validateUpdateVehicleFuelLog,
} from '../validators/delivery.validator.js';

const router = Router();

// Protect all delivery routes with JWT Authentication
router.use(authenticate);

// ====================================================
// 1. Vehicle Fuel Log Routes (Under /api/v1/deliveries/...)
// ====================================================
router.post(
  '/vehicle-fuel-logs',
  authorize('ADMIN', 'MANAGER', 'RIDER'),
  validateCreateVehicleFuelLog,
  deliveryController.createVehicleFuelLog
);
router.post(
  '/fuel-logs',
  authorize('ADMIN', 'MANAGER', 'RIDER'),
  validateCreateVehicleFuelLog,
  deliveryController.createVehicleFuelLog
);

router.get('/vehicle-fuel-logs', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getVehicleFuelLogs);
router.get('/fuel-logs', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getVehicleFuelLogs);

router.get('/vehicle-fuel-logs/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getVehicleFuelLogById);
router.get('/fuel-logs/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getVehicleFuelLogById);

router.put(
  '/vehicle-fuel-logs/:id',
  authorize('ADMIN', 'MANAGER', 'RIDER'),
  validateUpdateVehicleFuelLog,
  deliveryController.updateVehicleFuelLog
);
router.put(
  '/fuel-logs/:id',
  authorize('ADMIN', 'MANAGER', 'RIDER'),
  validateUpdateVehicleFuelLog,
  deliveryController.updateVehicleFuelLog
);

router.delete('/vehicle-fuel-logs/:id', authorize('ADMIN', 'MANAGER'), deliveryController.deleteVehicleFuelLog);
router.delete('/fuel-logs/:id', authorize('ADMIN', 'MANAGER'), deliveryController.deleteVehicleFuelLog);

// ====================================================
// 2. Delivery Runs & Dispatch Routes (Under /api/v1/deliveries/...)
// ====================================================
router.post(
  '/booking',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateCreateDeliveryRun,
  deliveryController.createDeliveryRun
);
router.post(
  '/delivery-runs',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateCreateDeliveryRun,
  deliveryController.createDeliveryRun
);
router.get('/delivery-runs', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getDeliveryRuns);

router.get('/run-sheet', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getRiderRunSheet);

router.get('/delivery-runs/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getDeliveryRunById);
router.put(
  '/delivery-runs/:id',
  authorize('ADMIN', 'MANAGER'),
  validateUpdateDeliveryRun,
  deliveryController.updateDeliveryRun
);
router.delete('/delivery-runs/:id', authorize('ADMIN', 'MANAGER'), deliveryController.deleteDeliveryRun);

router.patch(
  '/delivery-runs/:id/assign',
  authorize('ADMIN', 'MANAGER'),
  validateAssignRider,
  deliveryController.assignRider
);
router.put(
  '/delivery-runs/:id/assign',
  authorize('ADMIN', 'MANAGER'),
  validateAssignRider,
  deliveryController.assignRider
);

router.patch(
  '/delivery-runs/:id/status',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
  validateUpdateDeliveryStatus,
  deliveryController.updateDeliveryStatus
);
router.put(
  '/delivery-runs/:id/status',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
  validateUpdateDeliveryStatus,
  deliveryController.updateDeliveryStatus
);

// ====================================================
// 3. Root Alias Routes for Delivery Runs (/api/v1/deliveries)
// ====================================================
router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateCreateDeliveryRun,
  deliveryController.createDeliveryRun
);

router.get('/', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getDeliveryRuns);

router.get('/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'), deliveryController.getDeliveryRunById);

router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validateUpdateDeliveryRun,
  deliveryController.updateDeliveryRun
);

router.delete('/:id', authorize('ADMIN', 'MANAGER'), deliveryController.deleteDeliveryRun);

router.patch(
  '/:id/assign',
  authorize('ADMIN', 'MANAGER'),
  validateAssignRider,
  deliveryController.assignRider
);
router.put(
  '/:id/assign',
  authorize('ADMIN', 'MANAGER'),
  validateAssignRider,
  deliveryController.assignRider
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
  validateUpdateDeliveryStatus,
  deliveryController.updateDeliveryStatus
);
router.put(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
  validateUpdateDeliveryStatus,
  deliveryController.updateDeliveryStatus
);

export default router;