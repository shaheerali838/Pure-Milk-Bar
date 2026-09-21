import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute
 * RBAC role restrictions removed per project instruction.
 * Allows open access to all modules once signed in.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to /login and remember current route
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // RBAC bypassed - all signed in users have unrestricted access
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
