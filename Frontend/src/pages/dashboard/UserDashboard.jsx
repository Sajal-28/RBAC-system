import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h2>
        <p className="text-slate-500">Here's an overview of your account information.</p>
      </div>

      <div className="card max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold border-2 border-primary-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Mail size={18} className="text-slate-400" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Shield size={18} className="text-slate-400" />
            <span className="text-sm capitalize">{user?.role} Access Level</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link
            to="/profile"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Manage Profile <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
