/**
 * @file components/common/SuperAdminRoute.jsx
 * @description Route guard for super-admin-only pages (e.g. Role Logs).
 * Only users with role === 'super-admin' are allowed through.
 * Everyone else is redirected to /unauthorized.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SuperAdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'super-admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
