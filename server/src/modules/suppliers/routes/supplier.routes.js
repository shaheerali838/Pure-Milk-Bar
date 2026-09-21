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
//  1. STATIC & SUB-RESOURCE ROUTES (Must precede /:id parameter)
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/stats',
  supplierController.getSupplierStats
);

// ─── PROCUREMENT ROUTES — /api/v1/suppliers/procurements ──────────────────

router.get(
  '/procurements/daily-summary',
  procurementController.getDailySummary
);

router.post(
  '/procurements',
  validate({ body: createProcurementSchema }),
  procurementController.createProcurement
);

router.get(
  '/procurements',
  validate({ query: getProcurementsQuerySchema }),
  procurementController.getAllProcurements
);

router.get(
  '/procurements/:id',
  validate({ params: procurementIdParamSchema }),
  procurementController.getProcurementById
);

router.patch(
  '/procurements/:id',
  validate({ params: procurementIdParamSchema, body: updateProcurementSchema }),
  procurementController.updateProcurement
);

// ═══════════════════════════════════════════════════════════════════════════
//  2. SUPPLIER BASE & WILDCARD ROUTES — /api/v1/suppliers
// ═══════════════════════════════════════════════════════════════════════════

router.post(
  '/',
  validate({ body: createSupplierSchema }),
  supplierController.createSupplier
);

router.get(
  '/',
  validate({ query: getSuppliersQuerySchema }),
  supplierController.getAllSuppliers
);

router.get(
  '/:id',
  validate({ params: supplierIdParamSchema }),
  supplierController.getSupplierById
);

router.patch(
  '/:id',
  validate({ params: supplierIdParamSchema, body: updateSupplierSchema }),
  supplierController.updateSupplier
);

router.delete(
  '/:id',
  validate({ params: supplierIdParamSchema }),
  supplierController.deleteSupplier
);

export default router;
