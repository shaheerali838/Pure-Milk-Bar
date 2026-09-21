/**
 * Pure Milk Bar Enterprise ERP - Centralized API Client
 * Automatically manages Authorization headers, query strings, and normalized error responses.
 */

const STORAGE_KEY = 'pmb_auth_session_v2';

function getStoredToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch (e) {
    console.error('Failed to read auth token for API request:', e);
  }
  return null;
}

async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    params = null,
    headers = {},
    ...customConfig
  } = options;

  let url = endpoint.startsWith('http') ? endpoint : endpoint;

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

  const config = {
    method,
    headers: reqHeaders,
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // If 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (typeof data === 'object' && (data.message || data.error)) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (options.fallback !== undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[API ${method}] ${url} unavailable (${error.message}). Using fallback.`);
      }
      return options.fallback;
    }
    // Log in development
    if (import.meta.env.DEV) {
      console.warn(`[API ${method}] ${url} failed:`, error.message);
    }
    throw error;
  }
}

export const api = {
  get: (url, params = null, options = {}) => request(url, { method: 'GET', params, ...options }),
  post: (url, body = null, options = {}) => request(url, { method: 'POST', body, ...options }),
  put: (url, body = null, options = {}) => request(url, { method: 'PUT', body, ...options }),
  patch: (url, body = null, options = {}) => request(url, { method: 'PATCH', body, ...options }),
  delete: (url, options = {}) => request(url, { method: 'DELETE', ...options }),
};

export default api;
