/**
 * @file components/common/AdminRoute.jsx
 * @description Route guard for admin-panel pages.
 * Allows both 'admin' and 'super-admin' roles through.
 * Redirects unauthorized users to /unauthorized.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['admin', 'super-admin'];

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
