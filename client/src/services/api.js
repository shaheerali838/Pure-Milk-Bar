/**
 * Pure Milk Bar Enterprise ERP - Centralized API Gateway & Client SDK
 * Complete end-to-end backend integration covering all modules and services:
 * - Authentication & Token Lifecycle
 * - Administration & Enterprise Users
 * - Staff Management (Admin Exclusive)
 * - Farm Management (Herd/Animals & Milking Logs)
 * - Dahi & Dairy Value-Add Processing Batches
 * - Suppliers & Milk Intake Procurements
 * - Customers & Khata Ledger Accounts
 * - Inventory & Product Catalog
 * - Point of Sale (POS) & Order Management
 * - Doorstep Deliveries, Fleet Dispatch & Vehicle Fuel Logs
 * - Finance, Khata Statements & Operational Expenses
 * - Daily Closings & Audit Reconciliation
 * - Audit Trail Logging & System Diagnostics
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. CONFIGURATION & URL RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════

export const API_BASE_URL =
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? (import.meta.env.VITE_DEV_API_URL || 'http://localhost:5000')
    : (import.meta.env.VITE_API_URL || 'https://pure-milk-bar-backend.vercel.app');

const AUTH_STORAGE_KEYS = [
  'pmb_auth_session',
  'pmb_auth_session_v2',
  'pure_milk_bar_auth_session',
  'auth_token',
];

// ═══════════════════════════════════════════════════════════════════════════
// 2. AUTHENTICATION TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retrieve active JWT token from browser storage
 */
export function getStoredToken() {
  if (typeof window === 'undefined') return null;

  for (const key of AUTH_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (raw) {
        if (raw.startsWith('{') || raw.startsWith('[')) {
          const parsed = JSON.parse(raw);
          const token =
            parsed.token ||
            parsed.accessToken ||
            parsed.data?.accessToken ||
            parsed.data?.token ||
            parsed.jwt;
          if (token) return token;
        } else if (typeof raw === 'string' && raw.length > 20) {
          return raw;
        }
      }
    } catch (_) {}
  }
  return null;
}

/**
 * Set active auth session across standard storage locations
 */
export function setStoredSession(token, user = null) {
  if (typeof window === 'undefined') return;
  const sessionData = JSON.stringify({ token, accessToken: token, user });
  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.setItem(key, sessionData);
    } catch (_) {}
  });
}

/**
 * Clear all auth session data across storage
 */
export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (_) {}
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CORE REQUEST PIPELINE & INTERCEPTORS
// ═══════════════════════════════════════════════════════════════════════════

export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    params = null,
    headers = {},
    timeout = 30000,
    blob = false,
    ...customConfig
  } = options;

  let url = endpoint;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    url = `${API_BASE_URL}${cleanEndpoint}`;
  }

  // Format Query Parameters
  if (params && typeof params === 'object') {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getStoredToken();

  const reqHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers: reqHeaders,
    signal: controller.signal,
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return { success: true };
    }

    if (blob) {
      if (!response.ok) {
        throw new Error(`Blob request failed with status ${response.status}`);
      }
      return await response.blob();
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMsg = `Request failed with status ${response.status}`;
      if (typeof data === 'object' && data !== null) {
        if (typeof data.message === 'string') {
          errorMsg = data.message;
        } else if (typeof data.error === 'string') {
          errorMsg = data.error;
        } else if (typeof data.error?.message === 'string') {
          errorMsg = data.error.message;
        } else {
          errorMsg = JSON.stringify(data);
        }
      } else if (typeof data === 'string' && data) {
        errorMsg = data;
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (options.fallback !== undefined) {
      if (import.meta.env?.DEV) {
        console.warn(`[API ${method}] ${url} unavailable (${error.message}). Using fallback.`);
      }
      return options.fallback;
    }
    if (import.meta.env?.DEV) {
      console.warn(`[API ${method}] ${url} failed:`, error.message);
    }
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. ENTERPRISE API CLIENT SDK
// ═══════════════════════════════════════════════════════════════════════════

export const api = {
  // HTTP Primitives
  get: (url, params = null, options = {}) => request(url, { method: 'GET', params, ...options }),
  post: (url, body = null, options = {}) => request(url, { method: 'POST', body, ...options }),
  put: (url, body = null, options = {}) => request(url, { method: 'PUT', body, ...options }),
  patch: (url, body = null, options = {}) => request(url, { method: 'PATCH', body, ...options }),
  delete: (url, options = {}) => request(url, { method: 'DELETE', ...options }),
  request,

  // Session & Auth Utilities
  getToken: getStoredToken,
  setSession: setStoredSession,
  clearSession: clearStoredSession,

  // 0. System Diagnostics & Health
  system: {
    health: () => api.get('/api/v1/health'),
    root: () => api.get('/'),
  },

  // 1. Authentication
  auth: {
    login: (credentials) => api.post('/api/v1/auth/login', credentials),
    register: (userData) => api.post('/api/v1/auth/register', userData),
    getMe: () => api.get('/api/v1/auth/me'),
    logout: () => api.post('/api/v1/auth/logout'),
    refreshToken: () => api.post('/api/v1/auth/refresh'),
  },

  // 2. Staff Management (Admin Only)
  staff: {
    getAll: (params = {}) => api.get('/api/v1/staff', params, { fallback: [] }),
    getStats: () => api.get('/api/v1/staff/stats', null, { fallback: {} }),
    getById: (id) => api.get(`/api/v1/staff/${id}`, null, { fallback: null }),
    create: (data) => api.post('/api/v1/staff', data),
    update: (id, data) => api.patch(`/api/v1/staff/${id}`, data),
    delete: (id) => api.delete(`/api/v1/staff/${id}`),
    setStatus: (id, status) => api.patch(`/api/v1/staff/${id}/status`, { status }),
  },

  // 3. Farm, Herd & Processing
  farm: {
    // Animals / Herd
    getAnimals: (params = {}) => api.get('/api/farm/animals', params, { fallback: [] }),
    getAnimalStats: () => api.get('/api/farm/animals/stats', null, { fallback: {} }),
    getAnimalById: (id) => api.get(`/api/farm/animals/${id}`, null, { fallback: null }),
    createAnimal: (data) => api.post('/api/farm/animals', data),
    updateAnimal: (id, data) => api.patch(`/api/farm/animals/${id}`, data),
    deleteAnimal: (id) => api.delete(`/api/farm/animals/${id}`),

    // Milking Register
    getMilkingLogs: (params = {}) => api.get('/api/farm/milking-logs', params, { fallback: [] }),
    getDailyYieldSummary: (date) => api.get('/api/farm/milking-logs/daily-summary', { date }, { fallback: {} }),
    getMilkingLogById: (id) => api.get(`/api/farm/milking-logs/${id}`, null, { fallback: null }),
    createMilkingLog: (data) => api.post('/api/farm/milking-logs', data),
    updateMilkingLog: (id, data) => api.patch(`/api/farm/milking-logs/${id}`, data),
    deleteMilkingLog: (id) => api.delete(`/api/farm/milking-logs/${id}`),

    // Dahi & Dairy Processing
    getProcessingBatches: (params = {}) => api.get('/api/v1/processing', params, { fallback: [] }),
    getProcessingStats: () => api.get('/api/v1/processing/stats', null, { fallback: {} }),
    getProcessingBatchById: (id) => api.get(`/api/v1/processing/${id}`, null, { fallback: null }),
    createProcessingBatch: (data) => api.post('/api/v1/processing', data),
    updateProcessingBatch: (id, data) => api.patch(`/api/v1/processing/${id}`, data),
    deleteProcessingBatch: (id) => api.delete(`/api/v1/processing/${id}`),
  },

  // 4. Processing / Dahi Dedicated Module
  processing: {
    getAll: (params = {}) => api.get('/api/v1/processing', params, { fallback: [] }),
    getStats: () => api.get('/api/v1/processing/stats', null, { fallback: {} }),
    getById: (id) => api.get(`/api/v1/processing/${id}`, null, { fallback: null }),
    create: (data) => api.post('/api/v1/processing', data),
    update: (id, data) => api.patch(`/api/v1/processing/${id}`, data),
    delete: (id) => api.delete(`/api/v1/processing/${id}`),
  },

  // 5. Suppliers & Milk Intake
  suppliers: {
    getAll: (params = {}) => api.get('/api/v1/suppliers', params, { fallback: [] }),
    getStats: () => api.get('/api/v1/suppliers/stats', null, { fallback: {} }),
    getById: (id) => api.get(`/api/v1/suppliers/${id}`, null, { fallback: null }),
    create: (data) => api.post('/api/v1/suppliers', data),
    update: (id, data) => api.patch(`/api/v1/suppliers/${id}`, data),
    delete: (id) => api.delete(`/api/v1/suppliers/${id}`),

    // Procurements
    getProcurements: (params = {}) => api.get('/api/v1/suppliers/procurements', params, { fallback: [] }),
    getDailySummary: (date) => api.get('/api/v1/suppliers/procurements/daily-summary', { date }, { fallback: {} }),
    getProcurementById: (id) => api.get(`/api/v1/suppliers/procurements/${id}`, null, { fallback: null }),
    createProcurement: (data) => api.post('/api/v1/suppliers/procurements', data),
    updateProcurement: (id, data) => api.patch(`/api/v1/suppliers/procurements/${id}`, data),
  },

  // 6. Customers & Khata Ledger
  customers: {
    getAll: (params = {}) => api.get('/api/v1/customers', params, { fallback: [] }),
    search: (term) => api.get('/api/v1/customers/search', { q: term }, { fallback: [] }),
    getById: (id) => api.get(`/api/v1/customers/${id}`, null, { fallback: null }),
    create: (data) => api.post('/api/v1/customers', data),
    update: (id, data) => api.put(`/api/v1/customers/${id}`, data),
    delete: (id) => api.delete(`/api/v1/customers/${id}`),
    updateStatus: (id, status) => api.patch(`/api/v1/customers/${id}/status`, { status }),
    updateCreditLimit: (id, creditLimit) => api.patch(`/api/v1/customers/${id}/credit-limit`, { creditLimit }),
    getBalance: (id) => api.get(`/api/v1/customers/${id}/balance`, null, { fallback: { balance: 0 } }),
    getTransactions: (id, params = {}) => api.get(`/api/v1/customers/${id}/transactions`, params, { fallback: [] }),
  },

  // 7. Inventory & Products
  inventory: {
    getProducts: (params = {}) => api.get('/api/v1/inventory/products', params, { fallback: [] }),
    getProductStats: () => api.get('/api/v1/inventory/products/stats', null, { fallback: {} }),
    getLowStock: () => api.get('/api/v1/inventory/products/low-stock', null, { fallback: [] }),
    getProductById: (id) => api.get(`/api/v1/inventory/products/${id}`, null, { fallback: null }),
    createProduct: (data) => api.post('/api/v1/inventory/products', data),
    updateProduct: (id, data) => api.patch(`/api/v1/inventory/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/api/v1/inventory/products/${id}`),
  },

  // 8. POS (Point of Sale) & Orders
  pos: {
    getProducts: (params = {}) => api.get('/api/v1/inventory/products', params, { fallback: [] }),
    createProduct: (data) => api.post('/api/v1/inventory/products', data),
    updateProduct: (id, data) => api.patch(`/api/v1/inventory/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/api/v1/inventory/products/${id}`),

    // Orders
    getOrders: (params = {}) => api.get('/api/v1/pos/orders', params, { fallback: [] }),
    getOrderById: (id) => api.get(`/api/v1/pos/orders/${id}`, null, { fallback: null }),
    getOrderByReceipt: (receipt) => api.get(`/api/v1/pos/orders/receipt/${receipt}`, null, { fallback: null }),
    createOrder: (data) => api.post('/api/v1/pos/orders', data),
    cancelOrder: (id, reason) => api.post(`/api/v1/pos/orders/${id}/cancel`, { reason }),
    getDailySalesStats: (date) => api.get('/api/v1/pos/orders/stats/daily', { date }, { fallback: {} }),
  },

  // 9. Doorstep Deliveries & Fleet Management
  deliveries: {
    // Delivery Runs
    getDeliveries: (params = {}) => api.get('/api/v1/deliveries', params, { fallback: [] }),
    getDeliveryRuns: (params = {}) => api.get('/api/v1/deliveries/delivery-runs', params, { fallback: [] }),
    getDeliveryById: (id) => api.get(`/api/v1/deliveries/${id}`, null, { fallback: null }),
    createDelivery: (data) => api.post('/api/v1/deliveries', data),
    createBooking: (data) => api.post('/api/v1/deliveries/booking', data),
    updateDelivery: (id, data) => api.put(`/api/v1/deliveries/${id}`, data),
    deleteDelivery: (id) => api.delete(`/api/v1/deliveries/${id}`),
    assignRider: (id, data) => api.patch(`/api/v1/deliveries/${id}/assign`, data),
    updateDeliveryStatus: (id, status) => api.patch(`/api/v1/deliveries/${id}/status`, { status }),
    getRunSheet: (params = {}) => api.get('/api/v1/deliveries/run-sheet', params, { fallback: [] }),
    getStaff: (params = {}) => api.get('/api/v1/deliveries/staff', params, { fallback: [] }),

    // Vehicle Fuel Logs
    getFuelLogs: (params = {}) => api.get('/api/v1/deliveries/fuel-logs', params, { fallback: [] }),
    getFuelLogById: (id) => api.get(`/api/v1/deliveries/fuel-logs/${id}`, null, { fallback: null }),
    createFuelLog: (data) => api.post('/api/v1/deliveries/fuel-logs', data),
    updateFuelLog: (id, data) => api.put(`/api/v1/deliveries/fuel-logs/${id}`, data),
    deleteFuelLog: (id) => api.delete(`/api/v1/deliveries/fuel-logs/${id}`),
  },

  // 10. Finance, Khata Ledger & Operational Expenses
  finance: {
    // Khata
    getReceivablesAging: () => api.get('/api/v1/finance/khata/aging', null, { fallback: [] }),
    addKhataEntry: (data) => api.post('/api/v1/finance/khata/entries', data),
    getCustomerStatement: (customerId, params = {}) =>
      api.get(`/api/v1/finance/khata/${customerId}/statement`, params, { fallback: {} }),

    // Expenses
    getExpenses: (params = {}) => api.get('/api/v1/finance/expenses', params, { fallback: [] }),
    getExpenseSummary: (params = {}) => api.get('/api/v1/finance/expenses/summary', params, { fallback: {} }),
    createExpense: (data) => api.post('/api/v1/finance/expenses', data),
    updateExpense: (id, data) => api.patch(`/api/v1/finance/expenses/${id}`, data),
    deleteExpense: (id) => api.delete(`/api/v1/finance/expenses/${id}`),

    // Financial Overview
    getFinancialSummary: (params = {}) => api.get('/api/v1/finance/summary', params, { fallback: {} }),
  },

  // 11. Daily Closing & Cash/Stock Reconciliation
  dailyClosing: {
    getAll: (params = {}) => api.get('/api/v1/daily-closings', params, { fallback: [] }),
    getById: (id) => api.get(`/api/v1/daily-closings/${id}`, null, { fallback: null }),
    getByDate: (date) => api.get(`/api/v1/daily-closings/date/${date}`, null, { fallback: null }),
    create: (data) => api.post('/api/v1/daily-closings', data),
    reconcile: (id, data) => api.post(`/api/v1/daily-closings/${id}/reconcile`, data),
    approve: (id, data) => api.post(`/api/v1/daily-closings/${id}/approve`, data),
    reopen: (id, data) => api.post(`/api/v1/daily-closings/${id}/reopen`, data),
    getReport: (id) => api.get(`/api/v1/daily-closings/${id}/report`, null, { fallback: {} }),
  },

  // 12. Audit Trail & Activity Logs
  auditLogs: {
    getAll: (params = {}) => api.get('/api/v1/audit-logs', params, { fallback: [] }),
    getById: (id) => api.get(`/api/v1/audit-logs/${id}`, null, { fallback: null }),
    getByResource: (resource, resourceId) =>
      api.get(`/api/v1/audit-logs/resource/${resource}/${resourceId}`, null, { fallback: [] }),
    getStats: () => api.get('/api/v1/audit-logs/stats', null, { fallback: {} }),
    export: (params = {}) => api.get('/api/v1/audit-logs/export', params, { blob: true }),
    logEvent: (data) => api.post('/api/v1/audit-logs', data),
  },

  // 13. Administration & Role Management
  admin: {
    getStats: () => api.get('/api/v1/admin/stats', null, { fallback: {} }),
    getUsers: (params = {}) => api.get('/api/v1/admin/users', params, { fallback: [] }),
    getUserById: (id) => api.get(`/api/v1/admin/users/${id}`, null, { fallback: null }),
    createUser: (data) => api.post('/api/v1/admin/users', data),
    updateUser: (id, data) => api.put(`/api/v1/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/api/v1/admin/users/${id}`),
    setUserStatus: (id, isActive) => api.patch(`/api/v1/admin/users/${id}/status`, { isActive }),
    setUserRole: (id, role) => api.patch(`/api/v1/admin/users/${id}/role`, { role }),
    resetPassword: (id, newPassword) => api.patch(`/api/v1/admin/users/${id}/reset-password`, { newPassword }),
    getSettings: () => api.get('/api/v1/admin/settings', null, { fallback: {} }),
    updateSettings: (data) => api.put('/api/v1/admin/settings', data),

    // Staff Management Sub-namespace
    staff: {
      getAll: (params = {}) => api.get('/api/v1/admin/staff', params, { fallback: [] }),
      getStats: () => api.get('/api/v1/admin/staff/stats', null, { fallback: {} }),
      getById: (id) => api.get(`/api/v1/admin/staff/${id}`, null, { fallback: null }),
      create: (data) => api.post('/api/v1/admin/staff', data),
      update: (id, data) => api.patch(`/api/v1/admin/staff/${id}`, data),
      delete: (id) => api.delete(`/api/v1/admin/staff/${id}`),
      setStatus: (id, status) => api.patch(`/api/v1/admin/staff/${id}/status`, { status }),
    },
  },
};

export default api;
