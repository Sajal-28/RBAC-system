import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  LogOut, 
  ShieldCheck,
  ScrollText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── Nav links per role ────────────────────────────────────────────────────
  const superAdminLinks = [
    { name: 'Dashboard',  path: '/admin/dashboard',  icon: LayoutDashboard },
    { name: 'Users',      path: '/admin/users',       icon: Users },
    { name: 'Audit Logs',  path: '/admin/change-logs',   icon: ScrollText },
    { name: 'Profile',    path: '/profile',            icon: UserCircle },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users',     path: '/admin/users',     icon: Users },
    { name: 'Profile',   path: '/profile',          icon: UserCircle },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile',  icon: UserCircle },
  ];

  const links =
    user?.role === 'super-admin' ? superAdminLinks :
    user?.role === 'admin'       ? adminLinks :
    userLinks;

  // ── Role badge colours ────────────────────────────────────────────────────
  const roleBadge = {
    'super-admin': 'bg-amber-100 text-amber-700',
    admin:         'bg-purple-100 text-purple-700',
    user:          'bg-blue-100 text-blue-700',
  };

  const roleLabel = {
    'super-admin': 'Super Admin',
    admin:         'Admin',
    user:          'User',
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-lg">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight">RBAC Secure</span>
      </div>

      {/* Logged-in user chip */}
      <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
        <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[user?.role] || 'bg-slate-100 text-slate-600'}`}>
          {roleLabel[user?.role] || user?.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <link.icon size={20} />
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
