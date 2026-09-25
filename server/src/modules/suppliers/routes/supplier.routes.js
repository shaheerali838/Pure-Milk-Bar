import { Router } from 'express';
import validate from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

// Controllers
import supplierController from '../controllers/supplier.controller.js';
import procurementController from '../controllers/procurement.controller.js';

// Validators — Supplier
import {
  createSupplierSchema,
  updateSupplierSchema,
  getSuppliersQuerySchema,
  supplierIdParamSchema,
} from '../validators/supplier.validator.js';

// Validators — Procurement
import {
  createProcurementSchema,
  updateProcurementSchema,
  getProcurementsQuerySchema,
  procurementIdParamSchema,
} from '../validators/procurement.validator.js';

const router = Router();

// Base Authentication for all supplier & procurement endpoints
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
//  1. STATIC & SUB-RESOURCE ROUTES
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/stats',
  authorize('ADMIN', 'MANAGER'),
  supplierController.getSupplierStats
);

// ─── PROCUREMENT ROUTES — /api/v1/suppliers/procurements ──────────────────

router.get(
  '/procurements/daily-summary',
  authorize('ADMIN', 'MANAGER'),
  procurementController.getDailySummary
);

router.post(
  '/procurements',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createProcurementSchema }),
  procurementController.createProcurement
);

router.get(
  '/procurements',
  authorize('ADMIN', 'MANAGER'),
  validate({ query: getProcurementsQuerySchema }),
  procurementController.getAllProcurements
);

router.get(
  '/procurements/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: procurementIdParamSchema }),
  procurementController.getProcurementById
);

router.patch(
  '/procurements/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: procurementIdParamSchema, body: updateProcurementSchema }),
  procurementController.updateProcurement
);

router.delete(
  '/procurements/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: procurementIdParamSchema }),
  procurementController.deleteProcurement
);

// ═══════════════════════════════════════════════════════════════════════════
//  2. SUPPLIER BASE & WILDCARD ROUTES — /api/v1/suppliers
// ═══════════════════════════════════════════════════════════════════════════

router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createSupplierSchema }),
  supplierController.createSupplier
);

router.get(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ query: getSuppliersQuerySchema }),
  supplierController.getAllSuppliers
);

router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: supplierIdParamSchema }),
  supplierController.getSupplierById
);

router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: supplierIdParamSchema, body: updateSupplierSchema }),
  supplierController.updateSupplier
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  validate({ params: supplierIdParamSchema }),
  supplierController.deleteSupplier
);

export default router;
