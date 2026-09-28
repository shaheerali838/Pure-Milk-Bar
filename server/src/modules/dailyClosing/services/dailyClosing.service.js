import mongoose from 'mongoose';
import DailyClosing from '../../../models/DailyClosing.model.js';
import MilkingYieldLog from '../../../models/MilkingYieldLog.model.js';
import MilkProcurement from '../../../models/MilkProcurement.model.js';
import Order from '../../../models/Order.model.js';
import DeliveryRun from '../../../models/DeliveryRun.model.js';
import Expense from '../../../models/Expense.model.js';
import ProcessingBatch from '../../../models/ProcessingBatch.model.js';
import KhataEntry from '../../../models/KhataEntry.model.js';
import WastageLog from '../../../models/WastageLog.model.js';
import Product from '../../../models/Product.model.js';
import VehicleFuelLog from '../../../models/VehicleFuelLog.model.js';
import User from '../../../models/User.model.js';
import AuditLog from '../../../models/AuditLog.model.js';
import { getPktDayRange, getPktDateRange, getPktTodayString } from '../../../utils/dateUtils.js';

/**
 * Helper to record Audit Log entries
 */
const createAuditLog = async ({
  reqUser,
  action,
  resourceId,
  beforeSnapshot,
  afterSnapshot,
  details,
  ipAddress = '127.0.0.1',
}) => {
  try {
    const user = reqUser?.id ? await User.findById(reqUser.id).select('username role') : null;
    await AuditLog.create({
      userId: reqUser?.id || reqUser?._id || new mongoose.Types.ObjectId('65f000000000000000000001'),
      username: user ? user.username : (reqUser?.username || 'system'),
      userRole: reqUser?.role || 'ADMIN',
      ipAddress,
      action,
      resource: 'DailyClosing',
      resourceId: resourceId ? resourceId.toString() : null,
      beforeSnapshot,
      afterSnapshot,
      status: 'SUCCESS',
      details,
    });
  } catch (err) {
    console.error('AuditLog creation failed in DailyClosing:', err.message);
  }
};

/**
 * Core calculation function for a single business date in PKT
 */
export const calculateDaySummary = async (targetDateStr, manualOpeningMilk = null, manualOpeningCash = null) => {
  const { startOfDay, endOfDay, dateStr } = getPktDayRange(targetDateStr);

  // 1. Fetch Most Recent Confirmed Closing before this date for Opening Balances
  const previousClosing = await DailyClosing.findOne({
    closingDate: { $lt: startOfDay },
    status: { $in: ['APPROVED', 'CLOSED', 'RECONCILED', 'LOCKED'] },
  }).sort({ closingDate: -1 });

  let openingSource = { type: 'NONE', date: null };
  let openingMilkStock = manualOpeningMilk !== null ? Number(manualOpeningMilk) : 0;
  let openingCash = manualOpeningCash !== null ? Number(manualOpeningCash) : 0;
  const previousProductStocks = new Map();

  if (previousClosing) {
    const prevDateStr = getPktDayRange(previousClosing.closingDate).dateStr;
    openingSource = {
      type: 'PREVIOUS_CLOSING',
      date: prevDateStr,
      closingId: previousClosing._id,
    };

    if (manualOpeningMilk === null) {
      openingMilkStock =
        previousClosing.physicalMilkDip ??
        previousClosing.milkBalance?.physicalDipstick ??
        previousClosing.milkBalance?.theoreticalStock ??
        previousClosing.summarySnapshot?.milk?.expectedClosing ??
        0;
    }

    if (manualOpeningCash === null) {
      openingCash =
        previousClosing.physicalCash ??
        previousClosing.financialBalance?.physicalCash ??
        previousClosing.financialBalance?.expectedCash ??
        previousClosing.summarySnapshot?.cash?.expectedInDrawer ??
        0;
    }

    // Populate previous product stocks from snapshot
    if (Array.isArray(previousClosing.productStockSnapshot) && previousClosing.productStockSnapshot.length > 0) {
      previousClosing.productStockSnapshot.forEach((item) => {
        const key = item.productId ? item.productId.toString() : item.name?.toLowerCase()?.trim();
        if (key) {
          previousProductStocks.set(key, item.closingStock ?? 0);
        }
      });
    } else if (previousClosing.summarySnapshot?.products) {
      previousClosing.summarySnapshot.products.forEach((item) => {
        const key = item.productId ? item.productId.toString() : item.name?.toLowerCase()?.trim();
        if (key) {
          previousProductStocks.set(key, item.expectedClosing ?? 0);
        }
      });
    }
  } else if (manualOpeningMilk !== null || manualOpeningCash !== null) {
    openingSource = { type: 'MANUAL', date: null };
  }

  // 2. Farm Milk Production Yield (MilkingYieldLog)
  const yieldResult = await MilkingYieldLog.aggregate([
    { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: null, totalYield: { $sum: '$yieldLiters' } } },
  ]);
  const farmProduction = Number((yieldResult[0]?.totalYield || 0).toFixed(2));

  // 3. Supplier Milk Procurement Intake (MilkProcurement)
  const procurementResult = await MilkProcurement.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'ACCEPTED',
      },
    },
    {
      $group: {
        _id: null,
        totalProcured: { $sum: '$quantityLiters' },
        totalCashPaid: { $sum: '$amountPaid' },
      },
    },
  ]);
  const supplierInflow = Number((procurementResult[0]?.totalProcured || 0).toFixed(2));
  const supplierCashPaid = Number((procurementResult[0]?.totalCashPaid || 0).toFixed(2));

  // 4. Products Catalog lookup for exact product unit and category matching
  const allProducts = await Product.find({}).lean();
  const productById = new Map();
  const productByName = new Map();
  allProducts.forEach((p) => {
    productById.set(p._id.toString(), p);
    productByName.set(p.name.toLowerCase().trim(), p);
  });

  // 5. Orders Aggregation (POS Counter Sales, Deliveries, Split, Online, Khata)
  const orders = await Order.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  let counterSalesMilk = 0;
  let counterCash = 0;
  let counterOnline = 0;
  let creditGivenFromOrders = 0;
  let grossRevenue = 0;

  // Track product-wise quantities sold & revenue
  const productStats = new Map();
  allProducts.forEach((p) => {
    productStats.set(p._id.toString(), {
      productId: p._id.toString(),
      name: p.name,
      unit: p.unit || 'PIECE',
      category: p.category || 'General',
      costPrice: p.costPrice || 0,
      price: p.price || 0,
      currentStock: p.currentStock || 0,
      sold: 0,
      revenue: 0,
      cost: 0,
      produced: 0,
      wasted: 0,
    });
  });

  orders.forEach((order) => {
    const orderTotal = Number(order.grandTotal) || 0;
    grossRevenue += orderTotal;

    const isDeliveryOrder = order.fulfillmentType === 'DELIVERY';

    // Payment collection breakdown
    if (order.paymentMethod === 'CASH') {
      const netCash = (Number(order.amountReceived) || 0) - (Number(order.changeGiven) || 0);
      counterCash += netCash > 0 ? netCash : orderTotal;
    } else if (order.paymentMethod === 'ONLINE') {
      counterOnline += orderTotal;
    } else if (order.paymentMethod === 'SPLIT') {
      const splitCash = Number(order.splitPaymentMeta?.cashAmount) || 0;
      const splitOnline = Number(order.splitPaymentMeta?.onlineAmount) || 0;
      const splitKhata = Number(order.splitPaymentMeta?.khataAmount) || 0;
      counterCash += splitCash;
      counterOnline += splitOnline;
      creditGivenFromOrders += splitKhata;
    } else if (order.paymentMethod === 'KHATA') {
      creditGivenFromOrders += orderTotal;
    }

    // Process line items for milk flow and product breakdown
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const itemQty = Number(item.quantity) || 0;
        const itemSubtotal = Number(item.subtotal) || itemQty * (Number(item.unitPrice) || 0);

        // Lookup product
        let matchedProduct = null;
        if (item.productId && productById.has(item.productId.toString())) {
          matchedProduct = productById.get(item.productId.toString());
        } else if (item.name && productByName.has(item.name.toLowerCase().trim())) {
          matchedProduct = productByName.get(item.name.toLowerCase().trim());
        }

        const isMilk =
          (matchedProduct && matchedProduct.unit === 'LITER' && String(matchedProduct.category).toLowerCase().includes('milk')) ||
          (String(item.unit || '').toUpperCase().includes('L') && String(item.name || '').toLowerCase().includes('milk'));

        // Count counter milk sales (exclude delivery orders to prevent double counting with DeliveryRun)
        if (isMilk && !isDeliveryOrder) {
          counterSalesMilk += itemQty;
        }

        // Product statistics tracking
        if (matchedProduct) {
          const stats = productStats.get(matchedProduct._id.toString());
          if (stats) {
            stats.sold += itemQty;
            stats.revenue += itemSubtotal;
            stats.cost += itemQty * (matchedProduct.costPrice || 0);
          }
        }
      });
    }
  });

  // 6. Deliveries Dispatch (DeliveryRun)
  const deliveriesResult = await DeliveryRun.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['DELIVERED', 'PENDING'] },
      },
    },
    {
      $group: {
        _id: null,
        totalDeliveredMilk: {
          $sum: {
            $cond: [{ $eq: ['$status', 'DELIVERED'] }, '$qtyLiters', 0],
          },
        },
        totalCodCash: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'DELIVERED'] },
                  { $in: ['$paymentMode', ['CASH', 'COD']] },
                ],
              },
              { $ifNull: ['$codAmountToCollect', '$amountPaid'] },
              0,
            ],
          },
        },
        totalDeliveryOnline: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'DELIVERED'] },
                  { $eq: ['$paymentMode', 'ONLINE'] },
                ],
              },
              '$amountPaid',
              0,
            ],
          },
        },
        totalDeliveryKhataDue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'DELIVERED'] },
                  { $eq: ['$paymentMode', 'KHATA'] },
                ],
              },
              '$amountDue',
              0,
            ],
          },
        },
      },
    },
  ]);

  const doorstepSalesMilk = Number((deliveriesResult[0]?.totalDeliveredMilk || 0).toFixed(2));
  const deliveryCodCash = Number((deliveriesResult[0]?.totalCodCash || 0).toFixed(2));
  const deliveryOnline = Number((deliveriesResult[0]?.totalDeliveryOnline || 0).toFixed(2));
  const deliveryKhataDue = Number((deliveriesResult[0]?.totalDeliveryKhataDue || 0).toFixed(2));

  // 7. Processing Batches (Dahi / Value-add production)
  const processingBatches = await ProcessingBatch.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['Failed', 'FAILED'] },
  }).lean();

  let processingMilkUsed = 0;
  processingBatches.forEach((batch) => {
    const milkUsed = Number(batch.milkUsedLiters) || 0;
    processingMilkUsed += milkUsed;

    // Attribute output produced to product stats
    const productNameLower = (batch.product || '').toLowerCase().trim();
    for (const [, stats] of productStats.entries()) {
      if (
        stats.name.toLowerCase().trim() === productNameLower ||
        stats.name.toLowerCase().includes(productNameLower) ||
        productNameLower.includes(stats.name.toLowerCase())
      ) {
        stats.produced += Number(batch.outputQuantity) || 0;
        break;
      }
    }
  });
  processingMilkUsed = Number(processingMilkUsed.toFixed(2));

  // 8. Spoilage & Wastage (WastageLog)
  const wastageLogs = await WastageLog.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  let milkWastage = 0;
  wastageLogs.forEach((w) => {
    const qty = Number(w.quantity) || 0;
    if (w.type === 'MILK' || w.unit === 'LITER') {
      milkWastage += qty;
    }

    if (w.productId && productStats.has(w.productId.toString())) {
      productStats.get(w.productId.toString()).wasted += qty;
    } else if (w.productName) {
      const match = Array.from(productStats.values()).find(
        (p) => p.name.toLowerCase().trim() === w.productName.toLowerCase().trim()
      );
      if (match) {
        match.wasted += qty;
      }
    }
  });
  milkWastage = Number(milkWastage.toFixed(2));

  // 9. Khata Customer Recoveries (Cash & Online)
  const khataEntries = await KhataEntry.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    transactionType: 'CREDIT',
    paymentMethod: { $nin: ['ADJUSTMENT', null] },
  }).lean();

  let khataRecoveredCash = 0;
  let khataRecoveredOnline = 0;
  khataEntries.forEach((entry) => {
    const credit = Number(entry.creditAmount) || 0;
    if (entry.paymentMethod === 'ONLINE' || entry.paymentMethod === 'CHEQUE') {
      khataRecoveredOnline += credit;
    } else {
      khataRecoveredCash += credit;
    }
  });
  khataRecoveredCash = Number(khataRecoveredCash.toFixed(2));
  khataRecoveredOnline = Number(khataRecoveredOnline.toFixed(2));

  // 10. Operational Expenses by Category (Wages, Feed, Fuel, Misc)
  const expenses = await Expense.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  // Check fuel logs for vehicle costs
  const fuelLogs = await VehicleFuelLog.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  let wagesExpense = 0;
  let feedExpense = 0;
  let fuelExpense = 0;
  let miscExpense = 0;
  let expenseCashTotal = 0;
  let expenseNonCashTotal = 0;

  expenses.forEach((exp) => {
    const amt = Number(exp.amountRupees) || 0;
    const cat = (exp.category || '').toUpperCase();
    const isCash = exp.paymentMethod === 'CASH';

    if (isCash) expenseCashTotal += amt;
    else expenseNonCashTotal += amt;

    if (cat === 'SALARIES') {
      wagesExpense += amt;
    } else if (cat === 'FEED') {
      feedExpense += amt;
    } else if (cat === 'TRANSPORT') {
      fuelExpense += amt;
    } else {
      miscExpense += amt;
    }
  });

  // Add fuel logs if not already captured in Expense collection
  fuelLogs.forEach((f) => {
    const cost = Number(f.costRupees) || 0;
    const hasMatchingExpense = expenses.some(
      (e) => e.category === 'TRANSPORT' && Math.abs(e.amountRupees - cost) < 1
    );
    if (!hasMatchingExpense) {
      fuelExpense += cost;
      expenseCashTotal += cost;
    }
  });

  const totalExpenses = Number((expenseCashTotal + expenseNonCashTotal).toFixed(2));

  // 11. Milk Mass Balance Calculations
  const totalAvailableMilk = Number((openingMilkStock + farmProduction + supplierInflow).toFixed(2));
  const totalMilkOut = Number(
    (counterSalesMilk + doorstepSalesMilk + processingMilkUsed + milkWastage).toFixed(2)
  );
  const expectedClosingMilk = Number((totalAvailableMilk - totalMilkOut).toFixed(2));
  const isMilkNegative = expectedClosingMilk < 0;

  // 12. Financial Cash & Profit Calculations
  const totalCollected = Number(
    (counterCash + counterOnline + deliveryCodCash + deliveryOnline + khataRecoveredCash + khataRecoveredOnline).toFixed(2)
  );
  const totalCreditGiven = Number((creditGivenFromOrders + deliveryKhataDue).toFixed(2));

  const totalCashIn = Number((counterCash + deliveryCodCash + khataRecoveredCash).toFixed(2));
  const totalCashOut = Number((expenseCashTotal + supplierCashPaid).toFixed(2));
  const expectedInDrawer = Number((openingCash + totalCashIn - totalCashOut).toFixed(2));

  // Product table assembly
  const productsArray = Array.from(productStats.values()).map((p) => {
    const key = p.productId;
    const prevStock = previousProductStocks.has(key)
      ? previousProductStocks.get(key)
      : previousProductStocks.get(p.name.toLowerCase().trim()) || 0;

    // For Raw Milk product, align with overall milk flow
    const isMilkProduct = p.unit === 'LITER' && String(p.category).toLowerCase().includes('milk');
    const openingStock = isMilkProduct ? openingMilkStock : prevStock;
    const produced = isMilkProduct ? (farmProduction + supplierInflow) : p.produced;
    const sold = isMilkProduct ? (counterSalesMilk + doorstepSalesMilk) : p.sold;
    const wasted = isMilkProduct ? milkWastage : p.wasted;
    const expectedClosing = Number((openingStock + produced - sold - wasted).toFixed(2));

    return {
      productId: p.productId,
      name: p.name,
      unit: p.unit,
      category: p.category,
      openingStock: Number(openingStock.toFixed(2)),
      produced: Number(produced.toFixed(2)),
      sold: Number(sold.toFixed(2)),
      wasted: Number(wasted.toFixed(2)),
      expectedClosing,
      currentStock: p.currentStock || 0,
      revenue: Number(p.revenue.toFixed(2)),
      cost: Number(p.cost.toFixed(2)),
      profit: Number((p.revenue - p.cost).toFixed(2)),
    };
  });

  // Calculate COGS and estimated profit
  const estimatedCogs = productsArray.reduce((acc, p) => acc + p.cost, 0);
  const nonProductExpenses = totalExpenses; // Overheads (wages, rent, transport, misc)
  const estimatedProfit = Number((grossRevenue - estimatedCogs - nonProductExpenses).toFixed(2));

  // 13. System Warnings
  const warnings = [];
  if (isMilkNegative) {
    warnings.push(`Milk stock is negative (${expectedClosingMilk} L): total sales & usage exceed available milk.`);
  }
  if (expectedInDrawer < 0) {
    warnings.push(`Expected cash in drawer is negative (Rs. ${expectedInDrawer}): cash expenses exceed cash collections.`);
  }
  productsArray.forEach((p) => {
    if (p.expectedClosing < 0) {
      warnings.push(`${p.name}: expected closing stock is negative (${p.expectedClosing} ${p.unit}).`);
    }
  });

  return {
    date: dateStr,
    period: 'today',
    status: 'OPEN',
    closing: null,
    openingSource,
    milk: {
      openingStock: openingMilkStock,
      farmProduction,
      supplierInflow,
      totalAvailable: totalAvailableMilk,
      counterSales: counterSalesMilk,
      doorstepSales: doorstepSalesMilk,
      processingUsed: processingMilkUsed,
      wastage: milkWastage,
      totalOut: totalMilkOut,
      expectedClosing: expectedClosingMilk,
      isNegative: isMilkNegative,
    },
    collections: {
      counterCash: Number(counterCash.toFixed(2)),
      counterOnline: Number(counterOnline.toFixed(2)),
      codCash: Number(deliveryCodCash.toFixed(2)),
      khataRecoveredCash,
      khataRecoveredOnline,
      totalCollected,
    },
    creditGiven: totalCreditGiven,
    expenses: {
      items: [
        { key: 'wages', label: 'Staff Wages / Salaries', amount: Number(wagesExpense.toFixed(2)) },
        { key: 'feed', label: 'Animal Feed & Fodder', amount: Number(feedExpense.toFixed(2)) },
        { key: 'fuel', label: 'Fuel & Transportation', amount: Number(fuelExpense.toFixed(2)) },
        { key: 'misc', label: 'Maintenance & Store Misc', amount: Number(miscExpense.toFixed(2)) },
      ],
      cashTotal: Number(expenseCashTotal.toFixed(2)),
      nonCashTotal: Number(expenseNonCashTotal.toFixed(2)),
      total: totalExpenses,
    },
    cash: {
      openingCash,
      cashIn: totalCashIn,
      cashOut: totalCashOut,
      expectedInDrawer,
    },
    profit: {
      grossRevenue: Number(grossRevenue.toFixed(2)),
      estimatedCogs: Number(estimatedCogs.toFixed(2)),
      totalExpenses,
      estimatedProfit,
    },
    products: productsArray,
    warnings,
    // Backwards compatibility properties for legacy consumers
    startOfDay,
    endOfDay,
    milkBalance: {
      openingStock: openingMilkStock,
      farmYield: farmProduction,
      supplierProcurement: supplierInflow,
      posSales: counterSalesMilk,
      deliveries: doorstepSalesMilk,
      theoreticalStock: expectedClosingMilk,
    },
    financialBalance: {
      openingCash,
      posCashSales: counterCash,
      deliveryCodCash,
      supplierCashPaid,
      expensesCashPaid: expenseCashTotal,
      expectedCash: expectedInDrawer,
    },
  };
};

/**
 * Get daily closing summary for today, specific date, or a range (weekly, monthly, custom)
 */
export const getDailyClosingSummaryService = async (queryParams = {}) => {
  const { period = 'today', date, startDate, endDate } = queryParams;

  if (period === 'today' || (!period && date)) {
    const targetDateStr = date || getPktTodayString();
    const { startOfDay, endOfDay, dateStr } = getPktDayRange(targetDateStr);

    // Check if an existing confirmed closing exists
    const existingClosing = await DailyClosing.findOne({
      closingDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('closedByUserId', 'name username role')
      .populate('approvedByUserId', 'name username role')
      .populate('reopenedByUserId', 'name username role');

    if (
      existingClosing &&
      ['CLOSED', 'APPROVED', 'LOCKED', 'RECONCILED'].includes(existingClosing.status) &&
      existingClosing.summarySnapshot
    ) {
      // Return immutable saved snapshot
      const snapshot = existingClosing.summarySnapshot;
      return {
        ...snapshot,
        date: dateStr,
        period: 'today',
        status: existingClosing.status,
        closing: {
          id: existingClosing._id,
          status: existingClosing.status,
          closedAt: existingClosing.closedAt,
          closedBy: existingClosing.closedByUserId?.name || 'Authorized Staff',
          physicalMilk: existingClosing.physicalMilkDip ?? existingClosing.milkBalance?.physicalDipstick ?? 0,
          milkVariance: existingClosing.milkVariance ?? existingClosing.milkBalance?.varianceLiters ?? 0,
          physicalCash: existingClosing.physicalCash ?? existingClosing.financialBalance?.physicalCash ?? null,
          cashVariance: existingClosing.cashVariance ?? existingClosing.financialBalance?.cashVariance ?? 0,
          varianceReason: existingClosing.varianceReason || null,
          supervisorNotes: existingClosing.supervisorNotes || null,
        },
      };
    }

    // Live calculation
    const liveSummary = await calculateDaySummary(targetDateStr);
    if (existingClosing) {
      liveSummary.status = existingClosing.status;
      liveSummary.closing = {
        id: existingClosing._id,
        status: existingClosing.status,
        closedAt: existingClosing.closedAt,
        closedBy: existingClosing.closedByUserId?.name || 'Staff',
        physicalMilk: existingClosing.physicalMilkDip ?? 0,
        milkVariance: existingClosing.milkVariance ?? 0,
      };
    }
    return liveSummary;
  }

  // Multi-day range handling (weekly | monthly | custom)
  let rangeStartStr = startDate;
  let rangeEndStr = endDate || getPktTodayString();

  if (period === 'weekly') {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    rangeStartStr = getPktDayRange(sevenDaysAgo).dateStr;
    rangeEndStr = getPktDayRange(today).dateStr;
  } else if (period === 'monthly') {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    rangeStartStr = getPktDayRange(thirtyDaysAgo).dateStr;
    rangeEndStr = getPktDayRange(today).dateStr;
  }

  const { startOfRange, endOfRange, startDateStr, endDateStr } = getPktDateRange(
    rangeStartStr,
    rangeEndStr
  );

  // Generate date array for each day in range
  const daysList = [];
  const current = new Date(startOfRange);
  while (current <= endOfRange) {
    daysList.push(getPktDayRange(current).dateStr);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Fetch summaries for all days in range in parallel
  const dailySummaries = await Promise.all(
    daysList.map(async (dayStr) => {
      const { startOfDay, endOfDay } = getPktDayRange(dayStr);
      const saved = await DailyClosing.findOne({
        closingDate: { $gte: startOfDay, $lte: endOfDay },
      }).lean();

      if (saved && saved.summarySnapshot && ['CLOSED', 'APPROVED', 'LOCKED'].includes(saved.status)) {
        return saved.summarySnapshot;
      }
      return await calculateDaySummary(dayStr);
    })
  );

  // Aggregate Range Summary
  const firstDay = dailySummaries[0] || {};
  const lastDay = dailySummaries[dailySummaries.length - 1] || {};

  const rangeMilk = {
    openingStock: firstDay.milk?.openingStock || 0,
    farmProduction: dailySummaries.reduce((acc, d) => acc + (d.milk?.farmProduction || 0), 0),
    supplierInflow: dailySummaries.reduce((acc, d) => acc + (d.milk?.supplierInflow || 0), 0),
    counterSales: dailySummaries.reduce((acc, d) => acc + (d.milk?.counterSales || 0), 0),
    doorstepSales: dailySummaries.reduce((acc, d) => acc + (d.milk?.doorstepSales || 0), 0),
    processingUsed: dailySummaries.reduce((acc, d) => acc + (d.milk?.processingUsed || 0), 0),
    wastage: dailySummaries.reduce((acc, d) => acc + (d.milk?.wastage || 0), 0),
  };
  rangeMilk.totalAvailable = Number((rangeMilk.openingStock + rangeMilk.farmProduction + rangeMilk.supplierInflow).toFixed(2));
  rangeMilk.totalOut = Number(
    (rangeMilk.counterSales + rangeMilk.doorstepSales + rangeMilk.processingUsed + rangeMilk.wastage).toFixed(2)
  );
  rangeMilk.expectedClosing = Number((rangeMilk.totalAvailable - rangeMilk.totalOut).toFixed(2));
  rangeMilk.isNegative = rangeMilk.expectedClosing < 0;

  const rangeCollections = {
    counterCash: dailySummaries.reduce((acc, d) => acc + (d.collections?.counterCash || 0), 0),
    counterOnline: dailySummaries.reduce((acc, d) => acc + (d.collections?.counterOnline || 0), 0),
    codCash: dailySummaries.reduce((acc, d) => acc + (d.collections?.codCash || 0), 0),
    khataRecoveredCash: dailySummaries.reduce((acc, d) => acc + (d.collections?.khataRecoveredCash || 0), 0),
    khataRecoveredOnline: dailySummaries.reduce((acc, d) => acc + (d.collections?.khataRecoveredOnline || 0), 0),
  };
  rangeCollections.totalCollected = Number(
    (rangeCollections.counterCash + rangeCollections.counterOnline + rangeCollections.codCash + rangeCollections.khataRecoveredCash + rangeCollections.khataRecoveredOnline).toFixed(2)
  );

  const rangeExpenses = {
    items: [
      { key: 'wages', label: 'Staff Wages / Salaries', amount: dailySummaries.reduce((acc, d) => acc + (d.expenses?.items?.[0]?.amount || 0), 0) },
      { key: 'feed', label: 'Animal Feed & Fodder', amount: dailySummaries.reduce((acc, d) => acc + (d.expenses?.items?.[1]?.amount || 0), 0) },
      { key: 'fuel', label: 'Fuel & Transportation', amount: dailySummaries.reduce((acc, d) => acc + (d.expenses?.items?.[2]?.amount || 0), 0) },
      { key: 'misc', label: 'Maintenance & Store Misc', amount: dailySummaries.reduce((acc, d) => acc + (d.expenses?.items?.[3]?.amount || 0), 0) },
    ],
    cashTotal: dailySummaries.reduce((acc, d) => acc + (d.expenses?.cashTotal || 0), 0),
    nonCashTotal: dailySummaries.reduce((acc, d) => acc + (d.expenses?.nonCashTotal || 0), 0),
    total: dailySummaries.reduce((acc, d) => acc + (d.expenses?.total || 0), 0),
  };

  const rangeCash = {
    openingCash: firstDay.cash?.openingCash || 0,
    cashIn: dailySummaries.reduce((acc, d) => acc + (d.cash?.cashIn || 0), 0),
    cashOut: dailySummaries.reduce((acc, d) => acc + (d.cash?.cashOut || 0), 0),
  };
  rangeCash.expectedInDrawer = Number((rangeCash.openingCash + rangeCash.cashIn - rangeCash.cashOut).toFixed(2));

  const rangeProfit = {
    grossRevenue: dailySummaries.reduce((acc, d) => acc + (d.profit?.grossRevenue || 0), 0),
    estimatedCogs: dailySummaries.reduce((acc, d) => acc + (d.profit?.estimatedCogs || 0), 0),
    totalExpenses: rangeExpenses.total,
    estimatedProfit: Number((
      dailySummaries.reduce((acc, d) => acc + (d.profit?.grossRevenue || 0), 0) -
      dailySummaries.reduce((acc, d) => acc + (d.profit?.estimatedCogs || 0), 0) -
      rangeExpenses.total
    ).toFixed(2)),
  };

  // Product aggregation across range
  const productMap = new Map();
  dailySummaries.forEach((d) => {
    (d.products || []).forEach((p) => {
      if (!productMap.has(p.productId)) {
        productMap.set(p.productId, {
          ...p,
          openingStock: p.openingStock,
          produced: 0,
          sold: 0,
          wasted: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        });
      }
      const aggregated = productMap.get(p.productId);
      aggregated.produced += p.produced || 0;
      aggregated.sold += p.sold || 0;
      aggregated.wasted += p.wasted || 0;
      aggregated.revenue += p.revenue || 0;
      aggregated.cost += p.cost || 0;
      aggregated.profit += p.profit || 0;
      aggregated.expectedClosing = Number((aggregated.openingStock + aggregated.produced - aggregated.sold - aggregated.wasted).toFixed(2));
    });
  });

  return {
    date: `${startDateStr} to ${endDateStr}`,
    startDate: startDateStr,
    endDate: endDateStr,
    period,
    status: 'READ_ONLY_SUMMARY',
    closing: null,
    openingSource: firstDay.openingSource || { type: 'NONE' },
    milk: rangeMilk,
    collections: rangeCollections,
    creditGiven: dailySummaries.reduce((acc, d) => acc + (d.creditGiven || 0), 0),
    expenses: rangeExpenses,
    cash: rangeCash,
    profit: rangeProfit,
    products: Array.from(productMap.values()),
    daily: dailySummaries.map((d) => ({
      date: d.date,
      milkProduced: (d.milk?.farmProduction || 0) + (d.milk?.supplierInflow || 0),
      milkSold: (d.milk?.counterSales || 0) + (d.milk?.doorstepSales || 0),
      collected: d.collections?.totalCollected || 0,
      expenses: d.expenses?.total || 0,
      profit: d.profit?.estimatedProfit || 0,
    })),
    warnings: [],
  };
};

/**
 * Confirm and save Daily Closing Snapshot to MongoDB (Locks the day)
 */
export const confirmDailyClosingService = async (reqUser, payload = {}, ipAddress) => {
  const {
    date = getPktTodayString(),
    physicalMilkLiters = 0,
    physicalCash = null,
    varianceReason = '',
    notes = '',
    productPhysicalCounts = [],
  } = payload;

  const { startOfDay, endOfDay, dateStr } = getPktDayRange(date);

  // Recalculate fresh server-side data (Never trust numbers from the browser)
  const calculatedSummary = await calculateDaySummary(dateStr);

  const physicalMilkDip = Number(physicalMilkLiters);
  const expectedMilkStock = calculatedSummary.milk.expectedClosing;
  const milkVariance = Number((physicalMilkDip - expectedMilkStock).toFixed(2));

  let cashVariance = 0;
  let parsedPhysicalCash = null;
  if (physicalCash !== null && physicalCash !== undefined && physicalCash !== '') {
    parsedPhysicalCash = Number(physicalCash);
    cashVariance = Number((parsedPhysicalCash - calculatedSummary.cash.expectedInDrawer).toFixed(2));
  }

  // Require variance reason if milk variance exceeds threshold (> 2% or > 2L)
  const isHighMilkVariance = Math.abs(milkVariance) > 2 || (expectedMilkStock > 0 && Math.abs(milkVariance) / expectedMilkStock > 0.02);
  if (isHighMilkVariance && (!varianceReason || varianceReason.trim().length < 3)) {
    const err = new Error(`Significant milk variance of ${milkVariance} L detected. Please provide a valid variance reason.`);
    err.statusCode = 422;
    throw err;
  }

  // Check if closing already exists for this date
  let closing = await DailyClosing.findOne({
    closingDate: { $gte: startOfDay, $lte: endOfDay },
  });

  if (closing && ['CLOSED', 'LOCKED', 'APPROVED'].includes(closing.status)) {
    const error = new Error(`Daily closing for date '${dateStr}' is already finalized and locked (Status: ${closing.status}). Reopen first to make changes.`);
    error.statusCode = 409;
    throw error;
  }

  const beforeSnapshot = closing ? closing.toObject() : null;

  // Build product stock snapshot for tomorrow's opening
  const physicalCountsMap = new Map();
  if (Array.isArray(productPhysicalCounts)) {
    productPhysicalCounts.forEach((p) => {
      if (p.productId) physicalCountsMap.set(p.productId.toString(), Number(p.count));
      else if (p.name) physicalCountsMap.set(p.name.toLowerCase().trim(), Number(p.count));
    });
  }

  const productStockSnapshot = calculatedSummary.products.map((p) => {
    const physicalCount = physicalCountsMap.has(p.productId)
      ? physicalCountsMap.get(p.productId)
      : (physicalCountsMap.get(p.name.toLowerCase().trim()) ?? null);

    return {
      productId: p.productId,
      name: p.name,
      unit: p.unit,
      category: p.category,
      openingStock: p.openingStock,
      produced: p.produced,
      sold: p.sold,
      wasted: p.wasted,
      closingStock: physicalCount !== null ? physicalCount : p.expectedClosing,
      physicalCount,
      revenue: p.revenue,
      cost: p.cost,
      profit: p.profit,
    };
  });

  // Freeze summary snapshot
  const frozenSummary = {
    ...calculatedSummary,
    status: 'CLOSED',
    closing: {
      closedAt: new Date().toISOString(),
      closedBy: reqUser.name || reqUser.username || 'Authorized Staff',
      physicalMilk: physicalMilkDip,
      milkVariance,
      physicalCash: parsedPhysicalCash,
      cashVariance,
      varianceReason,
    },
    physicalStock: {
      physicalClosingStock: physicalMilkDip,
      variance: milkVariance,
      varianceReason,
      isReconciled: true,
    },
    productStockSnapshot,
  };

  if (!closing) {
    closing = new DailyClosing({
      closingDate: startOfDay,
      closedByUserId: reqUser.id || reqUser._id,
      closedAt: new Date(),
      status: 'CLOSED',
      milkBalance: {
        ...calculatedSummary.milkBalance,
        physicalDipstick: physicalMilkDip,
        varianceLiters: milkVariance,
      },
      financialBalance: {
        ...calculatedSummary.financialBalance,
        physicalCash: parsedPhysicalCash,
        cashVariance,
      },
      summarySnapshot: frozenSummary,
      productStockSnapshot,
      physicalMilkDip,
      milkVariance,
      physicalCash: parsedPhysicalCash,
      cashVariance,
      varianceReason: varianceReason || null,
      supervisorNotes: notes || null,
    });
  } else {
    closing.status = 'CLOSED';
    closing.closedByUserId = reqUser.id || reqUser._id;
    closing.closedAt = new Date();
    closing.milkBalance = {
      ...calculatedSummary.milkBalance,
      physicalDipstick: physicalMilkDip,
      varianceLiters: milkVariance,
    };
    closing.financialBalance = {
      ...calculatedSummary.financialBalance,
      physicalCash: parsedPhysicalCash,
      cashVariance,
    };
    closing.summarySnapshot = frozenSummary;
    closing.productStockSnapshot = productStockSnapshot;
    closing.physicalMilkDip = physicalMilkDip;
    closing.milkVariance = milkVariance;
    closing.physicalCash = parsedPhysicalCash;
    closing.cashVariance = cashVariance;
    closing.varianceReason = varianceReason || null;
    closing.supervisorNotes = notes || null;
  }

  await closing.save();

  // Audit Log
  await createAuditLog({
    reqUser,
    action: 'DAILY_CLOSING_CONFIRM',
    resourceId: closing._id,
    beforeSnapshot,
    afterSnapshot: closing.toObject(),
    details: `Daily closing confirmed for date ${dateStr}. Milk Variance: ${milkVariance}L, Cash Variance: Rs.${cashVariance}`,
    ipAddress,
  });

  return {
    closing,
    summarySnapshot: frozenSummary,
  };
};

/**
 * Get light history of daily closings
 */
export const getDailyClosingHistoryService = async (limit = 30) => {
  const closings = await DailyClosing.find({})
    .populate('closedByUserId', 'name username')
    .sort({ closingDate: -1 })
    .limit(Number(limit) || 30)
    .lean();

  return closings.map((c) => ({
    id: c._id,
    date: getPktDayRange(c.closingDate).dateStr,
    status: c.status,
    closedAt: c.closedAt,
    closedBy: c.closedByUserId?.name || 'Staff',
    expectedMilk: c.summarySnapshot?.milk?.expectedClosing ?? c.milkBalance?.theoreticalStock ?? 0,
    physicalMilk: c.physicalMilkDip ?? c.milkBalance?.physicalDipstick ?? 0,
    milkVariance: c.milkVariance ?? c.milkBalance?.varianceLiters ?? 0,
    totalCollected: c.summarySnapshot?.collections?.totalCollected ?? 0,
    estimatedProfit: c.summarySnapshot?.profit?.estimatedProfit ?? 0,
    expectedCash: c.summarySnapshot?.cash?.expectedInDrawer ?? c.financialBalance?.expectedCash ?? 0,
    physicalCash: c.physicalCash ?? c.financialBalance?.physicalCash ?? null,
  }));
};

/**
 * Wastage Log Management Services
 */
export const recordWastageService = async (reqUser, payload = {}, ipAddress) => {
  const { date = getPktTodayString(), type = 'MILK', productId, productName, quantity, unit = 'LITER', reason = 'SPOILED', note = '' } = payload;
  const { startOfDay } = getPktDayRange(date);

  let finalProductName = productName;
  if (productId && !finalProductName) {
    const p = await Product.findById(productId);
    if (p) finalProductName = p.name;
  }

  const wastage = await WastageLog.create({
    date: startOfDay,
    type: type.toUpperCase(),
    productId: productId || null,
    productName: finalProductName || (type === 'MILK' ? 'Raw Milk' : 'Dairy Product'),
    quantity: Number(quantity),
    unit: unit.toUpperCase(),
    reason: reason.toUpperCase(),
    note: (note || '').trim(),
    recordedBy: reqUser.id || reqUser._id,
  });

  // Deduct from Product stock if it's a tracked product
  if (productId) {
    try {
      await Product.findByIdAndUpdate(productId, {
        $inc: { currentStock: -Number(quantity) },
      });
    } catch (_) {}
  }

  await createAuditLog({
    reqUser,
    action: 'WASTAGE_LOG_CREATE',
    resourceId: wastage._id,
    beforeSnapshot: null,
    afterSnapshot: wastage.toObject(),
    details: `Recorded wastage: ${quantity} ${unit} of ${finalProductName} (${reason})`,
    ipAddress,
  });

  return wastage;
};

export const getWastageLogsService = async (queryParams = {}) => {
  const { date, startDate, endDate, type } = queryParams;
  const filter = {};

  if (date) {
    const { startOfDay, endOfDay } = getPktDayRange(date);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  } else if (startDate || endDate) {
    const { startOfRange, endOfRange } = getPktDateRange(startDate, endDate);
    filter.date = { $gte: startOfRange, $lte: endOfRange };
  }

  if (type) {
    filter.type = type.toUpperCase();
  }

  const logs = await WastageLog.find(filter)
    .populate('recordedBy', 'name username')
    .sort({ date: -1 })
    .lean();

  return logs;
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY SERVICE HANDLERS (Ensuring existing routes / controllers continue to work)
// ═══════════════════════════════════════════════════════════════════════════

export const calculateTheoreticalBalancesForDate = async (targetDateStr, manualOpeningMilk = null, manualOpeningCash = null) => {
  return await calculateDaySummary(targetDateStr, manualOpeningMilk, manualOpeningCash);
};

export const createDailyClosingService = async (reqUser, payload = {}, ipAddress) => {
  const res = await confirmDailyClosingService(reqUser, payload, ipAddress);
  return res.closing;
};

export const getDailyClosingsService = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (queryParams.status) {
    filter.status = queryParams.status.toUpperCase();
  }
  if (queryParams.startDate || queryParams.endDate) {
    const { startOfRange, endOfRange } = getPktDateRange(queryParams.startDate, queryParams.endDate);
    filter.closingDate = { $gte: startOfRange, $lte: endOfRange };
  }

  const [closings, total] = await Promise.all([
    DailyClosing.find(filter)
      .populate('closedByUserId', 'name username role')
      .populate('approvedByUserId', 'name username role')
      .populate('reopenedByUserId', 'name username role')
      .sort({ closingDate: -1 })
      .skip(skip)
      .limit(limit),
    DailyClosing.countDocuments(filter),
  ]);

  return {
    closings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDailyClosingByIdService = async (id) => {
  const closing = await DailyClosing.findById(id)
    .populate('closedByUserId', 'name username role')
    .populate('approvedByUserId', 'name username role')
    .populate('reopenedByUserId', 'name username role');

  if (!closing) {
    const error = new Error(`Daily closing record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  return closing;
};

export const getDailyClosingByDateService = async (dateStr) => {
  return await getDailyClosingSummaryService({ date: dateStr });
};

export const reconcileDailyClosingService = async (id, reqUser, payload = {}, ipAddress) => {
  const closing = await DailyClosing.findById(id);
  if (!closing) {
    const error = new Error(`Daily closing record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (['APPROVED', 'LOCKED'].includes(closing.status)) {
    const error = new Error(`Cannot reconcile daily closing in '${closing.status}' status. Reopen first if modifications are required.`);
    error.statusCode = 400;
    throw error;
  }

  const dateStr = getPktDayRange(closing.closingDate).dateStr;
  const calculated = await calculateDaySummary(dateStr);

  const physicalMilkDip = Number(payload.physicalMilkDipLiters || payload.physicalMilkLiters || 0);
  const physicalCash = payload.physicalCashCounted !== undefined && payload.physicalCashCounted !== null && payload.physicalCashCounted !== ''
    ? Number(payload.physicalCashCounted)
    : null;

  const milkVarianceLiters = Number((physicalMilkDip - calculated.milk.expectedClosing).toFixed(2));
  const cashVarianceRupees = physicalCash !== null
    ? Number((physicalCash - calculated.cash.expectedInDrawer).toFixed(2))
    : 0;

  const beforeSnapshot = closing.toObject();

  closing.milkBalance = {
    ...calculated.milkBalance,
    physicalDipstick: physicalMilkDip,
    varianceLiters: milkVarianceLiters,
  };

  closing.financialBalance = {
    ...calculated.financialBalance,
    physicalCash,
    cashVariance: cashVarianceRupees,
  };

  closing.physicalMilkDip = physicalMilkDip;
  closing.milkVariance = milkVarianceLiters;
  closing.physicalCash = physicalCash;
  closing.cashVariance = cashVarianceRupees;
  closing.status = 'RECONCILED';
  if (payload?.supervisorNotes) {
    closing.supervisorNotes = payload.supervisorNotes;
  }
  if (payload?.varianceReason) {
    closing.varianceReason = payload.varianceReason;
  }

  await closing.save();

  await createAuditLog({
    reqUser,
    action: 'DAILY_CLOSING_RECONCILE',
    resourceId: closing._id,
    beforeSnapshot,
    afterSnapshot: closing.toObject(),
    details: `Reconciled closing. Milk Variance: ${milkVarianceLiters}L, Cash Variance: Rs.${cashVarianceRupees}`,
    ipAddress,
  });

  return closing;
};

export const approveDailyClosingService = async (id, reqUser, payload = {}, ipAddress) => {
  const closing = await DailyClosing.findById(id);
  if (!closing) {
    const error = new Error(`Daily closing record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = closing.toObject();

  closing.status = 'APPROVED';
  closing.approvedByUserId = reqUser.id || reqUser._id;
  closing.approvedAt = new Date();
  if (payload?.supervisorNotes) {
    closing.supervisorNotes = payload.supervisorNotes;
  }

  await closing.save();

  await createAuditLog({
    reqUser,
    action: 'DAILY_CLOSING_APPROVE',
    resourceId: closing._id,
    beforeSnapshot,
    afterSnapshot: closing.toObject(),
    details: `Daily closing approved by ${reqUser.role} user (${reqUser.id || reqUser._id})`,
    ipAddress,
  });

  return closing;
};

export const reopenDailyClosingService = async (id, reqUser, payload = {}, ipAddress) => {
  const closing = await DailyClosing.findById(id);
  if (!closing) {
    const error = new Error(`Daily closing record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (closing.status === 'REOPENED') {
    const error = new Error(`Daily closing is already open in '${closing.status}' status.`);
    error.statusCode = 400;
    throw error;
  }

  const beforeSnapshot = closing.toObject();

  closing.status = 'REOPENED';
  closing.reopenedByUserId = reqUser.id || reqUser._id;
  closing.reopenedAt = new Date();
  closing.reopenReason = payload?.reopenReason || 'Admin reopened day closing for revisions';
  // Clear snapshot so live calculation takes effect again
  closing.summarySnapshot = null;

  await closing.save();

  await createAuditLog({
    reqUser,
    action: 'DAILY_CLOSING_REOPEN',
    resourceId: closing._id,
    beforeSnapshot,
    afterSnapshot: closing.toObject(),
    details: `Closing reopened by Admin (${reqUser.id || reqUser._id}). Reason: ${closing.reopenReason}`,
    ipAddress,
  });

  return closing;
};

export const getDailyClosingReportService = async (id) => {
  const closing = await DailyClosing.findById(id)
    .populate('closedByUserId', 'name username role')
    .populate('approvedByUserId', 'name username role')
    .populate('reopenedByUserId', 'name username role');

  if (!closing) {
    const error = new Error(`Daily closing record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const { startOfDay, endOfDay } = getPktDayRange(closing.closingDate);

  const [yieldLogs, procurementLogs, posOrders, deliveryRuns, expenseLogs, wastageLogs] = await Promise.all([
    MilkingYieldLog.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('shift yieldLiters'),
    MilkProcurement.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'ACCEPTED' }).select('batchNumber quantityLiters ratePerLiter totalAmount amountPaid'),
    Order.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('receiptNumber paymentMethod grandTotal amountReceived changeGiven items'),
    DeliveryRun.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'DELIVERED' }).select('runCode route qtyLiters paymentMode codAmountToCollect'),
    Expense.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('voucherNumber category title amountRupees paymentMethod'),
    WastageLog.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('type productName quantity unit reason'),
  ]);

  return {
    closing,
    reportGeneratedAt: new Date().toISOString(),
    breakdown: {
      yieldCount: yieldLogs.length,
      yieldLogs,
      procurementCount: procurementLogs.length,
      procurementLogs,
      posOrdersCount: posOrders.length,
      posOrdersSummary: {
        totalOrders: posOrders.length,
        cashOrders: posOrders.filter((o) => o.paymentMethod === 'CASH').length,
        khataOrders: posOrders.filter((o) => o.paymentMethod === 'KHATA').length,
        onlineOrders: posOrders.filter((o) => o.paymentMethod === 'ONLINE').length,
        splitOrders: posOrders.filter((o) => o.paymentMethod === 'SPLIT').length,
      },
      deliveriesCount: deliveryRuns.length,
      deliveryRuns,
      expensesCount: expenseLogs.length,
      expenseLogs,
      wastageCount: wastageLogs.length,
      wastageLogs,
    },
  };
};
