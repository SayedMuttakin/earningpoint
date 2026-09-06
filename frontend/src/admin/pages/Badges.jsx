import React, { useState, useEffect, useCallback } from 'react';

const Badges = ({ ADMIN_API, authHeaders }) => {
  const [usersList, setUsersList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Selection state
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState('none');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Fetch currently verified users
  const fetchVerifiedUsers = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${ADMIN_API}/users?filter=verified&limit=100`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Failed to fetch verified users');
    } finally {
      setLoadingList(false);
    }
  }, [ADMIN_API, authHeaders]);

  useEffect(() => {
    fetchVerifiedUsers();
  }, [fetchVerifiedUsers]);

  // Search users autocomplete handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${ADMIN_API}/users?search=${encodeURIComponent(searchQuery)}&limit=8`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, ADMIN_API, authHeaders]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedBadge(user.verificationBadge || 'none');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUpdateBadge = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ verificationBadge: selectedBadge }),
      });
      
      if (!res.ok) throw new Error((await res.json()).message);
      
      showToast(`✅ Verification badge updated successfully!`);
      setSelectedUser(null);
      fetchVerifiedUsers();
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeBadge = async (user) => {
    if (!window.confirm(`Are you sure you want to remove the verification badge from ${user.name || 'User'}?`)) return;
    try {
      const res = await fetch(`${ADMIN_API}/users/${user._id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ verificationBadge: 'none' }),
      });
      
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`✅ Verification badge revoked`);
      fetchVerifiedUsers();
    } catch (e) {
      showToast('❌ ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assign Badge Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col space-y-5">
          <div>
            <h2 className="text-white font-black text-sm uppercase tracking-wider">Assign Verification Badge</h2>
            <p className="text-xs text-slate-500 mt-1">Search for any user to grant or remove a verification badge.</p>
          </div>

          {/* User Search Bar */}
          <div className="relative">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Search User</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 text-sm font-medium outline-none transition-colors"
              />
              {searching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                {searchResults.map(u => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="p-3 hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-white text-xs font-bold">{u.name || 'No Name'}</div>
                      <div className="text-[10px] text-slate-500">{u.phoneOrEmail}</div>
                    </div>
                    {u.verificationBadge && u.verificationBadge !== 'none' && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${u.verificationBadge === 'golden' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {u.verificationBadge === 'blue' ? 'purple' : u.verificationBadge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected User Actions Panel */}
          {selectedUser ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {(selectedUser.name || selectedUser.phoneOrEmail || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-xs font-black">{selectedUser.name || 'No Name'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{selectedUser.phoneOrEmail}</div>
                </div>
              </div>

              {/* Badge selector options */}
              <div className="space-y-2.5">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Select Badge Style</label>
                
                <div className="grid grid-cols-3 gap-2">
                  {/* None Option */}
                  <button
                    onClick={() => setSelectedBadge('none')}
                    className={`py-2 px-3 rounded-lg border text-center text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedBadge === 'none'
                        ? 'bg-slate-800 border-slate-600 text-white shadow-md'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-800/30'
                    }`}
                  >
                    <span>❌</span>
                    <span>No Badge</span>
                  </button>

                  {/* Purple Option */}
                  <button
                    onClick={() => setSelectedBadge('purple')}
                    className={`py-2 px-3 rounded-lg border text-center text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedBadge === 'purple' || selectedBadge === 'blue'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:text-purple-400 hover:bg-slate-800/30'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-purple-500 text-white inline-block flex-shrink-0" fill="currentColor">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill="#7c3aed"/>
                      <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
                    </svg>
                    <span>Purple</span>
                  </button>

                  {/* Gold Option */}
                  <button
                    onClick={() => setSelectedBadge('golden')}
                    className={`py-2 px-3 rounded-lg border text-center text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedBadge === 'golden'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:text-amber-400 hover:bg-slate-800/30'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-500 text-white inline-block flex-shrink-0" fill="currentColor">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill="#EAB308"/>
                      <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
                    </svg>
                    <span>Golden</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBadge}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-40"
                >
                  {actionLoading ? 'Saving...' : 'Update Badge'}
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs font-semibold">
              No user selected. Search and select a user above to get started.
            </div>
          )}
        </div>

        {/* Badged Users List */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
          <div>
            <h2 className="text-white font-black text-sm uppercase tracking-wider">Currently Verified Users</h2>
            <p className="text-xs text-slate-500 mt-1">Review and manage accounts that currently hold a verified badge.</p>
          </div>

          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-800/80 pr-1">
            {loadingList ? (
              <div className="py-12 text-center">
                <svg className="animate-spin w-6 h-6 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-semibold">No badged users found</div>
            ) : (
              usersList.map(u => (
                <div key={u._id} className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-2 rounded-xl transition-colors">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-xs">
                      {(u.name || u.phoneOrEmail || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-xs font-extrabold flex items-center gap-1.5">
                        {u.name || 'No Name'}
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${u.verificationBadge === 'golden' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {u.verificationBadge === 'blue' ? 'purple' : (u.verificationBadge || 'purple')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px]">{u.phoneOrEmail}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeBadge(u)}
                    className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/25 text-rose-400 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
