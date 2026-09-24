/**
 * Role-Based Access Control (RBAC) Permissions & Role Mapping
 * Pure Milk Bar - Dairy ERP
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  FARM_SUPERVISOR: 'FARM_SUPERVISOR',
};

export const PERMISSIONS = {
  // POS & Counter Sales
  POS_ACCESS: 'pos:access',
  POS_CREATE_SALE: 'pos:create_sale',
  POS_APPLY_DISCOUNT: 'pos:apply_discount',
  POS_VIEW_ALL_SALES: 'pos:view_all_sales',

  // Farm & Milking Hub
  FARM_ACCESS: 'farm:access',
  FARM_LOG_MILKING: 'farm:log_milking',
  FARM_MANAGE_HERD: 'farm:manage_herd',
  FARM_FEEDING_HEALTH: 'farm:feeding_health',

  // Dahi & Milk Processing Hub
  PROCESSING_ACCESS: 'processing:access',
  PROCESSING_START_BATCH: 'processing:start_batch',
  PROCESSING_FINISH_YIELD: 'processing:finish_yield',

  // Suppliers & Procurement
  SUPPLIER_ACCESS: 'supplier:access',
  SUPPLIER_DOCK_INTAKE: 'supplier:dock_intake',
  SUPPLIER_PAYOUT: 'supplier:payout',

  // Customers & Khata
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_MANAGE_CREDIT: 'customer:manage_credit',

  // Staff & Workforce Management
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_EDIT: 'staff:edit',
  STAFF_DELETE: 'staff:delete',
  STAFF_VIEW_SALARY: 'staff:view_salary',
  STAFF_EDIT_SALARY: 'staff:edit_salary',
  STAFF_ATTENDANCE: 'staff:attendance',

  // Daily Closing & Audits
  CLOSING_COUNT_CASH: 'closing:count_cash',
  CLOSING_SUBMIT: 'closing:submit',
  CLOSING_APPROVE: 'closing:approve_lock',

  // Finance & Strategy
  FINANCE_VIEW_PNL: 'finance:view_pnl',
  FINANCE_EXPENSE_CREATE: 'finance:expense_create',
  FINANCE_EXPORT_AUDIT: 'finance:export_audit',

  // System Administration & Master Data
  ADMIN_USER_MANAGE: 'admin:user_manage',
  ADMIN_PRICING_CONFIG: 'admin:pricing_config',
  ADMIN_AUDIT_LOGS: 'admin:audit_logs',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions

  [ROLES.MANAGER]: [
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_CREATE_SALE,
    PERMISSIONS.POS_APPLY_DISCOUNT,
    PERMISSIONS.POS_VIEW_ALL_SALES,

    PERMISSIONS.FARM_ACCESS,
    PERMISSIONS.FARM_LOG_MILKING,
    PERMISSIONS.FARM_MANAGE_HERD,
    PERMISSIONS.FARM_FEEDING_HEALTH,

    PERMISSIONS.PROCESSING_ACCESS,
    PERMISSIONS.PROCESSING_START_BATCH,
    PERMISSIONS.PROCESSING_FINISH_YIELD,

    PERMISSIONS.SUPPLIER_ACCESS,
    PERMISSIONS.SUPPLIER_DOCK_INTAKE,

    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_MANAGE_CREDIT,

    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_EDIT,
    PERMISSIONS.STAFF_ATTENDANCE,
    // Note: STAFF_DELETE, STAFF_VIEW_SALARY, and STAFF_EDIT_SALARY excluded

    PERMISSIONS.CLOSING_COUNT_CASH,
    PERMISSIONS.CLOSING_SUBMIT,
    // Note: CLOSING_APPROVE excluded

    PERMISSIONS.FINANCE_EXPENSE_CREATE,
    // Note: FINANCE_VIEW_PNL, FINANCE_EXPORT_AUDIT excluded
  ],

  [ROLES.CASHIER]: [
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_CREATE_SALE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CLOSING_COUNT_CASH,
  ],

  [ROLES.FARM_SUPERVISOR]: [
    PERMISSIONS.FARM_ACCESS,
    PERMISSIONS.FARM_LOG_MILKING,
    PERMISSIONS.FARM_MANAGE_HERD,
    PERMISSIONS.FARM_FEEDING_HEALTH,

    PERMISSIONS.PROCESSING_ACCESS,
    PERMISSIONS.PROCESSING_START_BATCH,
    PERMISSIONS.PROCESSING_FINISH_YIELD,
  ],
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
};
