import api from './api';

export const farmService = {
  // Animals / Herd
  getAnimals: async (params = {}) => {
    const res = await api.get('/api/farm/animals', params, { fallback: [] });
    return res.data || res.animals || res || [];
  },

  getAnimalStats: async () => {
    const res = await api.get('/api/farm/animals/stats', null, { fallback: {} });
    return res.data || res.stats || res || {};
  },

  getAnimalById: async (id) => {
    const res = await api.get(`/api/farm/animals/${id}`, null, { fallback: null });
    return res.data || res.animal || res;
  },

  createAnimal: async (data) => {
    const res = await api.post('/api/farm/animals', data);
    return res.data || res.animal || res;
  },

  updateAnimal: async (id, data) => {
    const res = await api.patch(`/api/farm/animals/${id}`, data);
    return res.data || res.animal || res;
  },

  deleteAnimal: async (id) => {
    const res = await api.delete(`/api/farm/animals/${id}`);
    return res.data || res;
  },

  // Milking Yield Logs
  getMilkingLogs: async (params = {}) => {
    const res = await api.get('/api/farm/milking-logs', params, { fallback: [] });
    return res.data || res.logs || res || [];
  },

  getDailyYieldSummary: async (date) => {
    const res = await api.get('/api/farm/milking-logs/daily-summary', { date }, { fallback: {} });
    return res.data || res.summary || res || {};
  },

  getMilkingLogById: async (id) => {
    const res = await api.get(`/api/farm/milking-logs/${id}`, null, { fallback: null });
    return res.data || res.log || res;
  },

  createMilkingLog: async (data) => {
    const res = await api.post('/api/farm/milking-logs', data);
    return res.data || res.log || res;
  },

  updateMilkingLog: async (id, data) => {
    const res = await api.patch(`/api/farm/milking-logs/${id}`, data);
    return res.data || res.log || res;
  },

  deleteMilkingLog: async (id) => {
    const res = await api.delete(`/api/farm/milking-logs/${id}`);
    return res.data || res;
  },

  // Dahi & Dairy Value-Add Processing Batches
  getProcessingBatches: async (params = {}) => {
    const res = await api.get('/api/v1/processing', params, { fallback: [] });
    return res.data || res.batches || res || [];
  },

  getProcessingStats: async () => {
    const res = await api.get('/api/v1/processing/stats', null, { fallback: {} });
    return res.data || res.stats || res || {};
  },

  getProcessingBatchById: async (id) => {
    const res = await api.get(`/api/v1/processing/${id}`, null, { fallback: null });
    return res.data || res.batch || res;
  },

  createProcessingBatch: async (data) => {
    const res = await api.post('/api/v1/processing', data);
    return res.data || res.batch || res;
  },

  updateProcessingBatch: async (id, data) => {
    const res = await api.patch(`/api/v1/processing/${id}`, data);
    return res.data || res.batch || res;
  },

  deleteProcessingBatch: async (id) => {
    const res = await api.delete(`/api/v1/processing/${id}`);
    return res.data || res;
  },
};

export default farmService;
