import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Admin Overview';
    if (path.includes('/admin/users')) return 'User Management';
    if (path.includes('/dashboard')) return 'User Dashboard';
    if (path.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900">{user?.name}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
