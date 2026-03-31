import React, { useState, useEffect, useCallback } from 'react';

const Transactions = ({ ADMIN_API, authHeaders }) => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${ADMIN_API}/transactions?${params}`, { headers: authHeaders });
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const updateStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`${ADMIN_API}/transactions/${id}`, {
        method: 'PUT', headers: authHeaders, body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`✅ Transaction ${status}`);
      fetchTransactions();
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setActionLoading(''); }
  };

  const typeColors = {
    earning: 'bg-emerald-500/20 text-emerald-400',
    withdrawal: 'bg-rose-500/20 text-rose-400',
    referral_bonus: 'bg-cyan-500/20 text-cyan-400',
    purchase: 'bg-purple-500/20 text-purple-400',
  };
  const statusColors = {
    completed: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/20 text-amber-400',
    failed: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500">
          <option value="">All Types</option>
          <option value="earning">Earning</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="referral_bonus">Referral Bonus</option>
          <option value="purchase">Purchase</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-[#111827] border border-slate-800 rounded-xl px-4">
          Total: <span className="text-white font-bold">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500 font-medium">No transactions found</td></tr>
              ) : transactions.map(t => (
                <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-semibold text-xs">{t.userId?.name || 'Unknown'}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[100px]">{t.userId?.phoneOrEmail}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[t.type] || 'bg-slate-500/20 text-slate-400'}`}>{t.type}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs max-w-[150px]">
                    <div className="truncate">{t.description || '—'}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-bold text-sm ${t.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {t.type === 'withdrawal' ? '-' : '+'}৳{t.amount}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[t.status] || ''}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {t.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={actionLoading === t._id + 'completed'}
                          onClick={() => updateStatus(t._id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold text-[10px] rounded-lg transition-colors disabled:opacity-50"
                        >Approve</button>
                        <button
                          disabled={actionLoading === t._id + 'failed'}
                          onClick={() => updateStatus(t._id, 'failed')}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 font-bold text-[10px] rounded-lg transition-colors disabled:opacity-50"
                        >Reject</button>
                      </div>
                    )}
                    {t.status !== 'pending' && <span className="text-slate-600 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <span className="text-slate-500 text-xs font-medium">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors">Prev</button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
