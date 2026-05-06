import React, { useState, useEffect } from 'react';

const Settings = ({ ADMIN_API, authHeaders, onLogout }) => {
  const [email, setEmail] = useState('admin@zenivio.com');
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
    promoBanner: { imageUrl: '', linkUrl: '', isActive: false },
    promoBanners: [
      { imageUrl: '', linkUrl: '', isActive: false },
      { imageUrl: '', linkUrl: '', isActive: false },
      { imageUrl: '', linkUrl: '', isActive: false }
    ],
    admobConfig: {
      bannerAdUnitId: '',
      interstitialAdUnitId: '',
      rewardedAdUnitId: '',
      appOpenAdUnitId: ''
    }
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
          promoBanner: data.promoBanner || prev.promoBanner,
          promoBanners: data.promoBanners?.length ? data.promoBanners : prev.promoBanners,
          admobConfig: data.admobConfig || prev.admobConfig
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
    { label: 'Admin Email', value: 'admin@zenivio.com', mono: false },
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

      {/* Promotional Banners Form */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-base mb-1">Earning Page Promo Banners</h3>
        <p className="text-slate-500 text-xs mb-5">Set up to 3 promotional banners that rotate above the Level 2 section.</p>

        <form onSubmit={handleUpdateSettings} className="space-y-6">
          {(globalSettings.promoBanners || []).map((banner, index) => (
            <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white text-sm font-bold">Banner {index + 1}</h4>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-6 bg-slate-800 rounded-full relative cursor-pointer border border-slate-700" 
                    onClick={() => {
                      const newBanners = [...globalSettings.promoBanners];
                      newBanners[index] = { ...newBanners[index], isActive: !newBanners[index].isActive };
                      setGlobalSettings({ ...globalSettings, promoBanners: newBanners });
                    }}
                  >
                    <div className={`absolute top-[1px] bottom-[1px] w-5 rounded-full transition-all ${banner.isActive ? 'right-[1px] bg-emerald-500' : 'left-[1px] bg-slate-500'}`}></div>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">{banner.isActive ? 'Active' : 'Hidden'}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Upload Banner Image</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 4 * 1024 * 1024) {
                          showToast('❌ Image too large (max 4MB)');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newBanners = [...globalSettings.promoBanners];
                          newBanners[index] = { ...newBanners[index], imageUrl: reader.result };
                          setGlobalSettings({ ...globalSettings, promoBanners: newBanners });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-slate-800 border-2 border-dashed border-slate-700 group-hover:border-indigo-500 rounded-xl px-4 py-6 text-center transition-colors">
                    <p className="text-slate-300 text-sm font-bold">Click to Upload Image</p>
                    <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-tighter">Recommended size: 468x200 px</p>
                  </div>
                </div>
              </div>

              {banner.imageUrl && (
                <div className="mt-2">
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                    <img src={banner.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Target Link URL</label>
                <input 
                  type="text" 
                  value={banner.linkUrl || ''} 
                  onChange={(e) => {
                    const newBanners = [...globalSettings.promoBanners];
                    newBanners[index] = { ...newBanners[index], linkUrl: e.target.value };
                    setGlobalSettings({ ...globalSettings, promoBanners: newBanners });
                  }}
                  placeholder="e.g. /referrals, /leaderboard or https://..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2 text-white text-sm outline-none" 
                />
                <p className="text-slate-500 text-[10px] mt-1">Leave empty if not clickable. Starts with / for app pages, http for external.</p>
              </div>
            </div>
          ))}

          <button type="submit" disabled={settingsLoading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95">
            {settingsLoading ? 'Saving...' : 'Update Promotional Banners'}
          </button>
        </form>
      </div>

      {/* AdMob Configuration */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-base mb-1">AdMob Configuration</h3>
        <p className="text-slate-500 text-xs mb-5">Enter your AdMob Ad Unit IDs to display real ads in the app. Leave empty to show test ads.</p>

        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Banner Ad Unit ID</label>
              <input 
                type="text" 
                value={globalSettings.admobConfig?.bannerAdUnitId || ''} 
                onChange={(e) => setGlobalSettings({...globalSettings, admobConfig: {...globalSettings.admobConfig, bannerAdUnitId: e.target.value}})}
                placeholder="ca-app-pub-xxxxx/xxxxx"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Interstitial Ad Unit ID</label>
              <input 
                type="text" 
                value={globalSettings.admobConfig?.interstitialAdUnitId || ''} 
                onChange={(e) => setGlobalSettings({...globalSettings, admobConfig: {...globalSettings.admobConfig, interstitialAdUnitId: e.target.value}})}
                placeholder="ca-app-pub-xxxxx/xxxxx"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Rewarded Ad Unit ID</label>
              <input 
                type="text" 
                value={globalSettings.admobConfig?.rewardedAdUnitId || ''} 
                onChange={(e) => setGlobalSettings({...globalSettings, admobConfig: {...globalSettings.admobConfig, rewardedAdUnitId: e.target.value}})}
                placeholder="ca-app-pub-xxxxx/xxxxx"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">App Open Ad Unit ID</label>
              <input 
                type="text" 
                value={globalSettings.admobConfig?.appOpenAdUnitId || ''} 
                onChange={(e) => setGlobalSettings({...globalSettings, admobConfig: {...globalSettings.admobConfig, appOpenAdUnitId: e.target.value}})}
                placeholder="ca-app-pub-xxxxx/xxxxx"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" 
              />
            </div>
          </div>
          
          <button type="submit" disabled={settingsLoading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95">
            {settingsLoading ? 'Saving...' : 'Update AdMob Settings'}
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
            <div className="text-slate-400 text-sm">admin@zenivio.com</div>
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
