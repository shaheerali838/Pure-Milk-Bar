import orderService from '../services/order.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class OrderController {
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.body, req.user);

      return sendSuccess(res, 201, 'Order placed successfully', order);
    } catch (error) {
      next(error);
    }
  }

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

  async getDailySalesStats(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const stats = await orderService.getDailySalesStats(query.date);

      return sendSuccess(res, 200, 'Daily sales statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  async getOrderByReceiptNumber(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const order = await orderService.getOrderByReceiptNumber(params.receiptNumber);

      return sendSuccess(res, 200, 'Receipt details retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const order = await orderService.getOrderById(params.id);

      return sendSuccess(res, 200, 'Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

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
