
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

const PAYMENT_METHODS = ['CASH', 'ONLINE', 'CHEQUE'];

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
  const { category, title, amountRupees, paymentMethod } = req.body;

  if (!category || !EXPENSE_CATEGORIES.includes(category.toUpperCase())) {
    const error = new Error(
      `Valid category is required. Allowed categories: ${EXPENSE_CATEGORIES.join(', ')}`
    );
    error.statusCode = 400;
    return next(error);
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    const error = new Error('Expense title is required');
    error.statusCode = 400;
    return next(error);
  }

  const amount = Number(amountRupees);
  if (isNaN(amount) || amount <= 0) {
    const error = new Error('Expense amount (amountRupees) must be a positive number');
    error.statusCode = 400;
    return next(error);
  }

  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod.toUpperCase())) {
    const error = new Error(
      `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`
    );
    error.statusCode = 400;
    return next(error);
  }

  next();
};
