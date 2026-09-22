import api from './api';

export const customerService = {
  // Get all customers with search, status, and pagination options
  getCustomers: async (params = {}) => {
    const res = await api.get('/api/v1/customers', params, { fallback: [] });
    return res.data || res.customers || res || [];
  },

  // Quick search
  searchCustomers: async (term) => {
    const res = await api.get('/api/v1/customers/search', { q: term }, { fallback: [] });
    return res.data || res.customers || res || [];
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    const res = await api.get(`/api/v1/customers/${id}`, null, { fallback: null });
    return res.data || res.customer || res;
  },

  // Create customer
  createCustomer: async (customerData) => {
    const res = await api.post('/api/v1/customers', customerData);
    return res.data || res.customer || res;
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    const res = await api.put(`/api/v1/customers/${id}`, customerData);
    return res.data || res.customer || res;
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const res = await api.delete(`/api/v1/customers/${id}`);
    return res.data || res;
  },

  // Update status (Active/Suspended/Inactive)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/api/v1/customers/${id}/status`, { status });
    return res.data || res;
  },

  // Update credit limit
  updateCreditLimit: async (id, creditLimit) => {
    const res = await api.patch(`/api/v1/customers/${id}/credit-limit`, { creditLimit });
    return res.data || res;
  },

  // Get balance & transactions
  getBalance: async (id) => {
    const res = await api.get(`/api/v1/customers/${id}/balance`, null, { fallback: { balance: 0 } });
    return res.data || res;
  },

  getTransactions: async (id, params = {}) => {
    const res = await api.get(`/api/v1/customers/${id}/transactions`, params, { fallback: [] });
    return res.data || res.transactions || res || [];
  },
};

export default customerService;
