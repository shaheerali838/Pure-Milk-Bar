export const API_ENDPOINTS = {
  // 01. Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
  },

  // 02. Users & Branches
  USERS: '/users',
  BRANCHES: '/branches',

  // 03. Livestock & Yield
  LIVESTOCK: '/livestock',
  YIELD: '/yield',

  // 04. Suppliers & Procurement
  SUPPLIERS: '/suppliers',
  PROCUREMENT: '/procurement',

  // 05. Products & Inventory
  PRODUCTS: '/products',
  INVENTORY: '/inventory',
  PROCESSING: '/processing',

  // 06. Customers & Khata
  CUSTOMERS: '/customers',
  KHATA: '/khata',

  // 07. Subscriptions & Deliveries
  SUBSCRIPTIONS: '/subscriptions',
  DELIVERIES: '/deliveries',
  ROUTES: '/deliveries/routes',

  // 08. POS & Sales
  POS: '/pos',
  SALES: '/sales',

  // 09. Financial & Closing
  EXPENSES: '/expenses',
  DAILY_CLOSING: '/daily-closing',
  LEDGER: '/ledger',

  // 10. Reports & Audits
  REPORTS: '/reports',
  AUDIT: '/audit',
  NOTIFICATIONS: '/notifications',
};