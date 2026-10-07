import mongoose from 'mongoose';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';
import Customer from '../../../models/Customer.model.js';
import KhataEntry from '../../../models/KhataEntry.model.js';
import User from '../../../models/User.model.js';
import AppError from '../../../utils/AppError.js';

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
    const isKhataPayment = orderData.paymentMethod === 'KHATA';
    const isDeliveryUnpaid =
      orderData.fulfillmentType === 'DELIVERY' ||
      orderData.paymentMethod === 'COD' ||
      orderData.paymentMethod === 'KHATA';

    const splitKhataAmount =
      orderData.paymentMethod === 'SPLIT' && orderData.splitPaymentMeta?.khataAmount
        ? Number(orderData.splitPaymentMeta.khataAmount)
        : 0;

    let totalKhataDebit = 0;
    if (isKhataPayment || (isDeliveryUnpaid && (Number(orderData.amountReceived) || 0) < orderData.grandTotal)) {
      totalKhataDebit = Math.max(0, orderData.grandTotal - (Number(orderData.amountReceived) || 0));
    } else if (orderData.paymentMethod === 'SPLIT') {
      totalKhataDebit = splitKhataAmount;
    } else if (orderData.paymentMethod === 'CASH' || orderData.paymentMethod === 'ONLINE') {
      totalKhataDebit = Math.max(0, orderData.grandTotal - (Number(orderData.amountReceived) || orderData.grandTotal));
    }

    if (totalKhataDebit > 0 && customer && customer.creditLimit > 0) {
      const availableCredit = customer.creditLimit - (customer.currentBalance || customer.khataBalance || 0);
      if (availableCredit > 0 && totalKhataDebit > availableCredit) {
        // Warning note: allowed but flagged
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
    // Deduct stock for all items connected to tracked inventory products (strictly zero-validated)
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        let prod = null;
        if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
          prod = await Product.findById(item.productId);
        }
        if (!prod && item.sku) {
          prod = await Product.findOne({ sku: item.sku });
        }
        if (!prod && item.name) {
          const nameRegex = new RegExp(`^${item.name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
          prod = await Product.findOne({ name: nameRegex });
        }
        if (prod) {
          const qty = Number(item.quantity) || 0;
          prod.currentStock = Math.max(0, Number(((prod.currentStock || 0) - qty).toFixed(2)));
          await prod.save();
        }
      }
    }

    // 8. Update Customer Khata and create Khata Ledger Entry for customer purchase history
    if (customer) {
      const billPortion = totalKhataDebit > 0 ? totalKhataDebit : 0;
      const { advanceUsed, khataAmount, advanceBalanceAfter, newKhataBalance } = processBillAgainstAdvance(
        billPortion,
        customer.advanceBalance || 0,
        customer.khataBalance || customer.currentBalance || 0
      );

      customer.advanceBalance = advanceBalanceAfter;
      customer.khataBalance = newKhataBalance;
      customer.currentBalance = newKhataBalance;
      await customer.save();

      order.advanceUsed = advanceUsed;
      order.khataAmount = khataAmount;
      order.advanceBalanceAfter = advanceBalanceAfter;
      await order.save();

      const orderItemsSnapshot = Array.isArray(order.items)
        ? order.items.map((it) => {
            const qty = Number(it.quantity) || 1;
            const subtotal = Number(it.subtotal || it.total || 0);
            const unitPrice = Number(it.unitPrice || it.price || it.rate || (qty > 0 && subtotal > 0 ? subtotal / qty : 0));
            const finalSubtotal = subtotal > 0 ? subtotal : (unitPrice * qty);
            return {
              name: it.name || 'Product',
              quantity: qty,
              unit: it.unit || 'PIECE',
              unitPrice: unitPrice,
              subtotal: finalSubtotal,
            };
          })
        : [];

      const deliveryFee = Number(order.deliveryFee || orderData.deliveryFee || order.deliveryMeta?.deliveryFee || 0);
      if (deliveryFee > 0 && !orderItemsSnapshot.some((it) => /delivery/i.test(it.name))) {
        orderItemsSnapshot.push({
          name: 'Doorstep Delivery Fee',
          quantity: 1,
          unit: 'TRIP',
          unitPrice: deliveryFee,
          subtotal: deliveryFee,
        });
      }

      await KhataEntry.create({
        customerId: customer._id,
        date: order.date,
        voucherNumber: `KV-${order.receiptNumber}`,
        transactionType: 'DEBIT',
        description: `POS Order #${order.receiptNumber} (${order.fulfillmentType})`,
        debitAmount: order.grandTotal,
        creditAmount: 0,
        advanceUsed,
        khataAmount,
        advanceBalanceAfter,
        advanceReceived: 0,
        runningBalance: newKhataBalance,
        paymentMethod: order.paymentMethod,
        referenceTransactionId: order.receiptNumber,
        cashierId,
        items: orderItemsSnapshot,
        orderTotal: order.grandTotal,
        paidAmount: Math.max(0, (order.grandTotal - billPortion) + advanceUsed),
        remainingAmount: khataAmount,
        fulfillmentType: order.fulfillmentType === 'DELIVERY' ? 'Doorstep Delivery' : (advanceUsed > 0 && khataAmount === 0 ? 'Paid from Advance' : 'Walk-in Counter'),
        riderName: order.deliveryMeta?.riderName || order.deliveryMeta?.riderNameSnapshot || orderData.deliveryMeta?.riderName || orderData.riderName || null,
        deliveryAddress: order.deliveryMeta?.deliveryAddress || order.deliveryMeta?.dropAddress || customer.address || null,
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
    const advanceUsedToReverse = Number(order.advanceUsed || 0);
    const isKhataPayment = order.paymentMethod === 'KHATA';
    const splitKhata =
      order.paymentMethod === 'SPLIT' && order.splitPaymentMeta?.khataAmount
        ? Number(order.splitPaymentMeta.khataAmount)
        : 0;
    const khataAmountToReverse = Number(order.khataAmount !== undefined ? order.khataAmount : (isKhataPayment ? order.grandTotal : splitKhata));

    if (order.customerId && (khataAmountToReverse > 0 || advanceUsedToReverse > 0)) {
      const customer = await Customer.findById(order.customerId);
      if (customer) {
        const newAdvance = Math.max(0, (customer.advanceBalance || 0) + advanceUsedToReverse);
        const newKhata = Math.max(0, (customer.currentBalance || customer.khataBalance || 0) - khataAmountToReverse);

        customer.advanceBalance = newAdvance;
        customer.khataBalance = newKhata;
        customer.currentBalance = newKhata;
        await customer.save();

        await KhataEntry.create({
          customerId: order.customerId,
          date: new Date(),
          voucherNumber: `REV-${order.receiptNumber}`,
          transactionType: 'CREDIT',
          description: `Order Voided / Reversal #${order.receiptNumber}: ${reason}`,
          debitAmount: 0,
          creditAmount: khataAmountToReverse,
          advanceUsed: 0,
          khataAmount: 0,
          advanceReceived: advanceUsedToReverse,
          advanceBalanceAfter: newAdvance,
          runningBalance: newKhata,
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
