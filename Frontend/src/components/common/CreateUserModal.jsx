import React, { useState } from 'react';
import API from '../../api/axios';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * CreateUserModal — role dropdown options depend on who is creating the user.
 *
 * super-admin → can create admin | user
 * admin       → can only create user
 */
const CreateUserModal = ({ currentUser, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name:     '',
    email:    '',
    password: '',
    role:     'user',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Roles this caller may assign
  const allowedRoles =
    currentUser?.role === 'super-admin' || currentUser?.role === 'admin'
      ? [{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]
      : [{ value: 'user', label: 'User' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/api/users', formData);
      setSuccess('User created successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Create New User</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-100">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Email Address</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Assign Role</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {allowedRoles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
