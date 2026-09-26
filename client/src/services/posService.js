import api from './api';

export const posService = {
  // Products / Inventory Catalog
  getProducts: async (params = {}) => {
    const res = await api.get('/api/v1/inventory/products', params, { fallback: [] });
    return res.data?.products || res.products || (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
  },

  createProduct: async (productData) => {
    const res = await api.post('/api/v1/inventory/products', productData);
    return res.data || res.product || res;
  },

  updateProduct: async (id, productData) => {
    const res = await api.patch(`/api/v1/inventory/products/${id}`, productData);
    return res.data || res.product || res;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/api/v1/inventory/products/${id}`);
    return res.data || res;
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
