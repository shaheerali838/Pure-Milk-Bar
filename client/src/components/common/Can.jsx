import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';

/**
 * Declarative RBAC permission & role rendering gate
 * Usage:
 *   <Can do="staff:delete"> <button>Delete Staff</button> </Can>
 *   <Can role="ADMIN"> <SalaryInput /> </Can>
 *   <Can anyRole={['ADMIN', 'MANAGER']}> <ManagerPanel /> </Can>
 */
export const Can = ({
  do: permission,
  role,
  anyRole = [],
  fallback = null,
  children,
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user || !user.role) {
    return fallback;
  }

  // Admin always has universal access
  if (user.role === ROLES.ADMIN) {
    return children;
  }

  // Role check
  if (role && user.role !== role) {
    return fallback;
  }

  // Any role check
  if (anyRole.length > 0 && !anyRole.includes(user.role)) {
    return fallback;
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  return children;
};

export default Can;
