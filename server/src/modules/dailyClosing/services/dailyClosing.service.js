import DailyClosing from '../../../models/DailyClosing.model.js';
import MilkingYieldLog from '../../../models/MilkingYieldLog.model.js';
import MilkProcurement from '../../../models/MilkProcurement.model.js';
import Order from '../../../models/Order.model.js';
import DeliveryRun from '../../../models/DeliveryRun.model.js';
import Expense from '../../../models/Expense.model.js';
import User from '../../../models/User.model.js';
import AuditLog from '../../../models/AuditLog.model.js';

const createAuditLog = async ({ reqUser, action, resourceId, beforeSnapshot, afterSnapshot, details, ipAddress = '127.0.0.1' }) => {
  try {
    const user = await User.findById(reqUser.id).select('username role');
    await AuditLog.create({
      userId: reqUser.id,
      username: user ? user.username : 'system',
      userRole: reqUser.role || 'ADMIN',
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

export const calculateTheoreticalBalancesForDate = async (targetDateStr, manualOpeningMilk = null, manualOpeningCash = null) => {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Fetch Previous Day's Closing for Opening Balances
  let openingMilkStock = manualOpeningMilk !== null ? Number(manualOpeningMilk) : 0;
  let openingCash = manualOpeningCash !== null ? Number(manualOpeningCash) : 0;

  if (manualOpeningMilk === null || manualOpeningCash === null) {
    const previousClosing = await DailyClosing.findOne({
      closingDate: { $lt: startOfDay },
      status: { $in: ['APPROVED', 'CLOSED', 'RECONCILED', 'LOCKED'] },
    }).sort({ closingDate: -1 });

    if (previousClosing) {
      if (manualOpeningMilk === null) {
        openingMilkStock = previousClosing.milkBalance?.physicalDipstick ?? previousClosing.milkBalance?.theoreticalStock ?? 0;
      }
      if (manualOpeningCash === null) {
        openingCash = previousClosing.financialBalance?.physicalCash ?? previousClosing.financialBalance?.expectedCash ?? 0;
      }
    }
  }

  // 2. Farm Milk Production Yield (MilkingYieldLog)
  const yieldResult = await MilkingYieldLog.aggregate([
    { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: null, totalYield: { $sum: '$yieldLiters' } } },
  ]);
  const farmYield = yieldResult[0]?.totalYield || 0;

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
  const supplierProcurement = procurementResult[0]?.totalProcured || 0;
  const supplierCashPaid = procurementResult[0]?.totalCashPaid || 0;

  // 4. POS Counter Sales (Order)
  const orders = await Order.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  let posMilkSales = 0;
  let posCashSales = 0;

  orders.forEach((order) => {
    // Calculate cash portion
    if (order.paymentMethod === 'CASH') {
      const netCash = (order.amountReceived || 0) - (order.changeGiven || 0);
      posCashSales += netCash > 0 ? netCash : order.grandTotal || 0;
    } else if (order.paymentMethod === 'SPLIT' && order.items?.cashPaid) {
      posCashSales += Number(order.items.cashPaid) || 0;
    }

    // Calculate milk item liters
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const itemCategory = (item.category || item.productCategory || '').toUpperCase();
        const itemName = (item.name || item.productName || '').toLowerCase();
        if (itemCategory.includes('MILK') || itemName.includes('milk') || itemName.includes('doodh')) {
          posMilkSales += Number(item.quantity) || 0;
        }
      });
    }
  });

  // 5. Deliveries Dispatch (DeliveryRun)
  const deliveriesResult = await DeliveryRun.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'DELIVERED',
      },
    },
    {
      $group: {
        _id: null,
        totalDeliveredMilk: { $sum: '$qtyLiters' },
        totalCodCash: {
          $sum: {
            $cond: [{ $eq: ['$paymentMode', 'CASH'] }, '$codAmountToCollect', 0],
          },
        },
      },
    },
  ]);
  const deliveriesMilk = deliveriesResult[0]?.totalDeliveredMilk || 0;
  const deliveryCodCash = deliveriesResult[0]?.totalCodCash || 0;

  // 6. Cash Expenses (Expense)
  const expenseResult = await Expense.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        paymentMethod: 'CASH',
      },
    },
    { $group: { _id: null, totalCashExpenses: { $sum: '$amountRupees' } } },
  ]);
  const expensesCashPaid = expenseResult[0]?.totalCashExpenses || 0;

  // 7. Calculate Summaries
  const theoreticalStock = openingMilkStock + farmYield + supplierProcurement - posMilkSales - deliveriesMilk;
  const expectedCash = openingCash + posCashSales + deliveryCodCash - supplierCashPaid - expensesCashPaid;

  return {
    startOfDay,
    endOfDay,
    milkBalance: {
      openingStock: openingMilkStock,
      farmYield,
      supplierProcurement,
      posSales: posMilkSales,
      deliveries: deliveriesMilk,
      theoreticalStock: Math.max(0, Number(theoreticalStock.toFixed(2))),
    },
    financialBalance: {
      openingCash,
      posCashSales,
      deliveryCodCash,
      supplierCashPaid,
      expensesCashPaid,
      expectedCash: Number(expectedCash.toFixed(2)),
    },
  };
};

export const createDailyClosingService = async (reqUser, payload = {}, ipAddress) => {
  const targetDate = payload?.closingDate ? new Date(payload.closingDate) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Check if closing record already exists for this date
  const existingClosing = await DailyClosing.findOne({
    closingDate: { $gte: startOfDay, $lte: endOfDay },
  });

  if (existingClosing) {
    const error = new Error(`Daily closing draft already exists for date '${startOfDay.toISOString().split('T')[0]}' with status '${existingClosing.status}'`);
    error.statusCode = 409;
    throw error;
  }

  const { milkBalance, financialBalance } = await calculateTheoreticalBalancesForDate(
    targetDate,
    payload?.openingMilkStock ?? null,
    payload?.openingCash ?? null
  );

  const newClosing = await DailyClosing.create({
    closingDate: startOfDay,
    closedByUserId: reqUser.id,
    closedAt: new Date(),
    status: 'DRAFT',
    milkBalance: {
      ...milkBalance,
      physicalDipstick: null,
      varianceLiters: 0,
    },
    financialBalance: {
      ...financialBalance,
      physicalCash: null,
      cashVariance: 0,
    },
    supervisorNotes: payload.supervisorNotes || null,
  });

  await createAuditLog({
    reqUser,
    action: 'DAILY_CLOSING_CREATE_DRAFT',
    resourceId: newClosing._id,
    beforeSnapshot: null,
    afterSnapshot: newClosing.toObject(),
    details: `Daily closing draft initiated for date ${startOfDay.toISOString().split('T')[0]}`,
    ipAddress,
  });

  return newClosing;
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
    filter.closingDate = {};
    if (queryParams.startDate) {
      const s = new Date(queryParams.startDate);
      s.setHours(0, 0, 0, 0);
      filter.closingDate.$gte = s;
    }
    if (queryParams.endDate) {
      const e = new Date(queryParams.endDate);
      e.setHours(23, 59, 59, 999);
      filter.closingDate.$lte = e;
    }
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
  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) {
    const error = new Error(`Invalid date format '${dateStr}'. Please use YYYY-MM-DD format.`);
    error.statusCode = 400;
    throw error;
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let closing = await DailyClosing.findOne({
    closingDate: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate('closedByUserId', 'name username role')
    .populate('approvedByUserId', 'name username role')
    .populate('reopenedByUserId', 'name username role');

  if (!closing) {
    // If not found in DB, return real-time live preview draft calculations
    const liveCalculations = await calculateTheoreticalBalancesForDate(dateStr);
    return {
      isLivePreview: true,
      closingDate: startOfDay,
      status: 'UNSAVED_DRAFT',
      ...liveCalculations,
    };
  }

  return closing;
};

export const reconcileDailyClosingService = async (id, reqUser, payload = {}, ipAddress) => {
  const closing = await DailyClosing.findById(id);
  if (!closing) {
    const error = new Error(`Daily closing record with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (['APPROVED', 'LOCKED', 'CLOSED'].includes(closing.status)) {
    const error = new Error(`Cannot reconcile daily closing in '${closing.status}' status. Reopen first if modifications are required.`);
    error.statusCode = 400;
    throw error;
  }

  const beforeSnapshot = closing.toObject();

  // Recalculate theoretical to catch late entries before reconciling
  const { milkBalance, financialBalance } = await calculateTheoreticalBalancesForDate(
    closing.closingDate,
    closing.milkBalance?.openingStock ?? null,
    closing.financialBalance?.openingCash ?? null
  );

  const physicalMilkDip = Number(payload.physicalMilkDipLiters);
  const physicalCash = Number(payload.physicalCashCounted);

  const milkVarianceLiters = Number((physicalMilkDip - milkBalance.theoreticalStock).toFixed(2));
  const cashVarianceRupees = Number((physicalCash - financialBalance.expectedCash).toFixed(2));

  closing.milkBalance = {
    ...milkBalance,
    physicalDipstick: physicalMilkDip,
    varianceLiters: milkVarianceLiters,
  };

  closing.financialBalance = {
    ...financialBalance,
    physicalCash,
    cashVariance: cashVarianceRupees,
  };

  closing.status = 'RECONCILED';
  if (payload?.supervisorNotes) {
    closing.supervisorNotes = payload.supervisorNotes;
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

  if (closing.status === 'APPROVED' || closing.status === 'CLOSED') {
    const error = new Error(`Daily closing is already in '${closing.status}' state.`);
    error.statusCode = 400;
    throw error;
  }

  const beforeSnapshot = closing.toObject();

  closing.status = 'APPROVED';
  closing.approvedByUserId = reqUser.id;
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
    details: `Daily closing approved by ${reqUser.role} user (${reqUser.id})`,
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

  if (closing.status === 'DRAFT' || closing.status === 'REOPENED') {
    const error = new Error(`Daily closing is already open in '${closing.status}' status.`);
    error.statusCode = 400;
    throw error;
  }

  const beforeSnapshot = closing.toObject();

  closing.status = 'REOPENED';
  closing.reopenedByUserId = reqUser.id;
  closing.reopenedAt = new Date();
  closing.reopenReason = payload?.reopenReason;

  await closing.save();

  await createAuditLog({
    reqUser,
    action: 'DAILY_CLOSING_REOPEN',
    resourceId: closing._id,
    beforeSnapshot,
    afterSnapshot: closing.toObject(),
    details: `Closing reopened by Admin (${reqUser.id}). Reason: ${payload.reopenReason}`,
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

  const startOfDay = new Date(closing.closingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(closing.closingDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch breakdown logs for complete report
  const [yieldLogs, procurementLogs, posOrders, deliveryRuns, expenseLogs] = await Promise.all([
    MilkingYieldLog.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('shift yieldLiters'),
    MilkProcurement.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'ACCEPTED' }).select('batchNumber quantityLiters ratePerLiter totalAmount amountPaid'),
    Order.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('receiptNumber paymentMethod grandTotal amountReceived changeGiven'),
    DeliveryRun.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'DELIVERED' }).select('runCode route qtyLiters paymentMode codAmountToCollect'),
    Expense.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('voucherNumber category title amountRupees paymentMethod'),
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
      },
      deliveriesCount: deliveryRuns.length,
      deliveryRuns,
      expensesCount: expenseLogs.length,
      expenseLogs,
    },
  };
};
