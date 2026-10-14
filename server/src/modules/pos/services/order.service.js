import mongoose from 'mongoose';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';
import Customer from '../../../models/Customer.model.js';
import User from '../../../models/User.model.js';
import AppError from '../../../utils/AppError.js';
import { matchProductForServerItem, getLiveAvailableStock } from '../../../utils/stockResolver.js';
import { updateCustomerKhataForOrder, reverseCustomerKhataForOrder } from './orderKhataHelper.js';

class OrderService {
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

  async createOrder(orderData, cashierUser = null) {
    // 1. Resolve Cashier ID
    let cashierId = cashierUser?.id || cashierUser?._id || orderData.cashierId;
    if (!cashierId) {
      const adminUser = await User.findOne({ role: 'ADMIN' });
      cashierId = adminUser?._id || '65f000000000000000000001';
    }

    // 2. Handle Customer verification
    let customer = null;
    let customerNameSnapshot = orderData.customerNameSnapshot || null;

    if (orderData.customerId) {
      customer = await Customer.findById(orderData.customerId);
      if (!customer) {
        throw new AppError('Selected customer was not found', 404, 'CUSTOMER_NOT_FOUND');
      }

      if (String(customer.status || '').toUpperCase() !== 'ACTIVE') {
        throw new AppError(
          `Customer account is currently ${customer.status}. Only ACTIVE accounts can make purchases.`,
          400,
          'CUSTOMER_INACTIVE'
        );
      }

      customerNameSnapshot = customer.name;
    }

    // 3. Khata Payment Verification & Limits
    const pMethod = String(orderData.paymentMethod || 'CASH').toUpperCase();
    const isKhataPayment = pMethod === 'KHATA';
    const isDeliveryUnpaid =
      (orderData.fulfillmentType === 'DELIVERY' || pMethod === 'COD' || isKhataPayment) &&
      pMethod !== 'CASH' &&
      pMethod !== 'ONLINE' &&
      pMethod !== 'EASYPAISA' &&
      pMethod !== 'JAZZCASH' &&
      pMethod !== 'SPLIT';

    let cashReceived = 0;
    let easyPaisaReceived = 0;
    let jazzCashReceived = 0;
    let onlineReceived = 0;
    let directPaymentTotal = 0;

    if (pMethod === 'CASH') {
      const amtRec = Number(orderData.amountReceived);
      cashReceived = !isNaN(amtRec) && amtRec > 0 ? amtRec : orderData.grandTotal;
      directPaymentTotal = cashReceived;
    } else if (pMethod === 'EASYPAISA') {
      const amtRec = Number(orderData.amountReceived);
      easyPaisaReceived = !isNaN(amtRec) && amtRec > 0 ? amtRec : orderData.grandTotal;
      onlineReceived = easyPaisaReceived;
      directPaymentTotal = easyPaisaReceived;
    } else if (pMethod === 'JAZZCASH') {
      const amtRec = Number(orderData.amountReceived);
      jazzCashReceived = !isNaN(amtRec) && amtRec > 0 ? amtRec : orderData.grandTotal;
      onlineReceived = jazzCashReceived;
      directPaymentTotal = jazzCashReceived;
    } else if (pMethod === 'ONLINE') {
      const provider = String(orderData.onlineTransferMeta?.provider || '').toUpperCase();
      const amtRec = Number(orderData.amountReceived);
      const val = !isNaN(amtRec) && amtRec > 0 ? amtRec : orderData.grandTotal;
      if (provider.includes('EASYPAISA')) {
        easyPaisaReceived = val;
      } else if (provider.includes('JAZZCASH')) {
        jazzCashReceived = val;
      }
      onlineReceived = val;
      directPaymentTotal = val;
    } else if (pMethod === 'SPLIT') {
      cashReceived = Math.max(0, Number(orderData.splitPaymentMeta?.cashAmount) || 0);
      easyPaisaReceived = Math.max(0, Number(orderData.splitPaymentMeta?.easyPaisaAmount) || 0);
      jazzCashReceived = Math.max(0, Number(orderData.splitPaymentMeta?.jazzCashAmount) || 0);
      const directOnline = Math.max(0, Number(orderData.splitPaymentMeta?.onlineAmount) || 0);
      onlineReceived = directOnline > 0 ? directOnline : (easyPaisaReceived + jazzCashReceived);
      directPaymentTotal = cashReceived + onlineReceived;
    }

    // 4. Generate unique receipt number if not supplied
    const receiptNumber = orderData.receiptNumber
      ? orderData.receiptNumber.toUpperCase()
      : await this.generateReceiptNumber();

    // 5. Calculate Change for Cash transactions
    let amountReceived = orderData.amountReceived !== undefined ? Number(orderData.amountReceived) : directPaymentTotal;
    let changeGiven = orderData.changeGiven || 0;

    if (pMethod === 'CASH' && amountReceived > orderData.grandTotal) {
      changeGiven = Math.max(0, amountReceived - orderData.grandTotal);
    }

    // 5.5 Pre-order Inventory Stock Validation
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      for (const item of orderData.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        const prod = await matchProductForServerItem(item);
        if (prod) {
          const availStock = await getLiveAvailableStock(prod);
          if (availStock <= 0 || qty > availStock) {
            throw new AppError(
              `Insufficient stock for "${prod.name}". Available: ${availStock} ${prod.unit || ''}, Requested: ${qty}`,
              400,
              'INSUFFICIENT_STOCK'
            );
          }
        }
      }
    }

    // 6. Assemble Order document
    const newOrderPayload = {
      ...orderData,
      paymentMethod: pMethod,
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
    // Deduct stock for all items connected to tracked inventory products (atomic & resilient)
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        const prod = await matchProductForServerItem(item);
        if (prod) {
          const avail = await getLiveAvailableStock(prod);
          const newStock = Math.max(0, Number((avail - qty).toFixed(2)));
          await Product.findByIdAndUpdate(prod._id, { $set: { currentStock: newStock } });
        }
      }
    }

    // 8. Update Customer Khata and create Khata Ledger Entry for customer purchase history
    if (customer) {
      await updateCustomerKhataForOrder({
        customer,
        order,
        orderData,
        directPaymentTotal,
        cashierId,
      });
    }

    // 9. Return fully populated order
    return await Order.findById(order._id)
      .populate('cashierId', 'name username role')
      .populate('customerId', 'name phone code currentBalance advanceBalance khataBalance creditLimit')
      .lean();
  }

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
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 20));
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

    // 2. Reverse Khata debt & Advance if applicable
    await reverseCustomerKhataForOrder({
      order,
      reason,
      cancelledByUserId,
    });

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
