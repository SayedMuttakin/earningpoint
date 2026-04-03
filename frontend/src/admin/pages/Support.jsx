import React, { useState, useEffect, useCallback } from 'react';
import AdminChatWindow from '../components/AdminChatWindow';
import { MessageSquare, Zap, Loader2, Bot, User, ChevronRight } from 'lucide-react';

const statusColors = {
  open: 'bg-amber-500/20 text-amber-400',
  in_progress: 'bg-indigo-500/20 text-indigo-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/20 text-slate-400',
  active: 'bg-emerald-500/20 text-emerald-400',
};

const Support = ({ ADMIN_API, authHeaders }) => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'live'
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Live Chat States
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionTotal, setSessionTotal] = useState(0);

  const [replyMsg, setReplyMsg] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchTickets = useCallback(async () => {
    if (activeTab !== 'tickets') return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${ADMIN_API}/support?${params}`, { headers: authHeaders });
      const data = await res.json();
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, statusFilter, activeTab, ADMIN_API, authHeaders]);

  const fetchSessions = useCallback(async () => {
    if (activeTab !== 'live') return;
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/chat-sessions`, { headers: authHeaders });
      const data = await res.json();
      setSessions(data.sessions || []);
      setSessionTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeTab, ADMIN_API, authHeaders]);

  useEffect(() => { 
    if (activeTab === 'tickets') fetchTickets();
    else fetchSessions();
  }, [activeTab, fetchTickets, fetchSessions]);

  const openTicket = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/support/${id}`, { headers: authHeaders });
      const data = await res.json();
      setSelectedTicket(data);
      setNewStatus(data.status);
      setReplyMsg('');
    } catch (e) { console.error(e); }
  };

  const sendReply = async () => {
    if (!replyMsg.trim() && newStatus === selectedTicket.status) return;
    setActionLoading(true);
    try {
      const body = {};
      if (replyMsg.trim()) body.message = replyMsg.trim();
      if (newStatus !== selectedTicket.status) body.status = newStatus;
      const res = await fetch(`${ADMIN_API}/support/${selectedTicket._id}`, {
        method: 'PUT', headers: authHeaders, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('✅ Ticket updated successfully');
      setSelectedTicket(null);
      fetchTickets();
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6 pb-20">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast}</div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#111827] p-1 rounded-2xl w-fit border border-slate-800">
        <button 
          onClick={() => { setActiveTab('tickets'); setPage(1); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MessageSquare className="w-4 h-4" /> Support Tickets
        </button>
        <button 
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'live' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Zap className="w-4 h-4" /> Live Support 
          {sessionTotal > 0 && activeTab !== 'live' && (
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-1" />
          )}
        </button>
      </div>

      {activeTab === 'tickets' ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[#111827] border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Subject</th>
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Replies</th>
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
                    <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center">
                      <Loader2 className="animate-spin w-8 h-8 text-indigo-500 mx-auto" />
                    </td></tr>
                  ) : tickets.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No tickets found</td></tr>
                  ) : tickets.map(t => (
                    <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-white font-semibold text-xs">{t.userId?.name || 'Unknown'}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[100px]">{t.userId?.phoneOrEmail}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-white text-xs font-medium truncate max-w-[150px]">{t.subject}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{t.message?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[t.status] || ''}`}>{t.status}</span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-slate-400 text-xs">{t.replies?.length || 0} replies</td>
                      <td className="px-5 py-3 hidden md:table-cell text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openTicket(t._id)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-bold text-[10px] rounded-lg transition-colors">
                          Reply
                        </button>
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
      ) : (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">User</th>
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Last Message</th>
                    <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
                    <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center">
                      <Loader2 className="animate-spin w-8 h-8 text-emerald-500 mx-auto" />
                    </td></tr>
                  ) : sessions.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium">No live sessions found</td></tr>
                  ) : sessions.map(s => (
                    <tr key={s._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-white font-semibold text-xs">{s.name}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{s.email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {s.status === 'active' ? (s.adminJoined ? 'In Chat' : 'Waiting') : 'Closed'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-slate-400 text-xs truncate max-w-[200px]">
                        {s.messages[s.messages.length - 1]?.content || 'No messages'}
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setSelectedSession(s)}
                          className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-black text-[11px] rounded-xl transition-all flex items-center gap-2 ml-auto shadow-sm">
                          {s.status === 'active' ? (s.adminJoined ? 'View Chat' : 'Join Chat') : 'View History'}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedSession && (
        <AdminChatWindow 
          session={selectedSession} 
          onClose={() => { setSelectedSession(null); fetchSessions(); }}
          API_BASE={ADMIN_API}
        />
      )}

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Subject</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Replies</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center">
                  <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No tickets found</td></tr>
              ) : tickets.map(t => (
                <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-semibold text-xs">{t.userId?.name || 'Unknown'}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[100px]">{t.userId?.phoneOrEmail}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-white text-xs font-medium truncate max-w-[150px]">{t.subject}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{t.message?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[t.status] || ''}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-slate-400 text-xs">{t.replies?.length || 0} replies</td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openTicket(t._id)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-bold text-[10px] rounded-lg transition-colors">
                      Reply
                    </button>
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

      {/* Ticket Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <div className="relative z-10 bg-[#111827] border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-sm">{selectedTicket.subject}</h3>
                <p className="text-slate-500 text-xs">{selectedTicket.userId?.name} · {selectedTicket.userId?.phoneOrEmail}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
              {/* Original message */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">U</div>
                  <span className="text-slate-400 text-xs font-bold">User · Original Message</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{selectedTicket.message}</p>
              </div>

              {/* Replies */}
              {selectedTicket.replies?.map((r, i) => (
                <div key={i} className={`rounded-xl p-4 ${r.isAdmin ? 'bg-indigo-900/30 border border-indigo-800/50 ml-4' : 'bg-slate-800/50 mr-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${r.isAdmin ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                      {r.isAdmin ? 'A' : 'U'}
                    </div>
                    <span className="text-slate-400 text-xs font-bold">{r.isAdmin ? 'Admin' : 'User'}</span>
                    <span className="text-slate-600 text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{r.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <div className="border-t border-slate-800 p-5 flex-shrink-0 space-y-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <textarea
                value={replyMsg}
                onChange={e => setReplyMsg(e.target.value)}
                placeholder="Type your admin reply..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setSelectedTicket(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={sendReply} disabled={actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                  {actionLoading ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
