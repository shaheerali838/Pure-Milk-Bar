import api from './api';

export const financeService = {
  // Daily Closings
  getDailyClosings: async (params = {}) => {
    const res = await api.get('/api/v1/daily-closings', params);
    return res.data || res.closings || res;
  },

  getDailyClosingByDate: async (date) => {
    const res = await api.get(`/api/v1/daily-closings/date/${date}`);
    return res.data || res.closing || res;
  },

  submitDailyClosing: async (data) => {
    const res = await api.post('/api/v1/daily-closings', data);
    return res.data || res.closing || res;
  },

  // Audit Logs / Transactions
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/api/v1/audit-logs', params);
    return res.data || res.logs || res;
  },

  logAuditEvent: async (data) => {
    const res = await api.post('/api/v1/audit-logs', data);
    return res.data || res;
  },

  // Financial Summary
  getFinancialSummary: async (params = {}) => {
    const res = await api.get('/api/v1/finance/summary', params);
    return res.data || res.summary || res;
  },
};

export default financeService;
