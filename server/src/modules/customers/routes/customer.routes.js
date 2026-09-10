import { Router } from 'express';
import {
    createCustomer,
    getCustomers,
    searchCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    setCustomerStatus,
    updateCustomerCreditLimit,
    getCustomerBalance,
    getCustomerTransactions,
} from '../controllers/customer.controller.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';
import {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateSetStatus,
    validateUpdateCreditLimit,
} from '../validators/customer.validator.js';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Quick search route
router.get('/search', searchCustomers);

// Base customers routes
router.route('/')
    .post(authorize('ADMIN', 'MANAGER', 'CASHIER'), validateCreateCustomer, createCustomer)
    .get(getCustomers);

// Individual customer management by ID
router.route('/:id')
    .get(getCustomerById)
    .put(authorize('ADMIN', 'MANAGER'), validateUpdateCustomer, updateCustomer)
    .delete(authorize('ADMIN'), deleteCustomer);

// Status & Credit Limit patch routes
// update customer status
router.patch('/:id/status', authorize('ADMIN', 'MANAGER'), validateSetStatus, setCustomerStatus);
// update customer credit limit
router.patch('/:id/credit-limit', authorize('ADMIN', 'MANAGER'), validateUpdateCreditLimit, updateCustomerCreditLimit);

// Financial / Balance routes
// get customer balance
router.get('/:id/balance', getCustomerBalance);
// get customer transactions
router.get('/:id/transactions', getCustomerTransactions);

export default router;
