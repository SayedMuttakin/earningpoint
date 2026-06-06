import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Database,
  HelpCircle,
  FileText,
  LogOut,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  X,
  Search,
  Rocket,
  Palette,
  Headphones,
  MessageCircle
} from 'lucide-react';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';

const SettingsPage = ({ 
  darkMode, 
  onToggleDarkMode, 
  onLogout, 
  onBack, 
  onPasswordClick, 
  onLanguageClick, 
  onTermsClick, 
  onDeleteClick, 
  onNotificationClick,
  onSupportClick
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditName(data.name || '');
        setEditEmail(data.phoneOrEmail || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, email: editEmail })
      });
      if (res.ok) {
        setShowProfileModal(false);
        fetchProfile();
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const sections = [
    {
      id: 'group1',
      items: [
        { 
          id: 'account_settings', 
          icon: User, 
          color: 'bg-violet-100 dark:bg-violet-950/45 text-violet-650 dark:text-violet-400', 
          label: '1. Account Settings', 
          sub: 'Manage your profile, security and account', 
          action: () => setShowProfileModal(true),
          isFilled: true
        },
        { 
          id: 'notifications', 
          icon: Bell, 
          color: 'bg-amber-100 dark:bg-amber-950/45 text-amber-650 dark:text-amber-400', 
          label: '2. Notifications', 
          sub: 'Control alerts and notification preferences', 
          action: () => onNotificationClick && onNotificationClick(),
          isFilled: true
        },
        { 
          id: 'privacy', 
          icon: Shield, 
          color: 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-650 dark:text-emerald-400', 
          label: '3. Privacy', 
          sub: 'Manage privacy and visibility settings', 
          action: onTermsClick,
          isFilled: true
        },
        { 
          id: 'messenger', 
          icon: MessageCircle, 
          color: 'bg-blue-100 dark:bg-blue-950/45 text-blue-650 dark:text-blue-400', 
          label: '4. Messenger', 
          sub: 'Chat and messaging preferences', 
          action: () => alert('Messenger preferences are synced with your chat settings!'),
          isFilled: true
        },
      ]
    },
    {
      id: 'group2',
      items: [
        { 
          id: 'performance', 
          icon: Rocket, 
          color: 'bg-purple-100 dark:bg-purple-950/45 text-purple-650 dark:text-purple-450', 
          label: '5. App Performance', 
          sub: 'Data saver, optimization and app performance', 
          action: () => alert('App performance is automatically optimized for your device!'),
          isFilled: true
        },
        { 
          id: 'storage', 
          icon: Database, 
          color: 'bg-sky-100 dark:bg-sky-950/45 text-sky-655 dark:text-sky-400', 
          label: '6. Storage & Data', 
          sub: 'Manage storage, data usage and cache', 
          action: () => alert('Storage and Cache management feature is coming soon!'),
          isFilled: true
        },
        { 
          id: 'appearance', 
          icon: Palette, 
          color: 'bg-pink-100 dark:bg-pink-950/45 text-pink-650 dark:text-pink-400', 
          label: '7. Appearance', 
          sub: 'Theme, dark mode and language', 
          action: () => setShowAppearanceModal(true),
          isFilled: true
        },
      ]
    },
    {
      id: 'group3',
      items: [
        { 
          id: 'support', 
          icon: Headphones, 
          color: 'bg-green-100 dark:bg-green-950/45 text-green-650 dark:text-green-400', 
          label: '8. Help & Support', 
          sub: 'Get help, report issues and more', 
          action: onSupportClick,
          isFilled: true
        },
        { 
          id: 'actions', 
          icon: LogOut, 
          color: 'bg-rose-100 dark:bg-rose-950/45 text-rose-650 dark:text-rose-450', 
          label: '9. Account Actions', 
          sub: 'Logout or delete your account', 
          action: () => setShowActionsModal(true),
          isFilled: false
        },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-55 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="min-h-screen bg-slate-55 dark:bg-slate-950 pb-32">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-30 bg-slate-55/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-900">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200/55 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-355 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-extrabold text-sm text-slate-855 dark:text-slate-100">Settings</h2>
          <div className="w-10 h-10" />
        </div>

        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Main Title Section with Search button */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-855 dark:text-white">Settings</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">Manage your account and app preferences</p>
            </div>
            
            <button 
              onClick={() => alert('Search feature is coming soon!')}
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-150/40 dark:border-slate-800 flex items-center justify-center text-[#7C3AED] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Cards Groups */}
          <div className="space-y-5">
            {sections.map((group) => (
              <div 
                key={group.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150/40 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col w-full"
              >
                {group.items.map((item, idx) => (
                  <button 
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                        <item.icon 
                          className="w-5.5 h-5.5" 
                          fill={item.isFilled ? 'currentColor' : 'none'} 
                          strokeWidth={item.isFilled ? 0 : 2.4}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-[15px] text-slate-855 dark:text-slate-200 block truncate">{item.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate mt-0.5">{item.sub}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" strokeWidth={3} />
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-505 font-bold tracking-wide">Zenivio v2.1.0 • Built with ❤️</p>
          </div>
        </div>
      </div>

      {/* Account Settings / Personal Info Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            onClick={() => setShowProfileModal(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          />
          <div 
            className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-fade-in-up"
          >
            <div className="px-5 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-855 dark:text-white">Account Settings</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-55/40 dark:bg-slate-850 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-450 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/50"
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-55/40 dark:bg-slate-850 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-450 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/55"
                  placeholder="Enter email"
                />
              </div>
              
              <button 
                type="submit"
                disabled={updateLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-black rounded-2xl shadow-md shadow-indigo-650/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {updateLoading ? 'Saving changes...' : 'Save Changes'}
              </button>

              {/* Password Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    onPasswordClick();
                  }}
                  className="w-full py-3 bg-slate-55 dark:bg-slate-950 dark:hover:bg-slate-900/60 text-slate-800 dark:text-white rounded-2xl font-black border border-slate-150/40 dark:border-slate-800 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer shadow-3xs"
                >
                  <Lock className="w-4 h-4 text-[#7C3AED]" /> Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appearance Settings Modal */}
      {showAppearanceModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            onClick={() => setShowAppearanceModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-xs animate-fade-in"
          />
          <div 
            className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-fade-in-up"
          >
            <div className="px-5 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-855 dark:text-white">Appearance Settings</h3>
              <button 
                onClick={() => setShowAppearanceModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950 text-[#7C3AED]">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-855 dark:text-white">Dark Mode</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Adjust dark and light modes</p>
                  </div>
                </div>
                
                <button 
                  onClick={onToggleDarkMode}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-[#7C3AED]' : 'bg-slate-250 dark:bg-slate-800'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-50 dark:bg-teal-950 text-teal-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-855 dark:text-white">Language</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Select app language preferences</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setShowAppearanceModal(false);
                    onLanguageClick();
                  }}
                  className="px-4.5 py-2 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-xl text-xs font-black hover:scale-105 active:scale-95 transition-transform shadow-3xs cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Actions / Danger Zone Modal */}
      {showActionsModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            onClick={() => setShowActionsModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-xs animate-fade-in"
          />
          <div 
            className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-fade-in-up"
          >
            <div className="px-5 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-855 dark:text-white">Account Actions</h3>
              <button 
                onClick={() => setShowActionsModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <button
                onClick={() => {
                  setShowActionsModal(false);
                  onLogout();
                }}
                className="w-full py-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-800 dark:text-white font-black rounded-2xl flex items-center justify-center gap-2 border border-slate-150/40 dark:border-slate-800 transition-all active:scale-98 cursor-pointer shadow-3xs"
              >
                <LogOut className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                Log Out of Account
              </button>

              <button
                onClick={() => {
                  setShowActionsModal(false);
                  onDeleteClick();
                }}
                className="w-full py-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/35 transition-all active:scale-98 cursor-pointer"
              >
                <Trash2 className="w-5 h-5 text-rose-650" />
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </PullToRefresh>
  );
};

export default SettingsPage;
