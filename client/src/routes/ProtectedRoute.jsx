import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProtectedRoute = ({ allowedRoles = null, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Verifying Session Authorization...</p>
      </div>
    );
  }

  // If not logged in, redirect to /login and remember current route
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    const hasPermission = allowedRoles.map((r) => r.toUpperCase()).includes(userRole);

    if (!hasPermission) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            Your current role (<span className="font-semibold text-emerald-700">{user.roleLabel || user.role}</span>) does not have sufficient clearance to access this module.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Go Back
            </Button>
            <Button
              type="button"
              onClick={() => window.location.href = '/dashboard'}
              className="text-xs bg-[#00a86b] hover:bg-[#008f5b] text-white"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }
  }

  // If authenticated and authorized, render outlet or children
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
