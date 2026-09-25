import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/rbac.config';

/**
 * ProtectedRoute with enterprise RBAC role and permission guards
 */
export const ProtectedRoute = ({
  allowedRoles = [],
  requiredPermission,
  children,
}) => {
  const { isAuthenticated, user, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Authenticating Dairy Operations Engine...</p>
      </div>
    );
  }

  // If not authenticated, redirect to /login and preserve return URL
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ADMIN bypasses all route restrictions
  if (user.role === ROLES.ADMIN) {
    return children ? children : <Outlet />;
  }

  // Role check
  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    // Redirect to their default permitted landing page
    if (user.role === ROLES.CASHIER) {
      return <Navigate to="/pos" replace />;
    }
    if (user.role === ROLES.FARM_SUPERVISOR) {
      return <Navigate to="/farm" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Granular Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (user.role === ROLES.CASHIER) {
      return <Navigate to="/pos" replace />;
    }
    if (user.role === ROLES.FARM_SUPERVISOR) {
      return <Navigate to="/farm" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
