import React, { useState, useEffect, useCallback } from 'react';

const Referrals = ({ ADMIN_API, authHeaders }) => {
  const [referrals, setReferrals] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/referrals?page=${page}&limit=15`, { headers: authHeaders });
      const data = await res.json();
      setReferrals(data.referrals || []);
      setTotal(data.total || 0);
      setTotalBonus(data.totalBonus || 0);
      setPages(Math.ceil((data.total || 0) / 15));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Referrals</div>
            <div className="text-white font-black text-2xl">{total}</div>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Bonus Paid</div>
            <div className="text-white font-black text-2xl">৳{totalBonus?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-white font-bold text-sm">Referral Chain</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Referrer</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Referred</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Bonus</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center">
                  <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              ) : referrals.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium">No referrals found</td></tr>
              ) : referrals.map(r => (
                <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                        {(r.referrerId?.name || r.referrerId?.phoneOrEmail || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-xs font-semibold truncate">{r.referrerId?.name || 'Unknown'}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[100px]">{r.referrerId?.phoneOrEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                        {(r.referredUserId?.name || r.referredUserId?.phoneOrEmail || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-xs font-semibold truncate">{r.referredUserId?.name || 'Unknown'}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[100px]">{r.referredUserId?.phoneOrEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-emerald-400 font-bold text-sm">৳{r.bonusAwarded}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
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

export default Referrals;
