import {
  addKhataEntryService,
  getCustomerStatementService,
  getReceivablesAgingService,
  createExpenseService,
  getExpensesService,
  getExpenseSummaryService,
  updateExpenseService,
  deleteExpenseService,
} from '../services/finance.service.js';



export const addKhataEntry = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || null;
    const result = await addKhataEntryService(req.body, userId);
    res.status(201).json({
      success: true,
      message: `Khata ${req.body.transactionType.toUpperCase()} entry recorded successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerStatement = async (req, res, next) => {
  try {
    const data = await getCustomerStatementService(req.params.customerId, req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};


export const getReceivablesAging = async (req, res, next) => {
  try {
    const data = await getReceivablesAgingService();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};



export const createExpense = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const expense = await createExpenseService(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense,
      expense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const data = await getExpensesService(req.query);
    res.status(200).json({
      success: true,
      data,
      expenses: data?.expenses || [],
      totalAmount: data?.totalAmount || 0,
      pagination: data?.pagination || {},
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    next(error);
  }
};


export const getExpenseSummary = async (req, res, next) => {
  try {
    const data = await getExpenseSummaryService(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await updateExpenseService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const result = await deleteExpenseService(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.expense,
    });
  } catch (error) {
    next(error);
  }
};

