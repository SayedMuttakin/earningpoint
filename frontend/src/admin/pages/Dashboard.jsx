import React, { useState, useEffect } from 'react';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-white font-black text-2xl leading-none">{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1 font-medium">{sub}</div>}
    </div>
  </div>
);

const Dashboard = ({ ADMIN_API, authHeaders }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/stats`, { headers: authHeaders });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span className="text-slate-400 font-medium">Loading dashboard...</span>
      </div>
    </div>
  );

  if (!stats) return <div className="text-rose-400">Failed to load stats</div>;

  const maxBarVal = Math.max(...(stats.last7Days?.map(d => d.users) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">Overview of your platform</p>
        <button onClick={fetchStats} className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers?.toLocaleString()} sub={`+${stats.todayUsers} today`}
          color="bg-indigo-600/20" icon={<svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <StatCard label="Total Transactions" value={stats.totalTransactions?.toLocaleString()} sub={`${stats.pendingWithdrawals} pending withdrawal`}
          color="bg-emerald-600/20" icon={<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} />
        <StatCard label="Support Tickets" value={stats.openTickets?.toLocaleString()} sub="Open / In Progress"
          color="bg-amber-600/20" icon={<svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard label="Premium Orders" value={stats.pendingPremiumOrders?.toLocaleString()} sub="Pending activation"
          color="bg-purple-600/20" icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance" value={`৳${(stats.totalBalance || 0).toLocaleString()}`} sub="All users combined"
          color="bg-teal-600/20" icon={<svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Total Revenue" value={`৳${(stats.revenue || 0).toLocaleString()}`} sub="Points + bonuses"
          color="bg-rose-600/20" icon={<svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <StatCard label="Referrals" value={stats.totalReferrals?.toLocaleString()} sub="Total referral chains"
          color="bg-cyan-600/20" icon={<svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard label="Premium Users" value={stats.premiumUsers?.toLocaleString()} sub={`${stats.bannedUsers} banned`}
          color="bg-violet-600/20" icon={<svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
      </div>

      {/* Chart + Recents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-4">New Users — Last 7 Days</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.last7Days?.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-slate-500 text-[10px] font-bold">{d.users}</div>
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all"
                  style={{ height: `${Math.max((d.users / maxBarVal) * 100, 4)}%` }}
                />
                <div className="text-slate-600 text-[9px] font-bold text-center">{d.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-4">Recent Sign-ups</h3>
          <div className="space-y-3">
            {stats.recentUsers?.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {(u.name || u.phoneOrEmail || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-bold truncate">{u.name || 'No Name'}</div>
                  <div className="text-slate-500 text-[10px] truncate">{u.phoneOrEmail}</div>
                </div>
                <div className="text-emerald-400 text-xs font-bold flex-shrink-0">৳{u.balance || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-base mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider pb-2">User</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider pb-2">Type</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider pb-2">Amount</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider pb-2">Status</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stats.recentTransactions?.map((t, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-white font-medium text-xs">{t.userId?.name || t.userId?.phoneOrEmail || '—'}</td>
                  <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.type === 'withdrawal' ? 'bg-rose-500/20 text-rose-400' :
                    t.type === 'referral_bonus' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>{t.type}</span></td>
                  <td className="py-2.5 text-white font-bold text-xs">৳{t.amount}</td>
                  <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    t.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>{t.status}</span></td>
                  <td className="py-2.5 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
