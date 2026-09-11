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
} from '../controllers/finance.controller.js';
import {
  validateKhataEntryInput,
  validateExpenseInput,
} from '../validators/finance.validator.js';

const router = express.Router();


router.use(authenticate);

/* ==========================================================================
   Khata & Customer Ledger Routes
   ========================================================================== */

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

/* ==========================================================================
   Expense Management Routes
   ========================================================================== */

// Expense Category Summary Report (ADMIN, MANAGER)
router.get('/expenses/summary', authorize('ADMIN', 'MANAGER'), getExpenseSummary);

// Create Expense Record (ADMIN, MANAGER)
router.post(
  '/expenses',
  authorize('ADMIN', 'MANAGER'),
  validateExpenseInput,
  createExpense
);

// List Expenses with Pagination & Filters (ADMIN, MANAGER)
router.get('/expenses', authorize('ADMIN', 'MANAGER'), getExpenses);

export default router;
