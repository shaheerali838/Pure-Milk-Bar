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

router.get(
  '/products/stats',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  productController.getProductStats
);

router.get(
  '/products/low-stock',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  productController.getLowStockProducts
);

router.post(
  '/products',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ body: createProductSchema }),
  productController.createProduct
);

router.get(
  '/products',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER', 'CASHIER']),
  validate({ query: getProductsQuerySchema }),
  productController.getAllProducts
);

router.get(
  '/products/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: productIdParamSchema }),
  productController.getProductById
);

router.patch(
  '/products/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  productController.updateProduct
);

router.delete(
  '/products/:id',
  // authenticate,
  // authorize(['ADMIN', 'MANAGER']),
  validate({ params: productIdParamSchema }),
  productController.deleteProduct
);

export default router;
