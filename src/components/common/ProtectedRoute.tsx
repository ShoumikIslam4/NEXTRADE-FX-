import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionCategory } from '../../types/admin';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
  requiredPermission?: PermissionCategory;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requiredPermission
}) => {
  const { user, loading, isAuthenticated, isStaffOrAdmin, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login with return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Require staff/admin role
  if (requireAdmin && !isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111827] border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">403 — Unauthorized Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have permission to access the Administrator Back-Office suite. This area is strictly restricted to authorized <strong className="text-amber-400">Admin &amp; Staff</strong> personnel.
          </p>
          <div className="pt-2">
            <Link
              to="/trader/overview"
              className="inline-block px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Return to Trader Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Require granular permission category
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111827] border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">403 — Restricted Module</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your assigned role (<strong className="text-white font-mono">{user.role}</strong>) does not include the <strong className="text-amber-400">{requiredPermission}</strong> permission. Contact Super Administrator to request access.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/admin/overview"
              className="inline-block px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
            >
              Admin Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
