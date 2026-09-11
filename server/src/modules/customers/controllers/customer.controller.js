import {
  createCustomerService,
  getAllCustomersService,
  searchCustomersService,
  getCustomerByIdService,
  updateCustomerService,
  deleteCustomerService,
  setCustomerStatusService,
  updateCustomerCreditLimitService,
  getCustomerBalanceService,
  getCustomerTransactionsService,
} from '../services/customer.service.js';

// Create a new customer
export const createCustomer = async (req, res, next) => {
  try {
    const customer = await createCustomerService(req.body);
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

// Get list of customers with pagination, search, and filters
export const getCustomers = async (req, res, next) => {
  try {
    const result = await getAllCustomersService(req.query);
    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Search customers by query string
export const searchCustomers = async (req, res, next) => {
  try {
    const queryStr = req.query.q || req.query.search || '';
    const customers = await searchCustomersService(queryStr);
    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: { customers },
    });
  } catch (error) {
    next(error);
  }
};

// Get customer by ID
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await getCustomerByIdService(req.params.id);
    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

// Update customer details
export const updateCustomer = async (req, res, next) => {
  try {
    const updatedCustomer = await updateCustomerService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully',
      data: { customer: updatedCustomer },
    });
  } catch (error) {
    next(error);
  }
};

// Delete customer account
export const deleteCustomer = async (req, res, next) => {
  try {
    const result = await deleteCustomerService(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Set customer active/inactive/suspended status
export const setCustomerStatus = async (req, res, next) => {
  try {
    const updatedCustomer = await setCustomerStatusService(
      req.params.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: `Customer status updated to ${updatedCustomer.status}`,
      data: { customer: updatedCustomer },
    });
  } catch (error) {
    next(error);
  }
};

// Update customer credit limit
export const updateCustomerCreditLimit = async (req, res, next) => {
  try {
    const updatedCustomer = await updateCustomerCreditLimitService(
      req.params.id,
      req.body.creditLimit
    );
    res.status(200).json({
      success: true,
      message: `Customer credit limit updated to Rs. ${updatedCustomer.creditLimit}`,
      data: { customer: updatedCustomer },
    });
  } catch (error) {
    next(error);
  }
};

// Get customer balance info
export const getCustomerBalance = async (req, res, next) => {
  try {
    const balanceData = await getCustomerBalanceService(req.params.id);
    res.status(200).json({
      success: true,
      data: balanceData,
    });
  } catch (error) {
    next(error);
  }
};

// Get customer Khata transaction history
export const getCustomerTransactions = async (req, res, next) => {
  try {
    const history = await getCustomerTransactionsService(req.params.id, req.query);
    res.status(200).json({
      success: true,
      message: 'Customer transaction history retrieved successfully',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
