import api from './api';

export const posService = {
  // Get Products list
  getProducts: async (params = {}) => {
    const res = await api.get('/api/v1/inventory/products', params, { fallback: [] });
    return res.data || res.products || res || [];
  },

  // Create POS Order
  createOrder: async (orderData) => {
    const res = await api.post('/api/v1/pos/orders', orderData);
    return res.data || res.order || res;
  },

  // Get Orders list
  getOrders: async (params = {}) => {
    const res = await api.get('/api/v1/pos/orders', params);
    return res.data || res.orders || res;
  },

  // Daily Sales Stats
  getDailySalesStats: async (date) => {
    const res = await api.get('/api/v1/pos/orders/stats/daily', { date });
    return res.data || res.stats || res;
  },

  // Lookup Order by Receipt
  getOrderByReceipt: async (receiptNumber) => {
    const res = await api.get(`/api/v1/pos/orders/receipt/${receiptNumber}`);
    return res.data || res.order || res;
  },

  // Get Order by ID
  getOrderById: async (id) => {
    const res = await api.get(`/api/v1/pos/orders/${id}`);
    return res.data || res.order || res;
  },

  // Cancel Order
  cancelOrder: async (id, reason) => {
    const res = await api.post(`/api/v1/pos/orders/${id}/cancel`, { reason });
    return res.data || res;
  },
};

export default posService;
