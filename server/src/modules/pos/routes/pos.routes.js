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

// Protect all POS routes
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
//  POS STATS & RECEIPT LOOKUP
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  '/stats/daily',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: dailySalesStatsQuerySchema }),
  orderController.getDailySalesStats
);

router.get(
  '/orders/stats/daily',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: dailySalesStatsQuerySchema }),
  orderController.getDailySalesStats
);

router.get(
  '/receipt/:receiptNumber',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: receiptNumberParamSchema }),
  orderController.getOrderByReceiptNumber
);

router.get(
  '/orders/receipt/:receiptNumber',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: receiptNumberParamSchema }),
  orderController.getOrderByReceiptNumber
);

// ═══════════════════════════════════════════════════════════════════════════
//  ORDER CRUD & LISTING
// ═══════════════════════════════════════════════════════════════════════════

router.post(
  '/orders',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ body: createOrderSchema }),
  orderController.createOrder
);

router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ body: createOrderSchema }),
  orderController.createOrder
);

router.get(
  '/orders',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: getOrdersQuerySchema }),
  orderController.getAllOrders
);

router.get(
  '/',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ query: getOrdersQuerySchema }),
  orderController.getAllOrders
);

router.get(
  '/orders/:id',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: orderIdParamSchema }),
  orderController.getOrderById
);

router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate({ params: orderIdParamSchema }),
  orderController.getOrderById
);

router.post(
  '/orders/:id/cancel',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  orderController.cancelOrder
);

router.post(
  '/:id/cancel',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  orderController.cancelOrder
);

export default router;
