/**
 * Layer 4: Supplier Routes — Express Router with Middleware Binding
 *
 * Declares RESTful endpoints for the Suppliers module:
 *   - /api/v1/suppliers             → Supplier CRUD + stats
 *   - /api/v1/suppliers/procurements → MilkProcurement CRUD + daily summary
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

/**
 * GET /api/v1/suppliers/stats
 * Get aggregate statistics for all suppliers.
 * NOTE: Must be declared BEFORE /:id to avoid route conflict.
 */
router.get(
  '/stats',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  supplierController.getSupplierStats
);

/**
 * POST /api/v1/suppliers
 * Register a new milk supplier.
 */
router.post(
  '/',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ body: createSupplierSchema }),
  supplierController.createSupplier
);

/**
 * GET /api/v1/suppliers
 * List all suppliers with filtering, search, and pagination.
 */
router.get(
  '/',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER']),
  validate({ query: getSuppliersQuerySchema }),
  supplierController.getAllSuppliers
);

/**
 * GET /api/v1/suppliers/:id
 * Get a single supplier by ID.
 */
router.get(
  '/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER']),
  validate({ params: supplierIdParamSchema }),
  supplierController.getSupplierById
);

/**
 * PATCH /api/v1/suppliers/:id
 * Update an existing supplier's details.
 */
router.patch(
  '/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: supplierIdParamSchema, body: updateSupplierSchema }),
  supplierController.updateSupplier
);

/**
 * DELETE /api/v1/suppliers/:id
 * Soft-delete a supplier (set isActive = false).
 */
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

/**
 * GET /api/v1/suppliers/procurements/daily-summary
 * Get daily procurement totals for a given date (?date=YYYY-MM-DD).
 * NOTE: Must be declared BEFORE /procurements/:id to avoid route conflict.
 */
router.get(
  '/procurements/daily-summary',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'DOCK_INSPECTOR']),
  procurementController.getDailySummary
);

/**
 * POST /api/v1/suppliers/procurements
 * Record a new milk procurement entry.
 */
router.post(
  '/procurements',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'DOCK_INSPECTOR']),
  validate({ body: createProcurementSchema }),
  procurementController.createProcurement
);

/**
 * GET /api/v1/suppliers/procurements
 * List all procurement records with filtering and pagination.
 */
router.get(
  '/procurements',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER', 'DOCK_INSPECTOR']),
  validate({ query: getProcurementsQuerySchema }),
  procurementController.getAllProcurements
);

/**
 * GET /api/v1/suppliers/procurements/:id
 * Get a single procurement record by ID.
 */
router.get(
  '/procurements/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'DOCK_INSPECTOR']),
  validate({ params: procurementIdParamSchema }),
  procurementController.getProcurementById
);

/**
 * PATCH /api/v1/suppliers/procurements/:id
 * Update a procurement record (status or amountPaid).
 */
router.patch(
  '/procurements/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: procurementIdParamSchema, body: updateProcurementSchema }),
  procurementController.updateProcurement
);

export default router;
