import express from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';
import {
  addKhataEntry,
  getCustomerStatement,
  getReceivablesAging,
  createExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense,
  deleteExpense,
} from '../controllers/finance.controller.js';
import {
  validateKhataEntryInput,
  validateExpenseInput,
} from '../validators/finance.validator.js';

const router = express.Router();


router.use(authenticate);


// Receivables Aging Engine (ADMIN, MANAGER)
router.get('/khata/aging', authorize('ADMIN', 'MANAGER'), getReceivablesAging);

// Post Khata Debit/Credit Entry (ADMIN, MANAGER, CASHIER)
router.post(
  '/khata/entries',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validateKhataEntryInput,
  addKhataEntry
);

// Get Customer Ledger / Statement of Accounts (ADMIN, MANAGER, CASHIER)
router.get(
  '/khata/:customerId/statement',
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  getCustomerStatement
);


// Expense Category Summary Report (ADMIN, MANAGER, CASHIER, FARM_SUPERVISOR)
router.get('/expenses/summary', authorize('ADMIN', 'MANAGER', 'CASHIER', 'FARM_SUPERVISOR'), getExpenseSummary);

// Create Expense Record (ADMIN, MANAGER, CASHIER, FARM_SUPERVISOR)
router.post(
  '/expenses',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'FARM_SUPERVISOR'),
  validateExpenseInput,
  createExpense
);

// List Expenses with Pagination & Filters (ADMIN, MANAGER, CASHIER, FARM_SUPERVISOR)
router.get('/expenses', authorize('ADMIN', 'MANAGER', 'CASHIER', 'FARM_SUPERVISOR'), getExpenses);

// Update Expense (ADMIN, MANAGER, CASHIER, FARM_SUPERVISOR)
router.patch('/expenses/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'FARM_SUPERVISOR'), updateExpense);

// Delete Expense (ADMIN, MANAGER, CASHIER, FARM_SUPERVISOR)
router.delete('/expenses/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'FARM_SUPERVISOR'), deleteExpense);

export default router;
