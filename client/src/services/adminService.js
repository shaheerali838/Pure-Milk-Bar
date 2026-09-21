import api from './api';

export const adminService = {
  // Staff / User Management
  getStaff: async (params = {}) => {
    const res = await api.get('/api/v1/admin/staff', params);
    return res.data || res.staff || res;
  },

  createStaff: async (data) => {
    const res = await api.post('/api/v1/admin/staff', data);
    return res.data || res.staff || res;
  },

  updateStaff: async (id, data) => {
    const res = await api.patch(`/api/v1/admin/staff/${id}`, data);
    return res.data || res.staff || res;
  },

  deleteStaff: async (id) => {
    const res = await api.delete(`/api/v1/admin/staff/${id}`);
    return res.data || res;
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
