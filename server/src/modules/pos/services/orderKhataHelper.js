import KhataEntry from '../../../models/KhataEntry.model.js';
import Customer from '../../../models/Customer.model.js';
import { processBillAgainstAdvance } from '../../../utils/khataAdvanceHelper.js';

/**
 * Updates Customer Khata balance and creates a Khata ledger entry for a new POS order.
 */
export async function updateCustomerKhataForOrder({ customer, order, orderData, directPaymentTotal, cashierId }) {
  if (!customer) return;

  const availAdvance = Math.max(0, Number(customer.advanceBalance || 0));
  const curKhata = Math.max(0, Number(customer.khataBalance ?? customer.currentBalance ?? 0));

  const { advanceUsed, khataAmount: billUncoveredAfterAdv, advanceBalanceAfter } = processBillAgainstAdvance(
    order.grandTotal,
    availAdvance,
    curKhata
  );

  // Direct payment applies to bill after advance
  const actualDirectPaymentApplied = Math.min(billUncoveredAfterAdv, directPaymentTotal);
  const finalKhataAdded = Math.max(0, billUncoveredAfterAdv - actualDirectPaymentApplied);
  const newKhataBalance = curKhata + finalKhataAdded;

  customer.advanceBalance = advanceBalanceAfter;
  customer.khataBalance = newKhataBalance;
  customer.currentBalance = newKhataBalance;
  await customer.save();

  order.advanceUsed = advanceUsed;
  order.khataAmount = finalKhataAdded;
  order.advanceBalanceAfter = advanceBalanceAfter;
  await order.save();

  const orderItemsSnapshot = Array.isArray(order.items)
    ? order.items.map((it) => {
        const qty = Number(it.quantity) || 1;
        const subtotal = Number(it.subtotal || it.total || 0);
        const unitPrice = Number(it.unitPrice || it.price || it.rate || (qty > 0 && subtotal > 0 ? subtotal / qty : 0));
        const finalSubtotal = subtotal > 0 ? subtotal : unitPrice * qty;
        return {
          name: it.name || 'Product',
          quantity: qty,
          unit: it.unit || 'PIECE',
          unitPrice,
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
    orderId: order._id,
    date: order.date,
    voucherNumber: `KV-${order.receiptNumber}`,
    transactionType: 'DEBIT',
    description: `POS Order #${order.receiptNumber} (${order.fulfillmentType})`,
    debitAmount: order.grandTotal,
    creditAmount: 0,
    advanceUsed,
    khataAmount: finalKhataAdded,
    advanceBalanceAfter,
    advanceReceived: 0,
    runningBalance: newKhataBalance,
    paymentMethod: order.paymentMethod,
    splitPaymentMeta: order.splitPaymentMeta || null,
    onlineTransferMeta: order.onlineTransferMeta || null,
    referenceTransactionId: order.receiptNumber,
    cashierId,
    items: orderItemsSnapshot,
    orderTotal: order.grandTotal,
    paidAmount: advanceUsed + actualDirectPaymentApplied,
    remainingAmount: finalKhataAdded,
    fulfillmentType:
      order.fulfillmentType === 'DELIVERY'
        ? 'Doorstep Delivery'
        : advanceUsed > 0 && finalKhataAdded === 0
        ? 'Paid from Advance'
        : 'Walk-in Counter',
    riderName:
      order.deliveryMeta?.riderName ||
      order.deliveryMeta?.riderNameSnapshot ||
      orderData.deliveryMeta?.riderName ||
      orderData.riderName ||
      null,
    deliveryAddress:
      order.deliveryMeta?.deliveryAddress || order.deliveryMeta?.dropAddress || customer.address || null,
  });
}

/**
 * Reverses Customer Khata balance and creates a reversing Khata entry when an order is voided/cancelled.
 */
export async function reverseCustomerKhataForOrder({ order, reason, cancelledByUserId }) {
  const advanceUsedToReverse = Number(order.advanceUsed || 0);
  const isKhataPayment = order.paymentMethod === 'KHATA';
  const splitKhata =
    order.paymentMethod === 'SPLIT' && order.splitPaymentMeta?.khataAmount
      ? Number(order.splitPaymentMeta.khataAmount)
      : 0;
  const khataAmountToReverse = Number(
    order.khataAmount !== undefined ? order.khataAmount : isKhataPayment ? order.grandTotal : splitKhata
  );

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
}
