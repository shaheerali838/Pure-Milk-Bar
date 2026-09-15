import { Router } from 'express';
import validate from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

// Controllers
import orderController from '../controllers/order.controller.js';

// Validators
import {
  createOrderSchema,
  getOrdersQuerySchema,
  orderIdParamSchema,
  receiptNumberParamSchema,
  dailySalesStatsQuerySchema,
  cancelOrderSchema,
} from '../validators/order.validator.js';

const router = Router();

// Optional/Protected: Uncomment to enforce JWT token on all POS routes
// router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
//  POS STATS & RECEIPT LOOKUP (Declared before :id parameter)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/pos/stats/daily
 * GET /api/v1/pos/orders/stats/daily
 * Daily sales statistics, payment breakdown, and register summary.
 */
router.get(
  '/stats/daily',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: dailySalesStatsQuerySchema }),
  orderController.getDailySalesStats
);

router.get(
  '/orders/stats/daily',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: dailySalesStatsQuerySchema }),
  orderController.getDailySalesStats
);

/**
 * GET /api/v1/pos/receipt/:receiptNumber
 * GET /api/v1/pos/orders/receipt/:receiptNumber
 * Find an order directly by receipt number.
 */
router.get(
  '/receipt/:receiptNumber',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: receiptNumberParamSchema }),
  orderController.getOrderByReceiptNumber
);

router.get(
  '/orders/receipt/:receiptNumber',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: receiptNumberParamSchema }),
  orderController.getOrderByReceiptNumber
);

// ═══════════════════════════════════════════════════════════════════════════
//  ORDER CRUD & LISTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/pos/orders
 * POST /api/v1/pos
 * Create and record a new POS transaction.
 */
router.post(
  '/orders',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ body: createOrderSchema }),
  orderController.createOrder
);

router.post(
  '/',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ body: createOrderSchema }),
  orderController.createOrder
);

/**
 * GET /api/v1/pos/orders
 * GET /api/v1/pos
 * List all orders with pagination, search, and filters.
 */
router.get(
  '/orders',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: getOrdersQuerySchema }),
  orderController.getAllOrders
);

router.get(
  '/',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: getOrdersQuerySchema }),
  orderController.getAllOrders
);

/**
 * GET /api/v1/pos/orders/:id
 * GET /api/v1/pos/:id
 * Retrieve a specific order by ID.
 */
router.get(
  '/orders/:id',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: orderIdParamSchema }),
  orderController.getOrderById
);

router.get(
  '/:id',
  // authenticate,
  // authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: orderIdParamSchema }),
  orderController.getOrderById
);

/**
 * POST /api/v1/pos/orders/:id/cancel
 * POST /api/v1/pos/:id/cancel
 * Cancel/void an order, restoring product stock and customer Khata balance.
 */
router.post(
  '/orders/:id/cancel',
  // authenticate,
  // authorize('ADMIN', 'MANAGER'),
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  orderController.cancelOrder
);

router.post(
  '/:id/cancel',
  // authenticate,
  // authorize('ADMIN', 'MANAGER'),
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  orderController.cancelOrder
);

export default router;
