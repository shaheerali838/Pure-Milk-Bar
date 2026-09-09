import mongoose from 'mongoose';
import Customer from '../../../models/Customer.model.js';
import KhataEntry from '../../../models/KhataEntry.model.js';

// Helper to validate Mongo ObjectId
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid Customer ID format: '${id}'`);
    error.statusCode = 400;
    throw error;
  }
};

// Auto-generate customer code if not provided (e.g. CUST-1001)
const generateCustomerCode = async () => {
  const count = await Customer.countDocuments();
  const nextNum = count + 1001;
  let code = `CUST-${nextNum}`;

  // Ensure uniqueness in rare case of deletion
  const exists = await Customer.findOne({ code });
  if (exists) {
    code = `CUST-${Date.now().toString().slice(-6)}`;
  }
  return code;
};

// Create new customer
export const createCustomerService = async (customerData) => {
  const { phone, code } = customerData;

  // Check phone uniqueness
  const existingPhone = await Customer.findOne({ phone });
  if (existingPhone) {
    const error = new Error('Customer with this phone number already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Generate or sanitize code
  let customerCode = code ? code.toUpperCase() : await generateCustomerCode();
  if (code) {
    const existingCode = await Customer.findOne({ code: customerCode });
    if (existingCode) {
      const error = new Error('Customer code already exists.');
      error.statusCode = 409;
      throw error;
    }
  }

  const newCustomer = await Customer.create({
    ...customerData,
    code: customerCode,
  });

  return newCustomer;
};

// Get paginated customers list with search and filters
export const getAllCustomersService = async (queryParams) => {
  const {
    search = '',
    status,
    deliveryRoute,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = queryParams;

  const filter = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { code: searchRegex },
    ];
  }

  if (status) filter.status = status;
  if (deliveryRoute) filter.deliveryRoute = deliveryRoute;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOption = { [sortBy]: sortDirection };

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Customer.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    customers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

// Quick search customer by query string
export const searchCustomersService = async (searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) {
    return [];
  }

  const searchRegex = new RegExp(searchQuery.trim(), 'i');
  return await Customer.find({
    $or: [
      { name: searchRegex },
      { phone: searchRegex },
      { code: searchRegex },
    ],
  })
    .limit(20)
    .sort({ name: 1 });
};

// Get single customer details by ID
export const getCustomerByIdService = async (customerId) => {
  validateObjectId(customerId);
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }
  return customer;
};

// Update customer details
export const updateCustomerService = async (customerId, updateData) => {
  validateObjectId(customerId);
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check phone uniqueness if changed
  if (updateData.phone && updateData.phone !== customer.phone) {
    const phoneExists = await Customer.findOne({
      phone: updateData.phone,
      _id: { $ne: customerId },
    });
    if (phoneExists) {
      const error = new Error('Phone number is already in use by another customer.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Check code uniqueness if changed
  if (updateData.code && updateData.code.toUpperCase() !== customer.code) {
    const newCode = updateData.code.toUpperCase();
    const codeExists = await Customer.findOne({
      code: newCode,
      _id: { $ne: customerId },
    });
    if (codeExists) {
      const error = new Error('Customer code is already in use by another customer.');
      error.statusCode = 409;
      throw error;
    }
    updateData.code = newCode;
  }

  Object.assign(customer, updateData);
  await customer.save();

  return customer;
};

// Delete customer account
export const deleteCustomerService = async (customerId) => {
  validateObjectId(customerId);
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  if (customer.currentBalance > 0) {
    const error = new Error(
      `Cannot delete customer with active outstanding balance of Rs. ${customer.currentBalance}. Please clear Khata balance first.`
    );
    error.statusCode = 400;
    throw error;
  }

  await Customer.findByIdAndDelete(customerId);
  return { message: `Customer '${customer.name}' (${customer.code}) deleted successfully.` };
};

// Update customer status (ACTIVE, INACTIVE, SUSPENDED)
export const setCustomerStatusService = async (customerId, status) => {
  validateObjectId(customerId);
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $set: { status } },
    { new: true, runValidators: true }
  );

  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

// Update customer credit limit
export const updateCustomerCreditLimitService = async (customerId, creditLimit) => {
  validateObjectId(customerId);
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $set: { creditLimit } },
    { new: true, runValidators: true }
  );

  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

// Get single customer current balance info
export const getCustomerBalanceService = async (customerId) => {
  validateObjectId(customerId);
  const customer = await Customer.findById(customerId).select('name code phone currentBalance creditLimit status');
  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  const availableCredit = Math.max(0, customer.creditLimit - customer.currentBalance);
  const isCreditExceeded = customer.currentBalance > customer.creditLimit;

  return {
    customer: {
      id: customer._id,
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      status: customer.status,
    },
    balanceInfo: {
      currentBalance: customer.currentBalance,
      creditLimit: customer.creditLimit,
      availableCredit,
      isCreditExceeded,
    },
  };
};

// Get customer financial / Khata transactions history
export const getCustomerTransactionsService = async (customerId, queryParams) => {
  validateObjectId(customerId);
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  const { page = 1, limit = 10 } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    KhataEntry.find({ customerId })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('cashierId', 'name username'),
    KhataEntry.countDocuments({ customerId }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    customer: {
      id: customer._id,
      code: customer.code,
      name: customer.name,
      currentBalance: customer.currentBalance,
    },
    transactions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};
