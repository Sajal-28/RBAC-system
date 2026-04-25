import { useState } from 'react';
import API from '../../api/axios';
import { X, Loader2, AlertCircle } from 'lucide-react';

/**
 * EditUserModal — role dropdown is computed dynamically based on who is logged in.
 *
 * Role rules:
 *  super-admin  → can assign: admin | user  (never super-admin)
 *  admin        → can ONLY assign: admin  (promote user→admin, no demotion)
 */
const EditUserModal = ({ user, currentUser, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    role:  user?.role  || 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Compute allowed role options for the dropdown ─────────────────────────
  const getAllowedRoles = () => {
    if (currentUser?.role === 'super-admin') {
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'user',  label: 'User' },
      ];
    }
    if (currentUser?.role === 'admin') {
      return [
        { value: 'user',  label: 'User' },
        { value: 'admin', label: 'Admin' },
      ];
    }
    return [];
  };

  const allowedRoles     = getAllowedRoles();
  // Show the role section only if there are options available
  const showRoleDropdown = allowedRoles.length > 0 && user?.role !== 'super-admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.put(`/api/users/${user._id}`, formData);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
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
          <div>
            <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
            <p className="text-xs text-slate-500 mt-0.5">Editing: {user?.name}</p>
          </div>
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

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Full Name</label>
            <input
              type="text"
              required
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
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Role — conditionally rendered based on permission */}
          {showRoleDropdown ? (
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
          ) : (
            user?.role !== 'super-admin' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Role</label>
                <p className="text-sm text-slate-500 italic">Role cannot be changed from this view.</p>
              </div>
            )
          )}

          {/* Super-admin note */}
          {user?.role === 'super-admin' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-xs">
              Super Admin role is protected and cannot be modified.
            </div>
          )}

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
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
