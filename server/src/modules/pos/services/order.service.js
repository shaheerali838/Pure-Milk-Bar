import mongoose from 'mongoose';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';
import Customer from '../../../models/Customer.model.js';
import KhataEntry from '../../../models/KhataEntry.model.js';
import AppError from '../../../utils/AppError.js';

class OrderService {
  /**
   * Helper to generate a human-readable, unique receipt number.
   * Format: REC-YYYYMMDD-XXXX (e.g. REC-20260914-A1B2)
   */
  async generateReceiptNumber() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let isUnique = false;
    let receiptNumber = '';

    while (!isUnique) {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      receiptNumber = `REC-${todayStr}-${randomSuffix}`;
      const existing = await Order.findOne({ receiptNumber });
      if (!existing) {
        isUnique = true;
      }
    }

    return receiptNumber;
  }

  /**
   * Create and record a new POS order.
   * Deducts inventory stock, logs customer khata debt if applicable, and saves the order.
   *
   * @param {object} orderData - Validated order payload
   * @param {object} [cashierUser] - Authenticated user object from req.user
   * @returns {Promise<object>} Created order document populated with cashier & customer
   */
  async createOrder(orderData, cashierUser = null) {
    // 1. Resolve Cashier ID
    const cashierId = cashierUser?.id || orderData.cashierId;
    if (!cashierId) {
      throw new AppError('Cashier ID is required to process order', 400, 'MISSING_CASHIER');
    }

    // 2. Handle Customer verification
    let customer = null;
    let customerNameSnapshot = orderData.customerNameSnapshot || null;

    if (orderData.customerId) {
      customer = await Customer.findById(orderData.customerId);
      if (!customer) {
        throw new AppError('Selected customer was not found', 404, 'CUSTOMER_NOT_FOUND');
      }

      if (customer.status !== 'ACTIVE') {
        throw new AppError(
          `Customer account is currently ${customer.status}. Only ACTIVE accounts can make purchases.`,
          400,
          'CUSTOMER_INACTIVE'
        );
      }

      customerNameSnapshot = customer.name;
    }

    // 3. Khata Payment Verification & Limits
    const isKhataPayment = orderData.paymentMethod === 'KHATA';
    const splitKhataAmount =
      orderData.paymentMethod === 'SPLIT' && orderData.splitPaymentMeta?.khataAmount
        ? Number(orderData.splitPaymentMeta.khataAmount)
        : 0;
    const totalKhataDebit = isKhataPayment ? orderData.grandTotal : splitKhataAmount;

    if (totalKhataDebit > 0) {
      if (!customer) {
        throw new AppError(
          'An active customer account must be selected for Khata credit payments.',
          400,
          'CUSTOMER_REQUIRED_FOR_KHATA'
        );
      }

      const availableCredit = customer.creditLimit - customer.currentBalance;
      if (totalKhataDebit > availableCredit) {
        throw new AppError(
          `Credit limit exceeded. Customer available credit is Rs. ${availableCredit.toLocaleString()}, but order requires Rs. ${totalKhataDebit.toLocaleString()}.`,
          400,
          'CREDIT_LIMIT_EXCEEDED'
        );
      }
    }

    // 4. Generate unique receipt number if not supplied
    const receiptNumber = orderData.receiptNumber
      ? orderData.receiptNumber.toUpperCase()
      : await this.generateReceiptNumber();

    // 5. Calculate Change for Cash transactions
    let amountReceived = orderData.amountReceived || 0;
    let changeGiven = orderData.changeGiven || 0;

    if (orderData.paymentMethod === 'CASH') {
      if (amountReceived > 0 && amountReceived >= orderData.grandTotal) {
        changeGiven = Math.max(0, amountReceived - orderData.grandTotal);
      }
    }

    // 6. Assemble Order document
    const newOrderPayload = {
      ...orderData,
      receiptNumber,
      cashierId,
      customerId: customer ? customer._id : null,
      customerNameSnapshot,
      amountReceived,
      changeGiven,
      date: orderData.date || new Date(),
    };

    const order = await Order.create(newOrderPayload);

    // 7. Inventory Stock Adjustment
    // Deduct stock for all items connected to tracked inventory products
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { currentStock: -Number(item.quantity) },
          });
        }
      }
    }

    // 8. Update Customer Khata and create Khata Ledger Entry if credit used
    if (customer && totalKhataDebit > 0) {
      const updatedCustomer = await Customer.findByIdAndUpdate(
        customer._id,
        { $inc: { currentBalance: totalKhataDebit } },
        { new: true }
      );

      await KhataEntry.create({
        customerId: customer._id,
        date: order.date,
        voucherNumber: `KV-${order.receiptNumber}`,
        transactionType: 'DEBIT',
        description: `POS Order #${order.receiptNumber} (${order.fulfillmentType})`,
        debitAmount: totalKhataDebit,
        creditAmount: 0,
        runningBalance: updatedCustomer.currentBalance,
        paymentMethod: 'KHATA',
        referenceTransactionId: order.receiptNumber,
        cashierId,
      });
    }

    // 9. Return fully populated order
    return await Order.findById(order._id)
      .populate('cashierId', 'name username role')
      .populate('customerId', 'name phone code currentBalance creditLimit')
      .lean();
  }

  /**
   * Fetch all orders with filtering, date range, search, and pagination.
   *
   * @param {object} query - Validated query parameters
   * @returns {Promise<{orders: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async getAllOrders(query) {
    const {
      page = 1,
      limit = 20,
      search,
      fulfillmentType,
      paymentMethod,
      cashierId,
      customerId,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const filter = {};

    // Search by receipt number or customer name snapshot
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { receiptNumber: searchRegex },
        { customerNameSnapshot: searchRegex },
      ];
    }

    if (fulfillmentType) filter.fulfillmentType = fulfillmentType;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (cashierId) filter.cashierId = cashierId;
    if (customerId) filter.customerId = customerId;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('cashierId', 'name username role')
        .populate('customerId', 'name phone code')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      orders,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  /**
   * Get single order by MongoDB ObjectId.
   *
   * @param {string} id - Order ObjectId
   * @returns {Promise<object>} Order document
   */
  async getOrderById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(`Invalid Order ID format: '${id}'`, 400, 'INVALID_ORDER_ID');
    }

    const order = await Order.findById(id)
      .populate('cashierId', 'name username role')
      .populate('customerId', 'name phone code address currentBalance creditLimit')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Get single order by its unique receipt number.
   *
   * @param {string} receiptNumber - Formatted receipt number
   * @returns {Promise<object>} Order document
   */
  async getOrderByReceiptNumber(receiptNumber) {
    const cleanReceiptNumber = receiptNumber.trim().toUpperCase();
    const order = await Order.findOne({ receiptNumber: cleanReceiptNumber })
      .populate('cashierId', 'name username role')
      .populate('customerId', 'name phone code address currentBalance creditLimit')
      .lean();

    if (!order) {
      throw new AppError(`Order with receipt '${cleanReceiptNumber}' not found`, 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Aggregate daily sales summary and register closing statistics.
   *
   * @param {string|Date} [targetDate] - Optional date to view stats for (defaults to today)
   * @returns {Promise<object>} Sales stats breakdown
   */
  async getDailySalesStats(targetDate = null) {
    const baseDate = targetDate ? new Date(targetDate) : new Date();
    const startOfDay = new Date(baseDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(baseDate.setHours(23, 59, 59, 999));

    const matchStage = {
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    const statsAggregation = await Order.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                grossSales: { $sum: '$grandTotal' },
                subtotalSum: { $sum: '$subtotal' },
                totalDiscounts: { $sum: '$discountAmount' },
                totalDeliveryFees: { $sum: '$deliveryFee' },
              },
            },
          ],
          byPaymentMethod: [
            {
              $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                totalAmount: { $sum: '$grandTotal' },
              },
            },
          ],
          byFulfillmentType: [
            {
              $group: {
                _id: '$fulfillmentType',
                count: { $sum: 1 },
                totalAmount: { $sum: '$grandTotal' },
              },
            },
          ],
        },
      },
    ]);

    const result = statsAggregation[0] || {};
    const summary = result.totals?.[0] || {
      totalOrders: 0,
      grossSales: 0,
      subtotalSum: 0,
      totalDiscounts: 0,
      totalDeliveryFees: 0,
    };

    // Calculate Average Order Value
    const averageOrderValue =
      summary.totalOrders > 0 ? Number((summary.grossSales / summary.totalOrders).toFixed(2)) : 0;

    return {
      date: startOfDay.toISOString().slice(0, 10),
      totalOrders: summary.totalOrders,
      grossSales: summary.grossSales,
      netSales: summary.subtotalSum - summary.totalDiscounts,
      totalDiscounts: summary.totalDiscounts,
      totalDeliveryFees: summary.totalDeliveryFees,
      averageOrderValue,
      paymentBreakdown: (result.byPaymentMethod || []).reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          amount: item.totalAmount,
        };
        return acc;
      }, {}),
      fulfillmentBreakdown: (result.byFulfillmentType || []).reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          amount: item.totalAmount,
        };
        return acc;
      }, {}),
    };
  }

  /**
   * Cancel and void an order.
   * Restores product stock and reverses any Khata debt on the customer account.
   *
   * @param {string} id - Order ObjectId
   * @param {string} reason - Cancellation reason
   * @param {string} [cancelledByUserId] - User ID performing the cancellation
   * @returns {Promise<object>} Cancelled order summary
   */
  async cancelOrder(id, reason, cancelledByUserId = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(`Invalid Order ID: '${id}'`, 400, 'INVALID_ORDER_ID');
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // 1. Restock products
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { currentStock: Number(item.quantity) },
          });
        }
      }
    }

    // 2. Reverse Khata debt if applicable
    const isKhataPayment = order.paymentMethod === 'KHATA';
    const splitKhata =
      order.paymentMethod === 'SPLIT' && order.splitPaymentMeta?.khataAmount
        ? Number(order.splitPaymentMeta.khataAmount)
        : 0;
    const khataAmountToReverse = isKhataPayment ? order.grandTotal : splitKhata;

    if (order.customerId && khataAmountToReverse > 0) {
      const updatedCustomer = await Customer.findByIdAndUpdate(
        order.customerId,
        { $inc: { currentBalance: -khataAmountToReverse } },
        { new: true }
      );

      if (updatedCustomer) {
        await KhataEntry.create({
          customerId: order.customerId,
          date: new Date(),
          voucherNumber: `REV-${order.receiptNumber}`,
          transactionType: 'CREDIT',
          description: `Order Voided / Reversal #${order.receiptNumber}: ${reason}`,
          debitAmount: 0,
          creditAmount: khataAmountToReverse,
          runningBalance: updatedCustomer.currentBalance,
          paymentMethod: 'ADJUSTMENT',
          referenceTransactionId: order.receiptNumber,
          cashierId: cancelledByUserId || order.cashierId,
        });
      }
    }

    // 3. Remove or delete the cancelled order record
    await Order.findByIdAndDelete(id);

    return {
      receiptNumber: order.receiptNumber,
      cancelledAt: new Date(),
      reason,
      message: `Order #${order.receiptNumber} successfully voided and inventory restored.`,
    };
  }
}

export default new OrderService();
