import { Router } from 'express';
import validate from '../../../middlewares/validate.js';

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

// ═══════════════════════════════════════════════════════════════════════════
//  SUPPLIER ROUTES — /api/v1/suppliers
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/stats',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  supplierController.getSupplierStats
);

router.post(
  '/',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ body: createSupplierSchema }),
  supplierController.createSupplier
);

router.get(
  '/',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER']),
  validate({ query: getSuppliersQuerySchema }),
  supplierController.getAllSuppliers
);

router.get(
  '/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER']),
  validate({ params: supplierIdParamSchema }),
  supplierController.getSupplierById
);

router.patch(
  '/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: supplierIdParamSchema, body: updateSupplierSchema }),
  supplierController.updateSupplier
);

router.delete(
  '/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: supplierIdParamSchema }),
  supplierController.deleteSupplier
);

// ═══════════════════════════════════════════════════════════════════════════
//  PROCUREMENT ROUTES — /api/v1/suppliers/procurements
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/procurements/daily-summary',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'DOCK_INSPECTOR']),
  procurementController.getDailySummary
);

router.post(
  '/procurements',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'DOCK_INSPECTOR']),
  validate({ body: createProcurementSchema }),
  procurementController.createProcurement
);

router.get(
  '/procurements',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER', 'DOCK_INSPECTOR']),
  validate({ query: getProcurementsQuerySchema }),
  procurementController.getAllProcurements
);

router.get(
  '/procurements/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'DOCK_INSPECTOR']),
  validate({ params: procurementIdParamSchema }),
  procurementController.getProcurementById
);

router.patch(
  '/procurements/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: procurementIdParamSchema, body: updateProcurementSchema }),
  procurementController.updateProcurement
);

export default router;
