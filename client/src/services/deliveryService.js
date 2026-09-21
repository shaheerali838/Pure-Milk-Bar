import api from './api';

export const deliveryService = {
  // Deliveries / Runs
  getDeliveries: async (params = {}) => {
    const res = await api.get('/api/v1/deliveries', params, { fallback: [] });
    return res.data || res.deliveries || res || [];
  },

  getDeliveryById: async (id) => {
    const res = await api.get(`/api/v1/deliveries/${id}`, null, { fallback: null });
    return res.data || res.delivery || res;
  },

  createDelivery: async (data) => {
    const res = await api.post('/api/v1/deliveries', data);
    return res.data || res.delivery || res;
  },

  updateDeliveryStatus: async (id, status) => {
    const res = await api.patch(`/api/v1/deliveries/${id}/status`, { status });
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
};

export default deliveryService;
