import { Router } from 'express';
import validate from '../../../middlewares/validate.js';

// Controller
import productController from '../controllers/product.controller.js';

// Validators
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
} from '../validators/product.validator.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
//  PRODUCT ROUTES — /api/v1/inventory/products
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/inventory/products/stats
 * Get aggregate statistics for the inventory.
 * NOTE: This route must be declared BEFORE /:id to avoid conflict.
 */
router.get(
  '/products/stats',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  productController.getProductStats
);

/**
 * GET /api/v1/inventory/products/low-stock
 * Get products below their minimum alert stock level.
 * NOTE: This route must be declared BEFORE /:id to avoid conflict.
 */
router.get(
  '/products/low-stock',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  productController.getLowStockProducts
);

/**
 * POST /api/v1/inventory/products
 * Add a new product to the inventory.
 */
router.post(
  '/products',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ body: createProductSchema }),
  productController.createProduct
);

/**
 * GET /api/v1/inventory/products
 * List all products with filtering, search, and pagination.
 */
router.get(
  '/products',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER']),
  validate({ query: getProductsQuerySchema }),
  productController.getAllProducts
);

/**
 * GET /api/v1/inventory/products/:id
 * Get a single product by ID.
 */
router.get(
  '/products/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: productIdParamSchema }),
  productController.getProductById
);

/**
 * PATCH /api/v1/inventory/products/:id
 * Update an existing product.
 */
router.patch(
  '/products/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  productController.updateProduct
);

/**
 * DELETE /api/v1/inventory/products/:id
 * Delete a product from inventory.
 */
router.delete(
  '/products/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: productIdParamSchema }),
  productController.deleteProduct
);

export default router;
