import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { ScrollText, Loader2, ArrowRight, ShieldCheck, Crown, Shield } from 'lucide-react';

// ── Role badge (inline) ───────────────────────────────────────────────────────
const RoleChip = ({ role }) => {
  const config = {
    'super-admin': 'bg-amber-100 text-amber-700 border-amber-200',
    admin:         'bg-purple-100 text-purple-700 border-purple-200',
    user:          'bg-blue-100 text-blue-700 border-blue-200',
    none:          'bg-slate-100 text-slate-700 border-slate-200',
  };
  const labels = {
    'super-admin': 'Super Admin',
    admin:         'Admin',
    user:          'User',
    none:          'New User',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${config[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {labels[role] || role}
    </span>
  );
};

// ── Actor badge (who made the change) ────────────────────────────────────────
const ActorBadge = ({ changedBy }) => {
  if (!changedBy) return <span className="text-slate-400 text-sm italic">Unknown</span>;
  return (
    <div className="flex items-center gap-2">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${
        changedBy.role === 'super-admin'
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-purple-50 border-purple-200 text-purple-700'
      }`}>
        {changedBy.name?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{changedBy.name}</p>
        <p className="text-xs text-slate-500">{changedBy.email}</p>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const RoleLogsPage = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/api/users/role-logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load role change logs');
    } finally {
      setLoading(false);
    }
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
      {/* ── Page header ── */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <ScrollText className="text-amber-600" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role Change Audit Log</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            A complete history of every role change made in the system.
          </p>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Stats chip ── */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
          {logs.length} event{logs.length !== 1 ? 's' : ''} recorded
        </span>
      </div>

      {/* ── Logs table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Changed By</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Change</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Who changed it */}
                  <td className="px-6 py-4">
                    <ActorBadge changedBy={log.changedBy} />
                  </td>

                  {/* Target user */}
                  <td className="px-6 py-4">
                    {log.targetUser ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{log.targetUser.name}</p>
                        <p className="text-xs text-slate-500">{log.targetUser.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Deleted User</span>
                    )}
                  </td>

                  {/* Role change arrow */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <RoleChip role={log.previousRole} />
                      <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
                      <RoleChip role={log.newRole} />
                    </div>
                  </td>

                  {/* Note */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                      {log.note || '—'}
                    </p>
                  </td>

                  {/* Timestamp */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">
                      {new Date(log.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <ScrollText className="mx-auto mb-3 text-slate-300" size={40} />
                    <p className="text-slate-500 font-medium">No role changes recorded yet.</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Every future role change will appear here automatically.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleLogsPage;
