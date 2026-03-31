import React, { useState, useEffect, useCallback } from 'react';

const packageLabels = {
  'month-1': '1 Month (+7 Days free)',
  'month-3': '3 Months (+15 Days free)',
  'month-6': '6 Months (+1 Month free)',
  'year-1': '1 Year (+2 Months free)',
};

const PremiumOrders = ({ ADMIN_API, authHeaders }) => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${ADMIN_API}/premium-orders?${params}`, { headers: authHeaders });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrder = async (id, status) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`${ADMIN_API}/premium-orders/${id}`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`✅ Order ${status}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setActionLoading(''); }
  };

  const methodColors = {
    bkash: 'bg-pink-600/20 text-pink-400',
    nagad: 'bg-orange-600/20 text-orange-400',
    rocket: 'bg-purple-600/20 text-purple-400',
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500">
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Package</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Method</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Txn ID</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500 font-medium">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-semibold text-xs">{o.userId?.name || 'Unknown'}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[100px]">{o.userId?.phoneOrEmail}</div>
                    {o.userId?.isPremium && <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">Premium ✓</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-white text-xs font-medium">{o.packageName || packageLabels[o.packageId] || o.packageId}</div>
                    {o.country && <div className="text-slate-500 text-[10px]">{o.country}</div>}
                  </td>
                  <td className="px-5 py-3 text-emerald-400 font-bold text-sm">৳{o.amount}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${methodColors[o.paymentMethod] || ''}`}>{o.paymentMethod}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <code className="text-slate-400 text-[10px] bg-slate-800/50 px-2 py-0.5 rounded font-mono">{o.transactionId}</code>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      o.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {o.status === 'pending' ? (
                      <button onClick={() => { setSelectedOrder(o); setAdminNote(''); }}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-bold text-[10px] rounded-lg transition-colors">
                        Review
                      </button>
                    ) : (
                      <span className="text-slate-600 text-xs">{o.adminNote ? `Note: ${o.adminNote}` : '—'}</span>
                    )}
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

      {/* Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-10 bg-[#111827] border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold">Review Order</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Order Details */}
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">User</span>
                  <span className="text-white font-bold">{selectedOrder.userId?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Package</span>
                  <span className="text-white font-bold">{selectedOrder.packageName || packageLabels[selectedOrder.packageId] || selectedOrder.packageId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Amount</span>
                  <span className="text-emerald-400 font-bold">৳{selectedOrder.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Method</span>
                  <span className="text-white font-bold capitalize">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Txn ID</span>
                  <code className="text-indigo-400 font-mono text-xs">{selectedOrder.transactionId}</code>
                </div>
                {selectedOrder.country && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Country</span>
                    <span className="text-white font-bold">{selectedOrder.country}</span>
                  </div>
                )}
              </div>

              {/* Address Details */}
              {(selectedOrder.division || selectedOrder.district || selectedOrder.thana || selectedOrder.village || selectedOrder.postalCode) && (
                <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 space-y-2">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">📍 Location Details</p>
                  {[
                    { label: 'Division', value: selectedOrder.division },
                    { label: 'District', value: selectedOrder.district },
                    { label: 'Thana', value: selectedOrder.thana },
                    { label: 'Village', value: selectedOrder.village },
                    { label: 'Postal Code', value: selectedOrder.postalCode },
                  ].filter(f => f.value).map(field => (
                    <div key={field.label} className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">{field.label}</span>
                      <span className="text-white font-bold">{field.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Admin Note (optional)</label>
                <input type="text" value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  placeholder="Rejection reason or note..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => updateOrder(selectedOrder._id, 'rejected')}
                  disabled={!!actionLoading}
                  className="flex-1 py-3 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-600/30 text-rose-400 font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {actionLoading.includes('rejected') ? '...' : '✕ Reject'}
                </button>
                <button
                  onClick={() => updateOrder(selectedOrder._id, 'approved')}
                  disabled={!!actionLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {actionLoading.includes('approved') ? '...' : '✓ Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumOrders;
