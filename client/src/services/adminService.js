import api from './api';

export const adminService = {
  // Staff / User Management
  getStaff: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/staff', params);
      return res.data || res.staff || res;
    } catch (_) {
      const res = await api.get('/api/v1/admin/staff', params);
      return res.data || res.staff || res;
    }
  },

  createStaff: async (data) => {
    try {
      const res = await api.post('/api/v1/staff', data);
      return res.data || res.staff || res;
    } catch (_) {
      const res = await api.post('/api/v1/admin/staff', data);
      return res.data || res.staff || res;
    }
  },

  updateStaff: async (id, data) => {
    try {
      const res = await api.patch(`/api/v1/staff/${id}`, data);
      return res.data || res.staff || res;
    } catch (_) {
      const res = await api.patch(`/api/v1/admin/staff/${id}`, data);
      return res.data || res.staff || res;
    }
  },

  deleteStaff: async (id) => {
    try {
      const res = await api.delete(`/api/v1/staff/${id}`);
      return res.data || res;
    } catch (_) {
      const res = await api.delete(`/api/v1/admin/staff/${id}`);
      return res.data || res;
    }
  },

  sendStaffCredentials: async (id, data = {}) => {
    try {
      const res = await api.post(`/api/v1/staff/${id}/send-credentials`, data);
      return res.data || res;
    } catch (err) {
      throw err;
    }
  },

  // Salary Disbursements & Ledger API (Database backed)
  payStaffSalary: async (data) => {
    const sId = data.staffId || data.id;
    try {
      const res = await api.post(`/api/v1/staff/${sId}/pay-salary`, data);
      return res.data || res;
    } catch (_) {
      const res = await api.post('/api/v1/staff/salaries', data);
      return res.data || res;
    }
  },

  getStaffSalaries: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/staff/salaries', params);
      return res.data || res.salaries || res;
    } catch (err) {
      console.warn('Failed to fetch salaries from API:', err.message);
      return [];
    }
  },

  deleteSalaryPayment: async (salaryId) => {
    try {
      const res = await api.delete(`/api/v1/staff/salaries/${salaryId}`);
      return res.data || res;
    } catch (err) {
      throw err;
    }
  },

  // Enterprise Settings
  getSettings: async () => {
    const res = await api.get('/api/v1/admin/settings');
    return res.data || res.settings || res;
  },

  updateSettings: async (data) => {
    const res = await api.put('/api/v1/admin/settings', data);
    return res.data || res.settings || res;
  },
};

export default adminService;
