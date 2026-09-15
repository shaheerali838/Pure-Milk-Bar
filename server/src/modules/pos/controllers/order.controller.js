import orderService from '../services/order.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class OrderController {
  /**
   * POST /api/v1/pos/orders
   * Create and record a new POS transaction.
   */
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.body, req.user);

      return sendSuccess(res, 201, 'Order placed successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/pos/orders
   * Retrieve paginated orders with filters (date range, cashier, payment method, etc.).
   */
  async getAllOrders(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const { orders, total, page, limit, totalPages } = await orderService.getAllOrders(query);

      return sendSuccess(
        res,
        200,
        'Orders retrieved successfully',
        orders,
        { page, limit, total, totalPages }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/pos/orders/stats/daily
   * Get register closing summary & daily sales statistics.
   */
  async getDailySalesStats(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const stats = await orderService.getDailySalesStats(query.date);

      return sendSuccess(res, 200, 'Daily sales statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/pos/orders/receipt/:receiptNumber
   * Fetch an order by its unique receipt number (e.g. for reprinting or return verification).
   */
  async getOrderByReceiptNumber(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const order = await orderService.getOrderByReceiptNumber(params.receiptNumber);

      return sendSuccess(res, 200, 'Receipt details retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/pos/orders/:id
   * Get single order details by MongoDB ObjectId.
   */
  async getOrderById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const order = await orderService.getOrderById(params.id);

      return sendSuccess(res, 200, 'Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/pos/orders/:id/cancel
   * Void an order, restock inventory, and adjust Khata ledger if needed.
   */
  async cancelOrder(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const { reason } = req.body;
      const result = await orderService.cancelOrder(params.id, reason, req.user?.id);

      return sendSuccess(res, 200, 'Order cancelled and voided successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
