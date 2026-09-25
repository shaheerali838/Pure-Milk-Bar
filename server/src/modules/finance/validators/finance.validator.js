
const EXPENSE_CATEGORIES = [
  'UTILITIES',
  'SALARIES',
  'MAINTENANCE',
  'FEED',
  'PACKAGING',
  'RENT',
  'TRANSPORT',
  'MISC',
];

const PAYMENT_METHODS = ['CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER', 'CREDIT', 'OTHER'];

export const validateKhataEntryInput = (req, res, next) => {
  const { customerId, transactionType, debitAmount, creditAmount, amount, description } = req.body;

  if (!customerId) {
    const error = new Error('Customer ID is required');
    error.statusCode = 400;
    return next(error);
  }

  if (!transactionType || !['DEBIT', 'CREDIT'].includes(transactionType.toUpperCase())) {
    const error = new Error('Transaction type must be DEBIT or CREDIT');
    error.statusCode = 400;
    return next(error);
  }

  const numericAmount = Number(amount ?? (transactionType === 'DEBIT' ? debitAmount : creditAmount));

  if (isNaN(numericAmount) || numericAmount <= 0) {
    const error = new Error('Transaction amount must be a positive number greater than 0');
    error.statusCode = 400;
    return next(error);
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    const error = new Error('Transaction description is required');
    error.statusCode = 400;
    return next(error);
  }

  next();
};

export const validateExpenseInput = (req, res, next) => {
  const { category, title, amountRupees, amount, description } = req.body;

  if (!req.body.amountRupees && amount !== undefined) {
    req.body.amountRupees = amount;
  }

  if (!req.body.title || !String(req.body.title).trim()) {
    req.body.title = description || category || 'Expense';
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    const error = new Error('Expense category is required');
    error.statusCode = 400;
    return next(error);
  }

  const numericAmount = Number(req.body.amountRupees);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    const error = new Error('Expense amount must be a positive number greater than 0');
    error.statusCode = 400;
    return next(error);
  }

  next();
};

