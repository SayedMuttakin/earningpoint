import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, X, Send, AlertCircle, Coins, Target } from 'lucide-react';

const Missions = ({ authHeaders, ADMIN_API }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMission, setNewMission] = useState({ 
    title: '', 
    description: '', 
    rewardCoins: 50, 
    actionUrl: '',
    isActive: true 
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/weekly-missions`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setMissions(data);
      } else {
        setMissions([]);
      }
    } catch (err) {
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newMission.title.trim()) return setError('Title is required');
    if (!newMission.description.trim()) return setError('Description is required');
    if (!newMission.actionUrl.trim()) return setError('Action URL is required');

    try {
      const res = await fetch(`${ADMIN_API}/weekly-missions`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission),
      });

      if (res.ok) {
        setSuccess('Mission published successfully!');
        setNewMission({ 
          title: '', 
          description: '', 
          rewardCoins: 50, 
          actionUrl: '',
          isActive: true
        });
        setIsAdding(false);
        fetchMissions();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create mission');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleDeleteMission = async (id) => {
    if (!window.confirm('Delete this mission?')) return;
    try {
      const res = await fetch(`${ADMIN_API}/weekly-missions/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) fetchMissions();
    } catch (err) {
      console.error('Error deleting mission:', err);
    }
  };

  const toggleMissionStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${ADMIN_API}/weekly-missions/${id}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) fetchMissions();
    } catch (err) {
      console.error('Error toggling mission:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Weekly Missions</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Create and manage weekly missions for users.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black shadow-xl transition-all w-full sm:w-auto active:scale-95 ${
            isAdding 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
          }`}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Add Mission'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl" />
          
          <form onSubmit={handleCreateMission} className="space-y-6 relative z-10">
            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Mission Title</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                placeholder="e.g., Subscribe to our YouTube Channel"
                value={newMission.title}
                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Coins Reward</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    value={newMission.rewardCoins}
                    onChange={(e) => setNewMission({ ...newMission, rewardCoins: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Action URL</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="url"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                    placeholder="https://..."
                    value={newMission.actionUrl}
                    onChange={(e) => setNewMission({ ...newMission, actionUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Description / Instructions</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[150px] transition-all text-base leading-relaxed placeholder:text-slate-600 font-serif"
                placeholder="Explain what the user needs to do..."
                value={newMission.description}
                onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              Create Mission
            </button>
          </form>
        </div>
      )}

      {/* Mission List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse" />
          ))
        ) : (
          missions.map(mission => (
            <div
              key={mission._id}
              className={`bg-slate-900 border ${mission.isActive ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-slate-800 opacity-70'} rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all group gap-4`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black shadow-inner ${mission.isActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg uppercase tracking-tight line-clamp-1">
                    {mission.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                      <Coins className="w-3 h-3" /> +{mission.rewardCoins} Coins
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${mission.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {mission.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{mission.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => toggleMissionStatus(mission._id, mission.isActive)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                    mission.isActive 
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  }`}
                >
                  {mission.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteMission(mission._id)}
                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-95"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && missions.length === 0 && (
        <div className="py-24 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] animate-fade-in">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600">
            <Target className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No missions discovered</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">Start by creating the first weekly mission for users.</p>
        </div>
      )}
    </div>
  );
};

export default Missions;
