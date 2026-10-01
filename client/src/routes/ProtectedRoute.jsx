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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-white tracking-tight">Pure Milk Bar</p>
          <p className="text-xs text-slate-400 font-medium">Authenticating Dairy Operations Engine...</p>
        </div>
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
