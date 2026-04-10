import React, { useState, useEffect } from 'react';

const Settings = ({ ADMIN_API, authHeaders, onLogout }) => {
  const [email, setEmail] = useState('admin@zenvio.com');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({
    premiumIpPrice: 600,
    premiumIpDuration: '30 Days',
    bkashNumber: '01700-000000',
    nagadNumber: '01700-000000',
    rocketNumber: '01700-000000',
    promoBanner: { imageUrl: '', linkUrl: '', isActive: false }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/settings/global`, { headers: authHeaders });
      const data = await res.json();
      if (data) {
        setGlobalSettings(prev => ({
          ...prev,
          ...data,
          promoBanner: data.promoBanner || prev.promoBanner
        }));
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/settings/global`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(globalSettings)
      });
      if (res.ok) {
        showToast('✅ Global settings updated successfully!');
      } else {
        showToast('❌ Failed to update settings');
      }
    } catch (error) {
      showToast('❌ Error updating settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { showToast('❌ Passwords do not match'); return; }
    if (newPass.length < 6) { showToast('❌ Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      showToast('✅ To change admin password, update ADMIN_PASSWORD in your backend .env file and restart the server.');
    } finally {
      setLoading(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  const infoRows = [
    { label: 'API Base URL', value: ADMIN_API.replace('/api/admin', ''), mono: true },
    { label: 'Admin Email', value: 'admin@zenvio.com', mono: false },
    { label: 'JWT Expires', value: '7 days', mono: false },
    { label: 'Referral Bonus', value: '৳60 per side', mono: false },
    { label: 'Coin Rate', value: '1000 pts = ৳50', mono: false },
    { label: 'Min Withdrawal', value: '৳1000', mono: false },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl max-w-sm ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast}</div>
      )}

      {/* App Info */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-base mb-4">App Configuration</h3>
        <div className="space-y-3">
          {infoRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <span className="text-slate-400 text-sm font-medium">{row.label}</span>
              {row.mono
                ? <code className="text-indigo-400 text-xs bg-slate-800/50 px-3 py-1 rounded-lg font-mono">{row.value}</code>
                : <span className="text-white text-sm font-bold">{row.value}</span>
              }
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-amber-400 text-xs font-medium leading-relaxed">
            ⚠️ To change these values, update your backend <code className="font-mono">.env</code> file and restart the server.
          </p>
        </div>
      </div>

      {/* Promotional Banner Form */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-base mb-1">Earning Page Promo Banner</h3>
        <p className="text-slate-500 text-xs mb-5">Set a promotional banner that appears above the Level 1 ad section.</p>

        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-6 bg-slate-800 rounded-full relative cursor-pointer border border-slate-700" 
              onClick={() => setGlobalSettings({...globalSettings, promoBanner: {...(globalSettings.promoBanner || {}), isActive: !globalSettings.promoBanner?.isActive}})}
            >
              <div className={`absolute top-[1px] bottom-[1px] w-5 rounded-full transition-all ${globalSettings.promoBanner?.isActive ? 'right-[1px] bg-emerald-500' : 'left-[1px] bg-slate-500'}`}></div>
            </div>
            <span className="text-slate-300 text-sm font-bold">{globalSettings.promoBanner?.isActive ? 'Banner Active' : 'Banner Hidden'}</span>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Image URL</label>
            <input type="url" value={globalSettings.promoBanner?.imageUrl || ''} onChange={e => setGlobalSettings({...globalSettings, promoBanner: {...(globalSettings.promoBanner || {}), imageUrl: e.target.value}})} placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Target Link URL</label>
            <input type="url" value={globalSettings.promoBanner?.linkUrl || ''} onChange={e => setGlobalSettings({...globalSettings, promoBanner: {...(globalSettings.promoBanner || {}), linkUrl: e.target.value}})} placeholder="https://where-to-go.com"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
          </div>
          <button type="submit" disabled={settingsLoading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95">
            {settingsLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-base mb-1">Change Admin Password</h3>
        <p className="text-slate-500 text-xs mb-5">Updating password here will show you instructions. Actual changes require .env update.</p>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Current Password</label>
            <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">New Password</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Confirm New Password</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Processing...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Admin Info */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-base mb-4">Admin Account</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">A</div>
          <div>
            <div className="text-white font-black text-base">Admin</div>
            <div className="text-slate-400 text-sm">admin@zenvio.com</div>
            <div className="mt-1">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">SUPER ADMIN</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-3 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-600/30 text-rose-400 font-bold rounded-xl transition-all"
        >
          Sign Out of Admin Panel
        </button>
      </div>
    </div>
  );
};

export default Settings;
