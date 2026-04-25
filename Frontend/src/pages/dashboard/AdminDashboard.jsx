import { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Users, Edit, Trash2, Loader2,
  ShieldCheck, Shield, Crown, UserPlus
} from 'lucide-react';
import EditUserModal from '../../components/common/EditUserModal';
import CreateUserModal from '../../components/common/CreateUserModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Role badge helper ─────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const config = {
    'super-admin': {
      cls: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: <Crown size={12} />,
      label: 'Super Admin',
    },
    admin: {
      cls: 'bg-purple-100 text-purple-700 border border-purple-200',
      icon: <ShieldCheck size={12} />,
      label: 'Admin',
    },
    user: {
      cls: 'bg-blue-100 text-blue-700 border border-blue-200',
      icon: <Shield size={12} />,
      label: 'User',
    },
  };

  const { cls, icon, label } = config[role] || config.user;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colour }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`p-4 ${colour} rounded-xl`}>
      <Icon size={24} className="text-current" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [users, setUsers]                 = useState([]);
  const [stats, setStats]                 = useState({ totalUsers: 0, adminUsers: 0, regularUsers: 0 });
  const [loading, setLoading]             = useState(true);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [isEditModalOpen, setEditOpen]    = useState(false);
  const [isCreateModalOpen, setCreateOpen] = useState(false);
  const [deleteError, setDeleteError]     = useState('');

  const { user: currentUser, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isUsersView = location.pathname === '/admin/users';

  useEffect(() => { fetchData(); }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/api/users'),
        API.get('/api/users/stats'),
      ]);
      setUsers(usersRes.data.users || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setDeleteError('');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/api/users/${userId}`);
      const currentUserId = currentUser?.id || currentUser?._id;
      if (currentUserId === userId) {
        await logout();
        navigate('/login');
        return;
      }
      await fetchData();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  // ── Decide which actions to render per row ────────────────────────────────
  const renderActions = (rowUser) => {
    const currentId    = currentUser?.id || currentUser?._id;
    const isSelf       = rowUser._id === currentId;
    const isSuperAdmin = rowUser.role === 'super-admin';

    // Nobody can touch a super-admin row
    if (isSuperAdmin) {
      return (
        <span className="text-xs font-medium text-amber-600 italic px-2">
          Protected
        </span>
      );
    }

    // Cannot edit/delete own row from here
    if (isSelf) {
      return (
        <span className="text-xs font-medium text-slate-400 italic px-2">
          You
        </span>
      );
    }



    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => openEditModal(rowUser)}
          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          title="Edit User"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => handleDelete(rowUser._id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Delete User"
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Registered Users"
          value={stats.totalUsers || 0}
          colour="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={ShieldCheck}
          label="Administrators"
          value={stats.adminUsers || 0}
          colour="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Shield}
          label="Regular Users"
          value={stats.regularUsers || 0}
          colour="bg-blue-50 text-blue-600"
        />
      </div>

      {/* ── Delete error banner ── */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {deleteError}
        </div>
      )}

      {/* ── Users Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isUsersView ? 'User Management' : 'System User Directory'}
          </h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <UserPlus size={18} />
            Add New User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* User info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border text-sm ${
                        u.role === 'super-admin'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : u.role === 'admin'
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <RoleBadge role={u.role} />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {renderActions(u)}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {isEditModalOpen && (
        <EditUserModal
          user={selectedUser}
          currentUser={currentUser}
          isOpen={isEditModalOpen}
          onClose={() => setEditOpen(false)}
          onUpdate={fetchData}
        />
      )}

      {isCreateModalOpen && (
        <CreateUserModal
          currentUser={currentUser}
          isOpen={isCreateModalOpen}
          onClose={() => setCreateOpen(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
