import api from './api';

export const supplierService = {
  // Suppliers
  getSuppliers: async (params = {}) => {
    const res = await api.get('/api/v1/suppliers', params, { fallback: [] });
    return res.data || res.suppliers || res || [];
  },

  getSupplierStats: async () => {
    const res = await api.get('/api/v1/suppliers/stats', null, { fallback: {} });
    return res.data || res.stats || res || {};
  },

  getSupplierById: async (id) => {
    const res = await api.get(`/api/v1/suppliers/${id}`, null, { fallback: null });
    return res.data || res.supplier || res;
  },

  createSupplier: async (data) => {
    const res = await api.post('/api/v1/suppliers', data);
    return res.data || res.supplier || res;
  },

  updateSupplier: async (id, data) => {
    const res = await api.patch(`/api/v1/suppliers/${id}`, data);
    return res.data || res.supplier || res;
  },

  deleteSupplier: async (id) => {
    const res = await api.delete(`/api/v1/suppliers/${id}`);
    return res.data || res;
  },

  // Procurements / Milk Intake
  getProcurements: async (params = {}) => {
    const res = await api.get('/api/v1/suppliers/procurements', params, { fallback: [] });
    return res.data || res.procurements || res || [];
  },

  getDailySummary: async (date) => {
    const res = await api.get('/api/v1/suppliers/procurements/daily-summary', { date }, { fallback: {} });
    return res.data || res.summary || res || {};
  },

  getProcurementById: async (id) => {
    const res = await api.get(`/api/v1/suppliers/procurements/${id}`, null, { fallback: null });
    return res.data || res.procurement || res;
  },

  createProcurement: async (data) => {
    const res = await api.post('/api/v1/suppliers/procurements', data);
    return res.data || res.procurement || res;
  },

  updateProcurement: async (id, data) => {
    const res = await api.patch(`/api/v1/suppliers/procurements/${id}`, data);
    return res.data || res.procurement || res;
  },
};

export default supplierService;
