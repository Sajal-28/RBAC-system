import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import AdminRoute from './components/common/AdminRoute';
import SuperAdminRoute from './components/common/SuperAdminRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import RoleLogsPage from './pages/dashboard/RoleLogsPage';
import MyProfile from './pages/profile/MyProfile';
import Unauthorized from './pages/error/Unauthorized';
import NotFound from './pages/error/NotFound';
import { useAuth } from './context/AuthContext';

/**
 * Root redirect: sends users to the correct dashboard based on their role.
 */
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'super-admin' || user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes — only accessible when NOT logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes (all authenticated users) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* User dashboard — regular users land here */}
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<MyProfile />} />

              {/* Admin + Super Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard />} />
              </Route>

              {/* Super Admin only routes */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/admin/role-logs" element={<RoleLogsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
