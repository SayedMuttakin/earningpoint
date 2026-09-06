import React, { useState, useEffect } from 'react';

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard & Analytics', category: 'Overview', desc: 'Real-time stats, revenue, and user analytics' },
  { id: 'users', label: 'User Management', category: 'Core', desc: 'View, edit balances, ban or verify users' },
  { id: 'transactions', label: 'Transactions & Withdrawals', category: 'Core', desc: 'Approve or reject withdrawal requests' },
  { id: 'support', label: 'Support & Live Chat', category: 'Support', desc: 'Respond to support tickets and chat with users' },
  { id: 'referrals', label: 'Referrals Management', category: 'Growth', desc: 'Audit user referral chains and bonuses' },
  { id: 'posts', label: 'Posts Moderation', category: 'Content', desc: 'Review, delete and manage community posts' },
  { id: 'articles', label: 'News & Articles', category: 'Content', desc: 'Publish and manage knowledge base articles' },
  { id: 'missions', label: 'Weekly Missions', category: 'Gamification', desc: 'Create and edit weekly task missions' },
  { id: 'products', label: 'Digital Products', category: 'Store', desc: 'Manage digital product catalog and inventory' },
  { id: 'announcements', label: 'Announcements', category: 'Communications', desc: 'Broadcast global alerts to users' },
  { id: 'verifications', label: 'ID Verifications', category: 'Security', desc: 'Review KYC and profile verification requests' },
  { id: 'badges', label: 'Member Badges', category: 'Community', desc: 'Grant special achievement badges to users' },
  { id: 'database', label: 'Database & Maintenance', category: 'System', desc: 'Export backups, sync media, or clear data' },
  { id: 'settings', label: 'Platform Settings', category: 'System', desc: 'Manage global app fees, rates, and limits' },
];

const AdminManagement = ({ authHeaders, ADMIN_API }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);

  // Add form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [selectedPermissions, setSelectedPermissions] = useState([
    'dashboard', 'users', 'transactions', 'support'
  ]);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('admin');
  const [editPermissions, setEditPermissions] = useState([]);
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${ADMIN_API}/sub-admins`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admin list');
      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword(generateRandomPassword());
    setRole('admin');
    setSelectedPermissions(['dashboard', 'users', 'transactions', 'support']);
    setShowAddModal(true);
    setSuccessMsg('');
    setError('');
  };

  const handleOpenEdit = (admin) => {
    setEditAdmin(admin);
    setEditName(admin.name || '');
    setEditRole(admin.role || 'admin');
    setEditPermissions(admin.permissions || []);
    setEditPassword('');
    setEditIsActive(admin.isActive !== false);
    setSuccessMsg('');
    setError('');
  };

  const handleTogglePermission = (permId, isEdit = false) => {
    if (isEdit) {
      setEditPermissions(prev =>
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
      );
    } else {
      setSelectedPermissions(prev =>
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
      );
    }
  };

  const handleSelectAll = (isEdit = false) => {
    const all = ALL_PERMISSIONS.map(p => p.id);
    if (isEdit) setEditPermissions(all);
    else setSelectedPermissions(all);
  };

  const handleDeselectAll = (isEdit = false) => {
    if (isEdit) setEditPermissions([]);
    else setSelectedPermissions([]);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${ADMIN_API}/sub-admins`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          permissions: role === 'super_admin' ? ALL_PERMISSIONS.map(p => p.id) : selectedPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create admin');

      setSuccessMsg(`Admin appointed! Credentials and duties email dispatched to ${email}`);
      setShowAddModal(false);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editAdmin) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        name: editName,
        role: editRole,
        permissions: editRole === 'super_admin' ? ALL_PERMISSIONS.map(p => p.id) : editPermissions,
        isActive: editIsActive,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`${ADMIN_API}/sub-admins/${editAdmin._id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update admin');

      setSuccessMsg(`Admin profile for ${editAdmin.email} updated successfully!`);
      setEditAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`Are you sure you want to permanently revoke admin access for ${admin.name} (${admin.email})?`)) {
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${ADMIN_API}/sub-admins/${admin._id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete admin');

      setSuccessMsg(`Admin access revoked for ${admin.email}`);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Admin &amp; Sub-Admin Management</h2>
                <p className="text-slate-400 text-xs mt-0.5">Control role-based privileges, create staff accounts, and dispatch automated invitations.</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New Admin
          </button>
        </div>
      </div>

      {/* Alert notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Admin Table Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Administrators</h3>
            <span className="px-2 py-0.5 text-[11px] font-black bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full">
              {admins.length}
            </span>
          </div>
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading administrators...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            No administrators found. Click "Add New Admin" to appoint one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/70 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Admin Profile</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Permitted Modules</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Last Login</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {admins.map((admin) => {
                  const isSuper = admin.role === 'super_admin';
                  return (
                    <tr key={admin._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md ${
                            isSuper
                              ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 border border-amber-400/40'
                              : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                          }`}>
                            {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="text-white font-bold flex items-center gap-2">
                              {admin.name}
                              {isSuper && (
                                <span className="text-amber-400 text-xs" title="Super Administrator">👑</span>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs font-mono">{admin.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                            Sub-Admin
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        {isSuper ? (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            Full Unrestricted Access
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(admin.permissions || []).length > 0 ? (
                              admin.permissions.map((p) => (
                                <span
                                  key={p}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700"
                                >
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">No modules granted</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {admin.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : 'Never'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs font-bold rounded-lg transition-colors border border-rose-800/40"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !actionLoading && setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Appoint New Administrator</h3>
                <p className="text-slate-400 text-xs mt-0.5">The new admin will automatically receive an invitation email with credentials and assigned duties.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAdmin} className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@zenivio.com"
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temporary Password</label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateRandomPassword())}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      🎲 Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Level</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                  >
                    <option value="admin">Sub-Admin (Assigned Modules Only)</option>
                    <option value="super_admin">Super Admin (Full System Control)</option>
                  </select>
                </div>
              </div>

              {/* Permissions selector (if Sub-Admin) */}
              {role === 'admin' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assigned Duties &amp; Modules</label>
                      <p className="text-slate-500 text-xs">Choose which sections this admin will manage.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll(false)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-800 px-2.5 py-1 rounded"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeselectAll(false)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {ALL_PERMISSIONS.map(perm => {
                      const checked = selectedPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(perm.id, false)}
                            className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="text-xs">
                            <div className="font-bold text-slate-200">{perm.label}</div>
                            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{perm.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating &amp; Sending Email...
                    </>
                  ) : (
                    'Appoint Admin & Dispatch Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !actionLoading && setEditAdmin(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Edit Administrator</h3>
                <p className="text-slate-400 text-xs mt-0.5">Modifying permissions and account status for {editAdmin.email}</p>
              </div>
              <button
                onClick={() => setEditAdmin(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateAdmin} className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Level</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                  >
                    <option value="admin">Sub-Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reset Password (leave empty to keep)</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="New password (optional)"
                    className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Status</label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={editIsActive}
                        onChange={() => setEditIsActive(true)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-emerald-400">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={!editIsActive}
                        onChange={() => setEditIsActive(false)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs font-bold text-rose-400">Suspended</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Permissions selector (if Sub-Admin) */}
              {editRole === 'admin' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assigned Duties &amp; Modules</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll(true)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-800 px-2.5 py-1 rounded"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeselectAll(true)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {ALL_PERMISSIONS.map(perm => {
                      const checked = editPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(perm.id, true)}
                            className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="text-xs">
                            <div className="font-bold text-slate-200">{perm.label}</div>
                            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{perm.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;