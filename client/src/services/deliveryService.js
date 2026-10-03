import api from './api';

export const deliveryService = {
  // Deliveries / Runs
  getDeliveries: async (params = {}) => {
    const res = await api.get('/api/v1/deliveries', { limit: 1000, ...params }, { fallback: [] });
    return res.data?.deliveryRuns || res.data?.deliveries || res.data || res.deliveries || (Array.isArray(res) ? res : []);
  },

  getDeliveryById: async (id) => {
    const res = await api.get(`/api/v1/deliveries/${id}`, null, { fallback: null });
    return res.data || res.delivery || res;
  },

  createDelivery: async (data) => {
    const res = await api.post('/api/v1/deliveries', data);
    return res.data || res.delivery || res;
  },

  updateDeliveryStatus: async (id, statusData) => {
    const payload = typeof statusData === 'string' ? { status: statusData } : statusData;
    const res = await api.patch(`/api/v1/deliveries/${id}/status`, payload);
    return res.data || res;
  },

  updateDelivery: async (id, data) => {
    const res = await api.put(`/api/v1/deliveries/${id}`, data);
    return res.data || res.delivery || res;
  },

  deleteDelivery: async (id) => {
    const res = await api.delete(`/api/v1/deliveries/${id}`);
    return res.data || res;
  },

  // Fleet Staff / Riders
  getStaff: async (params = {}) => {
    const res = await api.get('/api/v1/deliveries/staff', params, { fallback: [] });
    return res.data || res.staff || res || [];
  },

  // Fuel Logs
  getFuelLogs: async (params = {}) => {
    const res = await api.get('/api/v1/deliveries/fuel-logs', params, { fallback: [] });
    return res.data || res.logs || res || [];
  },

  createFuelLog: async (data) => {
    const res = await api.post('/api/v1/deliveries/fuel-logs', data);
    return res.data || res.log || res;
  },

  updateFuelLog: async (id, data) => {
    const res = await api.put(`/api/v1/deliveries/fuel-logs/${id}`, data);
    return res.data || res.log || res;
  },

  deleteFuelLog: async (id) => {
    const res = await api.delete(`/api/v1/deliveries/fuel-logs/${id}`);
    return res.data || res;
  },
};

export default deliveryService;

