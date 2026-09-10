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

// Authentication is required for all delivery module routes
router.use(authenticate);

// Check whether the request is related to vehicle fuel logs
const isFuelLogRoute = (req) =>
    req.baseUrl.endsWith('/vehicle-fuel-logs') ||
    req.baseUrl.endsWith('/fuel-logs') ||
    req.path.startsWith('/vehicle-fuel-logs') ||
    req.path.startsWith('/fuel-logs');



// Vehicle Fuel Log Routes

// Create a new vehicle fuel log
router.post(
    '/vehicle-fuel-logs',
    authorize('ADMIN', 'MANAGER', 'RIDER'),
    validateCreateVehicleFuelLog,
    deliveryController.createVehicleFuelLog
);

// Create a fuel log using the short route
router.post(
    '/fuel-logs',
    authorize('ADMIN', 'MANAGER', 'RIDER'),
    validateCreateVehicleFuelLog,
    deliveryController.createVehicleFuelLog
);

// Get all vehicle fuel logs
router.get(
    '/vehicle-fuel-logs',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getVehicleFuelLogs
);

// Get all fuel logs using the short route
router.get(
    '/fuel-logs',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getVehicleFuelLogs
);

// Get a single vehicle fuel log
router.get(
    '/vehicle-fuel-logs/:id',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getVehicleFuelLogById
);

// Get a single fuel log using the short route
router.get(
    '/fuel-logs/:id',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getVehicleFuelLogById
);

// Update a vehicle fuel log
router.put(
    '/vehicle-fuel-logs/:id',
    authorize('ADMIN', 'MANAGER', 'RIDER'),
    validateUpdateVehicleFuelLog,
    deliveryController.updateVehicleFuelLog
);

// Update a fuel log using the short route
router.put(
    '/fuel-logs/:id',
    authorize('ADMIN', 'MANAGER', 'RIDER'),
    validateUpdateVehicleFuelLog,
    deliveryController.updateVehicleFuelLog
);

// Delete a vehicle fuel log
router.delete(
    '/vehicle-fuel-logs/:id',
    authorize('ADMIN', 'MANAGER'),
    deliveryController.deleteVehicleFuelLog
);

// Delete a fuel log using the short route
router.delete(
    '/fuel-logs/:id',
    authorize('ADMIN', 'MANAGER'),
    deliveryController.deleteVehicleFuelLog
);



// Delivery Run Routes

// Create a delivery run using the booking route
router.post(
    '/booking',
    authorize('ADMIN', 'MANAGER', 'CASHIER'),
    validateCreateDeliveryRun,
    deliveryController.createDeliveryRun
);

// Create a delivery run
router.post(
    '/delivery-runs',
    authorize('ADMIN', 'MANAGER', 'CASHIER'),
    validateCreateDeliveryRun,
    deliveryController.createDeliveryRun
);

// Get all delivery runs
router.get(
    '/delivery-runs',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getDeliveryRuns
);

// Get the rider's delivery run sheet
router.get(
    '/run-sheet',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getRiderRunSheet
);

// Get a single delivery run
router.get(
    '/delivery-runs/:id',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    deliveryController.getDeliveryRunById
);

// Update a delivery run
router.put(
    '/delivery-runs/:id',
    authorize('ADMIN', 'MANAGER'),
    validateUpdateDeliveryRun,
    deliveryController.updateDeliveryRun
);

// Delete a delivery run
router.delete(
    '/delivery-runs/:id',
    authorize('ADMIN', 'MANAGER'),
    deliveryController.deleteDeliveryRun
);

// Assign a rider to a delivery run
router.patch(
    '/delivery-runs/:id/assign',
    authorize('ADMIN', 'MANAGER'),
    validateAssignRider,
    deliveryController.assignRider
);

// Assign a rider using PUT
router.put(
    '/delivery-runs/:id/assign',
    authorize('ADMIN', 'MANAGER'),
    validateAssignRider,
    deliveryController.assignRider
);

// Update the delivery run status
router.patch(
    '/delivery-runs/:id/status',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    validateUpdateDeliveryStatus,
    deliveryController.updateDeliveryStatus
);

// Update the delivery run status using PUT
router.put(
    '/delivery-runs/:id/status',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    validateUpdateDeliveryStatus,
    deliveryController.updateDeliveryStatus
);



// Generic Delivery Routes
// Handles routes mounted at /deliveries, /delivery-runs,
// and /vehicle-fuel-logs

// Create a delivery run or fuel log based on the mounted route
router.post('/', (req, res, next) => {
    if (isFuelLogRoute(req)) {
        return authorize('ADMIN', 'MANAGER', 'RIDER')(req, res, () =>
            validateCreateVehicleFuelLog(
                req,
                res,
                () => deliveryController.createVehicleFuelLog(req, res, next)
            )
        );
    }

    return authorize('ADMIN', 'MANAGER', 'CASHIER')(req, res, () =>
        validateCreateDeliveryRun(
            req,
            res,
            () => deliveryController.createDeliveryRun(req, res, next)
        )
    );
});

// Get delivery runs or fuel logs
router.get('/', (req, res, next) => {
    return authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER')(req, res, () => {
        if (isFuelLogRoute(req)) {
            return deliveryController.getVehicleFuelLogs(req, res, next);
        }

        return deliveryController.getDeliveryRuns(req, res, next);
    });
});

// Get a delivery run or fuel log by ID
router.get('/:id', (req, res, next) => {
    return authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER')(req, res, () => {
        if (isFuelLogRoute(req)) {
            return deliveryController.getVehicleFuelLogById(req, res, next);
        }

        return deliveryController.getDeliveryRunById(req, res, next);
    });
});

// Update a delivery run or fuel log
router.put('/:id', (req, res, next) => {
    if (isFuelLogRoute(req)) {
        return authorize('ADMIN', 'MANAGER', 'RIDER')(req, res, () =>
            validateUpdateVehicleFuelLog(
                req,
                res,
                () => deliveryController.updateVehicleFuelLog(req, res, next)
            )
        );
    }

    return authorize('ADMIN', 'MANAGER')(req, res, () =>
        validateUpdateDeliveryRun(
            req,
            res,
            () => deliveryController.updateDeliveryRun(req, res, next)
        )
    );
});

// Delete a delivery run or fuel log
router.delete('/:id', (req, res, next) => {
    return authorize('ADMIN', 'MANAGER')(req, res, () => {
        if (isFuelLogRoute(req)) {
            return deliveryController.deleteVehicleFuelLog(req, res, next);
        }

        return deliveryController.deleteDeliveryRun(req, res, next);
    });
});

// Assign a rider to a delivery run
router.patch(
    '/:id/assign',
    authorize('ADMIN', 'MANAGER'),
    validateAssignRider,
    deliveryController.assignRider
);

// Assign a rider using PUT
router.put(
    '/:id/assign',
    authorize('ADMIN', 'MANAGER'),
    validateAssignRider,
    deliveryController.assignRider
);

// Update delivery run status
router.patch(
    '/:id/status',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    validateUpdateDeliveryStatus,
    deliveryController.updateDeliveryStatus
);

// Update delivery run status using PUT
router.put(
    '/:id/status',
    authorize('ADMIN', 'MANAGER', 'CASHIER', 'RIDER'),
    validateUpdateDeliveryStatus,
    deliveryController.updateDeliveryStatus
);

export default router;