import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { ScrollText, Loader2, ArrowRight, ShieldCheck, Crown, Shield, PlusCircle, Pencil, Trash2, UserCog } from 'lucide-react';

// ── Action badge (inline) ───────────────────────────────────────────────────────
const ActionBadge = ({ action }) => {
  const config = {
    'CREATE':      { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: PlusCircle, label: 'Created' },
    'UPDATE':      { bg: 'bg-blue-100',  text: 'text-blue-700',  border: 'border-blue-200',  icon: Pencil,     label: 'Updated' },
    'DELETE':      { bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-red-200',   icon: Trash2,     label: 'Deleted' },
    'ROLE_CHANGE': { bg: 'bg-purple-100',text: 'text-purple-700',border: 'border-purple-200',icon: UserCog,    label: 'Role Change' },
  };
  
  const style = config[action] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: Shield, label: action };
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <Icon size={14} />
      {style.label}
    </span>
  );
};

// ── Actor badge (who made the change) ────────────────────────────────────────
const ActorBadge = ({ changedBy }) => {
  if (!changedBy) return <span className="text-slate-400 text-sm italic">Unknown / System</span>;
  return (
    <div className="flex items-center gap-2">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${
        changedBy.role === 'super-admin'
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : changedBy.role === 'admin'
            ? 'bg-purple-50 border-purple-200 text-purple-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
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

// ── Target badge (who was changed) ───────────────────────────────────────────
const TargetBadge = ({ targetUser, fallbackName, fallbackEmail }) => {
  if (targetUser) {
    return (
      <div>
        <p className="text-sm font-semibold text-slate-800">{targetUser.name}</p>
        <p className="text-xs text-slate-500">{targetUser.email}</p>
      </div>
    );
  }
  
  if (fallbackName || fallbackEmail) {
    return (
      <div>
        <p className="text-sm font-semibold text-slate-600 line-through">{fallbackName || 'Unknown'}</p>
        <p className="text-xs text-slate-400">{fallbackEmail || 'Unknown'}</p>
      </div>
    );
  }

  return <span className="text-slate-400 text-sm italic">Deleted User</span>;
};


// ── Main page ─────────────────────────────────────────────────────────────────
const ChangeLogsPage = () => {
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
      const res = await API.get('/api/users/change-logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load change logs');
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
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
          <ScrollText className="text-indigo-600" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            A comprehensive history of all creations, updates, deletions, and role changes.
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Changed By</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Action */}
                  <td className="px-6 py-4">
                    <ActionBadge action={log.action} />
                  </td>

                  {/* Who changed it */}
                  <td className="px-6 py-4">
                    <ActorBadge changedBy={log.changedBy} />
                  </td>

                  {/* Target user */}
                  <td className="px-6 py-4">
                    <TargetBadge 
                      targetUser={log.targetUser} 
                      fallbackName={log.targetUserName} 
                      fallbackEmail={log.targetUserEmail} 
                    />
                  </td>

                  {/* Note / Details */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 font-medium max-w-sm leading-relaxed">
                      {log.description || '—'}
                    </p>
                  </td>

                  {/* Timestamp */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 whitespace-nowrap">
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
                    <p className="text-slate-500 font-medium">No system changes recorded yet.</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Every future action will appear here automatically.
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

export default ChangeLogsPage;
