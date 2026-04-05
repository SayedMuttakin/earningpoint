import React, { useState, useEffect } from 'react';

const PremiumIpSettings = ({ ADMIN_API, authHeaders }) => {
  const [globalSettings, setGlobalSettings] = useState({
    bkashNumber: '',
    nagadNumber: '',
    rocketNumber: '',
    premiumIpPackages: []
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/settings/global`, { headers: authHeaders });
      const data = await res.json();
      if (data) setGlobalSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/settings/global`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(globalSettings)
      });
      if (res.ok) {
        showToast('✅ Settings updated successfully!');
      } else {
        showToast('❌ Failed to update settings');
      }
    } catch (error) {
      showToast('❌ Error updating settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const addPackage = () => {
    const newPackage = {
      id: `pkg-${Date.now()}`,
      price: 0,
      duration: '',
      freeDays: '',
      offTag: ''
    };
    setGlobalSettings({
      ...globalSettings,
      premiumIpPackages: [...globalSettings.premiumIpPackages, newPackage]
    });
  };

  const removePackage = (id) => {
    setGlobalSettings({
      ...globalSettings,
      premiumIpPackages: globalSettings.premiumIpPackages.filter(p => p.id !== id)
    });
  };

  const updatePackage = (id, field, value) => {
    setGlobalSettings({
      ...globalSettings,
      premiumIpPackages: globalSettings.premiumIpPackages.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-500">Loading settings...</div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Numbers */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-base mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Payment Phone Numbers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">bKash Number</label>
              <input 
                type="text" 
                value={globalSettings.bkashNumber} 
                onChange={(e) => setGlobalSettings({...globalSettings, bkashNumber: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Nagad Number</label>
              <input 
                type="text" 
                value={globalSettings.nagadNumber} 
                onChange={(e) => setGlobalSettings({...globalSettings, nagadNumber: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Rocket Number</label>
              <input 
                type="text" 
                value={globalSettings.rocketNumber} 
                onChange={(e) => setGlobalSettings({...globalSettings, rocketNumber: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* IP Packages */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Premium IP Packages
            </h3>
            <button 
              type="button" 
              onClick={addPackage}
              className="px-4 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-600/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
              + Add Package
            </button>
          </div>

          <div className="space-y-4">
            {globalSettings.premiumIpPackages.map((pkg, idx) => (
              <div key={pkg.id || idx} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 relative group transition-all hover:border-slate-600">
                <button 
                  type="button" 
                  onClick={() => removePackage(pkg.id)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
                  <div>
                    <label className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1 block">Price (৳)</label>
                    <input 
                      type="number" 
                      value={pkg.price} 
                      onChange={(e) => updatePackage(pkg.id, 'price', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1 block">Duration</label>
                    <input 
                      type="text" 
                      value={pkg.duration} 
                      placeholder="e.g. 1 Month"
                      onChange={(e) => updatePackage(pkg.id, 'duration', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1 block">Free Bonus</label>
                    <input 
                      type="text" 
                      value={pkg.freeDays} 
                      placeholder="e.g. +7 Days free"
                      onChange={(e) => updatePackage(pkg.id, 'freeDays', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1 block">Promo Tag</label>
                    <input 
                      type="text" 
                      value={pkg.offTag} 
                      placeholder="e.g. 15% OFF"
                      onChange={(e) => updatePackage(pkg.id, 'offTag', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            {globalSettings.premiumIpPackages.length === 0 && (
              <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-sm italic">
                No packages added. Click "+ Add Package" to start.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saveLoading}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 min-w-[200px]"
          >
            {saveLoading ? 'Saving Changes...' : 'Save IP Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PremiumIpSettings;
