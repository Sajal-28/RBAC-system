import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-2xl mb-6">
          <ShieldAlert className="text-red-600" size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to={user ? dashboardLink : '/login'}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
