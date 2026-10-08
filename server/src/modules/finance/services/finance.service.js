import mongoose from 'mongoose';
import KhataEntry from '../../../models/KhataEntry.model.js';
import Customer from '../../../models/Customer.model.js';
import Expense from '../../../models/Expense.model.js';
import User from '../../../models/User.model.js';
import SalaryPayment from '../../../models/SalaryPayment.model.js';
import Staff from '../../../models/Staff.model.js';
import {
  processBillAgainstAdvance,
  processPaymentAgainstKhata,
  recalculateCustomerStatementChronological,
} from '../../../utils/khataAdvanceHelper.js';


const generateKhataVoucher = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KHT-${dateStr}-${randomSuffix}`;
};


const generateExpenseVoucher = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `EXP-${dateStr}-${randomSuffix}`;
};


export const addKhataEntryService = async (data, userId) => {
  try {
    const {
      customerId,
      transactionType,
      amount,
      debitAmount,
      creditAmount,
      description,
      paymentMethod,
      referenceTransactionId,
      date,
    } = data;

    const txType = (transactionType || 'CREDIT').toUpperCase();
    const entryAmount = Number(amount ?? (txType === 'DEBIT' ? debitAmount : creditAmount)) || 0;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    if (String(customer.status || '').toUpperCase() !== 'ACTIVE') {
      const error = new Error(`Cannot post khata entry. Customer account status is '${customer.status}'`);
      error.statusCode = 400;
      throw error;
    }

    let advanceUsed = 0;
    let khataAmount = 0;
    let advanceReceived = 0;
    let advanceBalanceAfter = customer.advanceBalance || 0;
    let newKhataBalance = customer.khataBalance || customer.currentBalance || 0;

    if (txType === 'DEBIT') {
      const billRes = processBillAgainstAdvance(
        entryAmount,
        customer.advanceBalance || 0,
        customer.khataBalance || 0
      );
      advanceUsed = billRes.advanceUsed;
      khataAmount = billRes.khataAmount;
      advanceBalanceAfter = billRes.advanceBalanceAfter;
      newKhataBalance = billRes.newKhataBalance;

      if (customer.creditLimit > 0 && newKhataBalance > customer.creditLimit) {
        const error = new Error(
          `Credit limit exceeded. Current dues (${customer.khataBalance || 0} PKR) + Khata Portion (${khataAmount} PKR) exceeds limit of ${customer.creditLimit} PKR`
        );
        error.statusCode = 400;
        throw error;
      }

      customer.advanceBalance = advanceBalanceAfter;
      customer.khataBalance = newKhataBalance;
      customer.currentBalance = newKhataBalance;
    } else if (txType === 'CREDIT') {
      const isExplicitAdvance =
        /advance/i.test(description || '') ||
        /advance/i.test(paymentMethod || '') ||
        /advance/i.test(data.fulfillmentType || '');

      const payRes = processPaymentAgainstKhata(
        entryAmount,
        customer.khataBalance || customer.currentBalance || 0,
        customer.advanceBalance || 0,
        isExplicitAdvance
      );
      advanceReceived = payRes.surplusAdvance;
      advanceBalanceAfter = payRes.newAdvanceBalance;
      newKhataBalance = payRes.newKhataBalance;

      customer.advanceBalance = advanceBalanceAfter;
      customer.khataBalance = newKhataBalance;
      customer.currentBalance = newKhataBalance;
    }

    const voucherNumber = generateKhataVoucher();
    const entry = await KhataEntry.create({
      customerId: customer._id,
      date: date ? new Date(date) : new Date(),
      voucherNumber,
      transactionType: txType,
      description: (description || '').trim(),
      debitAmount: txType === 'DEBIT' ? entryAmount : 0,
      creditAmount: txType === 'CREDIT' ? entryAmount : 0,
      advanceUsed,
      khataAmount,
      advanceBalanceAfter,
      advanceReceived,
      runningBalance: newKhataBalance,
      paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : (txType === 'CREDIT' ? 'CASH' : null),
      referenceTransactionId: referenceTransactionId || null,
      items: Array.isArray(data.items) ? data.items : [],
      orderTotal: Number(data.orderTotal ?? (txType === 'DEBIT' ? entryAmount : 0)),
      paidAmount: Number(data.paidAmount ?? (txType === 'DEBIT' ? advanceUsed : entryAmount)),
      remainingAmount: Number(data.remainingAmount ?? (txType === 'DEBIT' ? khataAmount : 0)),
      fulfillmentType: data.fulfillmentType || (advanceUsed > 0 && khataAmount === 0 ? 'Advance Deduction' : null),
      riderName: data.riderName || null,
      deliveryAddress: data.deliveryAddress || null,
      cashierId: userId,
    });

    await customer.save();

    return {
      entry,
      customer: {
        id: customer._id,
        name: customer.name,
        code: customer.code,
        advanceBalance: customer.advanceBalance,
        khataBalance: customer.khataBalance,
        currentBalance: customer.currentBalance,
        creditLimit: customer.creditLimit,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getCustomerStatementService = async (customerId, queryParams) => {
  const { startDate, endDate, page = 1, limit = 100 } = queryParams;

  let customer = null;
  if (/^[0-9a-fA-F]{24}$/.test(String(customerId))) {
    customer = await Customer.findById(customerId);
  }
  if (!customer) {
    customer = await Customer.findOne({ $or: [{ code: customerId }, { phone: customerId }, { name: customerId }] });
  }

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch all transactions for this customer to ensure chronological accuracy
  let allEntries = await KhataEntry.find({ customerId: customer._id })
    .populate('cashierId', 'name username role')
    .lean();

  const openingBal = Number(customer?.openingBalance || customer?.advanceBalance || customer?.currentBalance || customer?.khataBalance || 0);
  const hasOpeningEntry = allEntries.some(
    (e) => e.isOpening || e.type === 'OPENING' || /opening/i.test(e.description || '') || /^KV-OP-/i.test(e.voucherNumber || '')
  );

  if (!hasOpeningEntry && openingBal > 0) {
    const isAdvance =
      Number(customer.advanceBalance) > 0 ||
      String(customer.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
      customer.openingPaymentMethod === 'CASH' ||
      customer.openingPaymentMethod === 'ONLINE';

    allEntries.unshift({
      voucherNumber: `KV-OP-${customer.code || customer._id}`,
      date: customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: isAdvance ? 'Customer Account Initial Advance Deposit' : 'Customer Account Opening Balance',
      transactionType: isAdvance ? 'CREDIT' : 'DEBIT',
      debitAmount: isAdvance ? 0 : openingBal,
      creditAmount: isAdvance ? openingBal : 0,
      debit: isAdvance ? 0 : openingBal,
      credit: isAdvance ? openingBal : 0,
      advanceReceived: isAdvance ? openingBal : 0,
      advanceBalanceAfter: isAdvance ? openingBal : 0,
      runningBalance: isAdvance ? 0 : openingBal,
      isOpening: true,
      fulfillmentType: isAdvance ? 'Advance Deposit' : 'Opening Balance',
      paymentMethod: isAdvance ? 'Advance Cash' : 'Opening Balance',
      orderTotal: openingBal,
      paidAmount: isAdvance ? openingBal : 0,
      remainingAmount: isAdvance ? 0 : openingBal,
    });
  }

  const { entries: computedChronological, summary } = recalculateCustomerStatementChronological(allEntries, customer);

  // Sync customer's stored balances if needed
  if (
    customer.khataBalance !== summary.closingDueBalance ||
    customer.currentBalance !== summary.closingDueBalance ||
    customer.advanceBalance !== summary.advanceRemaining
  ) {
    customer.khataBalance = summary.closingDueBalance;
    customer.currentBalance = summary.closingDueBalance;
    customer.advanceBalance = summary.advanceRemaining;
    await Customer.findByIdAndUpdate(customer._id, {
      khataBalance: summary.closingDueBalance,
      currentBalance: summary.closingDueBalance,
      advanceBalance: summary.advanceRemaining,
    });
  }

  // Filter by date if requested
  let filtered = [...computedChronological].reverse(); // Newest first for view

  if (startDate || endDate) {
    filtered = filtered.filter((e) => {
      const eDate = new Date(e.date || e.createdAt);
      if (startDate && eDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (eDate > end) return false;
      }
      return true;
    });
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const paginatedEntries = filtered.slice(skip, skip + limitNum);

  return {
    customer,
    entries: paginatedEntries,
    pagination: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
    },
    summary,
  };
};

export const getReceivablesAgingService = async () => {
  const customersWithBalance = await Customer.find({
    currentBalance: { $gt: 0 },
  }).select('code name phone deliveryRoute creditLimit currentBalance updatedAt');

  const now = Date.now();
  const buckets = {
    current_0_15: { count: 0, totalAmount: 0 },
    days_16_30: { count: 0, totalAmount: 0 },
    days_31_60: { count: 0, totalAmount: 0 },
    days_60_plus: { count: 0, totalAmount: 0 },
  };

  const customerAgingList = await Promise.all(
    customersWithBalance.map(async (customer) => {
      const lastDebit = await KhataEntry.findOne({
        customerId: customer._id,
        transactionType: 'DEBIT',
      })
        .sort({ date: -1 })
        .select('date');

      const referenceDate = lastDebit ? new Date(lastDebit.date).getTime() : new Date(customer.updatedAt).getTime();
      const ageInDays = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24));

      let bucketName = 'current_0_15';
      if (ageInDays > 60) {
        bucketName = 'days_60_plus';
      } else if (ageInDays > 30) {
        bucketName = 'days_31_60';
      } else if (ageInDays > 15) {
        bucketName = 'days_16_30';
      }

      buckets[bucketName].count += 1;
      buckets[bucketName].totalAmount += customer.currentBalance;

      return {
        id: customer._id,
        code: customer.code,
        name: customer.name,
        phone: customer.phone,
        deliveryRoute: customer.deliveryRoute,
        currentBalance: customer.currentBalance,
        creditLimit: customer.creditLimit,
        ageInDays,
        agingBucket: bucketName,
        lastDebitDate: lastDebit ? lastDebit.date : null,
      };
    })
  );

  const grandTotalReceivables = customerAgingList.reduce((acc, c) => acc + c.currentBalance, 0);

  return {
    summary: {
      totalReceivables: grandTotalReceivables,
      totalDebtorsCount: customerAgingList.length,
      buckets,
    },
    customers: customerAgingList.sort((a, b) => b.currentBalance - a.currentBalance),
  };
};


export const createExpenseService = async (data, userId) => {
  const {
    category,
    title,
    amountRupees,
    amount,
    paymentMethod = 'CASH',
    receiptNumber,
    receiptRef,
    notes,
    description,
    date,
    scope = 'FARM',
    authorizedBy,
    costAttribution,
  } = data;

  const voucherNumber = generateExpenseVoucher();
  const finalAmount = Number(amountRupees ?? amount ?? 0);
  const finalTitle = String(title || description || category || 'Farm Expense').trim();
  const finalCategory = String(category || 'FARM_OPERATION').trim();

  let cleanPaymentMethod = 'CASH';
  if (paymentMethod) {
    const pmUpper = String(paymentMethod).toUpperCase();
    if (pmUpper.includes('BANK')) cleanPaymentMethod = 'BANK_TRANSFER';
    else if (pmUpper.includes('ONLINE') || pmUpper.includes('CREDIT')) cleanPaymentMethod = 'ONLINE';
    else if (pmUpper.includes('CHEQUE')) cleanPaymentMethod = 'CHEQUE';
    else cleanPaymentMethod = 'CASH';
  }

  const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;

  const finalReceiptNumber = (receiptNumber || receiptRef) ? String(receiptNumber || receiptRef).trim() : null;

  const expense = await Expense.create({
    voucherNumber,
    date: date ? new Date(date) : new Date(),
    scope: String(scope || 'FARM').toUpperCase(),
    category: finalCategory,
    title: finalTitle,
    amountRupees: finalAmount,
    paymentMethod: cleanPaymentMethod,
    receiptNumber: finalReceiptNumber,
    notes: notes ? String(notes).trim() : (description ? String(description).trim() : null),
    authorizedBy: authorizedBy ? String(authorizedBy).trim() : null,
    costAttribution: typeof costAttribution === 'string' ? costAttribution.trim() : (typeof costAttribution === 'object' && costAttribution !== null ? JSON.stringify(costAttribution) : ''),
    loggedByUserId: validUserId,
  });

  if (validUserId && expense.loggedByUserId) {
    try {
      await expense.populate('loggedByUserId', 'name username role');
    } catch (_) {}
  }

  return expense;
};

export const getExpensesService = async (queryParams) => {
  const { category, scope, paymentMethod, startDate, endDate, search, page = 1, limit = 200 } = queryParams;

  const query = {};

  if (scope) {
    const scopeUpper = String(scope).toUpperCase();
    query.$or = [
      { scope: scopeUpper },
      { scope: { $exists: false } },
      { scope: null },
      { scope: '' },
    ];
  }

  if (category) {
    query.category = { $regex: new RegExp(String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
  }

  if (paymentMethod) {
    query.paymentMethod = String(paymentMethod).toUpperCase();
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (search) {
    const searchConditions = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { voucherNumber: { $regex: search, $options: 'i' } },
      { receiptNumber: { $regex: search, $options: 'i' } },
    ];

    if (query.$or) {
      query.$and = [
        { $or: query.$or },
        { $or: searchConditions },
      ];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(500, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [expenses, totalCount] = await Promise.all([
    Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('loggedByUserId', 'name username role'),
    Expense.countDocuments(query),
  ]);

  const totalAmountAgg = await Expense.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amountRupees' } } },
  ]);

  const totalFilteredAmount = totalAmountAgg[0] ? totalAmountAgg[0].total : 0;

  return {
    totalAmount: totalFilteredAmount,
    expenses,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
  };
};

export const getExpenseSummaryService = async (queryParams) => {
  const { startDate, endDate } = queryParams;

  const query = {};
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const categoryBreakdown = await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amountRupees' },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  const grandTotal = categoryBreakdown.reduce((acc, cat) => acc + cat.totalAmount, 0);

  return {
    grandTotal,
    categories: categoryBreakdown.map((cat) => ({
      category: cat._id,
      totalAmount: cat.totalAmount,
      count: cat.count,
      percentage: grandTotal > 0 ? Number(((cat.totalAmount / grandTotal) * 100).toFixed(2)) : 0,
    })),
  };
};

export const updateExpenseService = async (expenseId, data) => {
  const expense = await Expense.findByIdAndUpdate(expenseId, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }
  return expense;
};

export const deleteExpenseService = async (expenseId) => {
  const expense = await Expense.findByIdAndDelete(expenseId).lean();
  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  // If this expense is linked to a salary payment, clean up SalaryPayment and Staff status
  try {
    let payment = null;
    if (expense.salaryPaymentId) {
      payment = await SalaryPayment.findById(expense.salaryPaymentId);
    }
    if (!payment) {
      payment = await SalaryPayment.findOne({ expenseId: expense._id });
    }

    if (payment) {
      await SalaryPayment.findByIdAndDelete(payment._id);
      if (payment.staffId) {
        const remaining = await SalaryPayment.findOne({
          staffId: payment.staffId,
          monthYear: payment.monthYear,
          status: 'Paid',
        });
        if (!remaining) {
          await Staff.findByIdAndUpdate(payment.staffId, {
            salaryStatus: 'Pending',
            salaryPaidDate: null,
            salaryPaidMonth: null,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error cascading salary delete in deleteExpenseService:', err);
  }

  return { message: 'Expense deleted successfully', expense };
};

