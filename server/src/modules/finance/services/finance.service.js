import mongoose from 'mongoose';
import KhataEntry from '../../../models/KhataEntry.model.js';
import Customer from '../../../models/Customer.model.js';
import Expense from '../../../models/Expense.model.js';


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
  const session = await mongoose.startSession();
  session.startTransaction();

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

    const txType = transactionType.toUpperCase();
    const entryAmount = Number(amount ?? (txType === 'DEBIT' ? debitAmount : creditAmount));

    const customer = await Customer.findById(customerId).session(session);

    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    if (customer.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      const error = new Error(`Cannot post khata entry. Customer account status is '${customer.status}'`);
      error.statusCode = 400;
      throw error;
    }

    const previousBalance = customer.currentBalance || 0;
    let newBalance = previousBalance;

    if (txType === 'DEBIT') {
      newBalance = previousBalance + entryAmount;

      if (customer.creditLimit > 0 && newBalance > customer.creditLimit) {
        await session.abortTransaction();
        session.endSession();
        const error = new Error(
          `Credit limit exceeded. Current balance (${previousBalance} PKR) + Debit (${entryAmount} PKR) exceeds limit of ${customer.creditLimit} PKR`
        );
        error.statusCode = 400;
        throw error;
      }
    } else if (txType === 'CREDIT') {
      newBalance = previousBalance - entryAmount;
    }

    const voucherNumber = generateKhataVoucher();
    const [entry] = await KhataEntry.create(
      [
        {
          customerId: customer._id,
          date: date ? new Date(date) : new Date(),
          voucherNumber,
          transactionType: txType,
          description: description.trim(),
          debitAmount: txType === 'DEBIT' ? entryAmount : 0,
          creditAmount: txType === 'CREDIT' ? entryAmount : 0,
          runningBalance: newBalance,
          paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : (txType === 'CREDIT' ? 'CASH' : null),
          referenceTransactionId: referenceTransactionId || null,
          cashierId: userId,
        },
      ],
      { session }
    );

    customer.currentBalance = newBalance;
    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      entry,
      customer: {
        id: customer._id,
        name: customer.name,
        code: customer.code,
        previousBalance,
        currentBalance: newBalance,
        creditLimit: customer.creditLimit,
      },
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
};

export const getCustomerStatementService = async (customerId, queryParams) => {
  const { startDate, endDate, page = 1, limit = 50 } = queryParams;

  const customer = await Customer.findById(customerId).select('code name phone address creditLimit currentBalance status preferredPayment');
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const query = { customerId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [entries, totalCount] = await Promise.all([
    KhataEntry.find(query)
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('cashierId', 'name username role'),
    KhataEntry.countDocuments(query),
  ]);

  const totalsAggregation = await KhataEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalDebit: { $sum: '$debitAmount' },
        totalCredit: { $sum: '$creditAmount' },
      },
    },
  ]);

  const periodSummary = totalsAggregation[0] || { totalDebit: 0, totalCredit: 0 };

  return {
    customer,
    summary: {
      totalDebit: periodSummary.totalDebit,
      totalCredit: periodSummary.totalCredit,
      netBalance: customer.currentBalance,
    },
    entries,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
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
  const { category, title, amountRupees, paymentMethod = 'CASH', receiptNumber, notes, date } = data;
  const voucherNumber = generateExpenseVoucher();

  const expense = await Expense.create({
    voucherNumber,
    date: date ? new Date(date) : new Date(),
    category: category.toUpperCase(),
    title: title.trim(),
    amountRupees: Number(amountRupees),
    paymentMethod: paymentMethod.toUpperCase(),
    receiptNumber: receiptNumber ? receiptNumber.trim() : null,
    notes: notes ? notes.trim() : null,
    loggedByUserId: userId,
  });

  await expense.populate('loggedByUserId', 'name username role');
  return expense;
};

export const getExpensesService = async (queryParams) => {
  const { category, paymentMethod, startDate, endDate, search, page = 1, limit = 50 } = queryParams;

  const query = {};

  if (category) {
    query.category = category.toUpperCase();
  }

  if (paymentMethod) {
    query.paymentMethod = paymentMethod.toUpperCase();
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { voucherNumber: { $regex: search, $options: 'i' } },
      { receiptNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10)));
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
