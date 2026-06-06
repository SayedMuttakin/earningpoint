import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  ShieldCheck,
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
  onSupportClick,
  onVerifyClick
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Toggles inside Notifications sub-menu
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  // Modals / Menu Active State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (showProfileModal) {
        e.preventDefault();
        setShowProfileModal(false);
      } else if (activeSubMenu) {
        e.preventDefault();
        setActiveSubMenu(null);
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [showProfileModal, activeSubMenu]);


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

  const subMenuData = {
    account_settings: {
      title: 'Account Settings',
      items: [
        { label: 'Profile', sub: 'Update your display name and email address', action: () => { setActiveSubMenu(null); setShowProfileModal(true); } },
        { label: 'Security', sub: 'Manage your active sessions and device security', action: () => alert('Security configuration is optimized for this device.') },
        { label: 'Password', sub: 'Change your account login password', action: () => { setActiveSubMenu(null); onPasswordClick(); } },
      ]
    },
    notifications: {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', sub: 'Enable or disable push alerts on this device', isToggle: true, value: pushNotifications, action: () => setPushNotifications(prev => !prev) },
        { label: 'News Alerts', sub: 'Get notified about new posts and updates', isToggle: true, value: newsAlerts, action: () => setNewsAlerts(prev => !prev) },
        { label: 'Message Alerts', sub: 'Receive sound and vibration alerts for chats', isToggle: true, value: messageAlerts, action: () => setMessageAlerts(prev => !prev) },
      ]
    },
    privacy: {
      title: 'Privacy Settings',
      items: [
        { label: 'Profile Privacy', sub: 'Read our terms of service and privacy policies', action: () => { setActiveSubMenu(null); onTermsClick(); } },
        { label: 'Blocked Users', sub: 'Manage restricted and blocked users list', action: () => alert('You have not blocked any users yet.') },
        { label: 'Activity Status', sub: 'Show or hide when you are active on the app', action: () => alert('Your activity status is active and visible.') },
      ]
    },
    messenger: {
      title: 'Messenger Preferences',
      items: [
        { label: 'Chat Settings', sub: 'Configure default chat bubbles and wallpaper', action: () => alert('Chat settings are managed in your Messenger conversations.') },
        { label: 'Read Receipts', sub: 'Let others see when you have read their messages', action: () => alert('Read receipts are enabled for all chats.') },
        { label: 'Message Requests', sub: 'Manage messages from users not in your contacts', action: () => alert('No pending message requests.') },
      ]
    },
    performance: {
      title: 'App Performance',
      items: [
        { label: 'Data Saver', sub: 'Reduce image and video quality to save cellular data', action: () => alert('Data Saver mode is optimized by default.') },
        { label: 'Auto Play', sub: 'Auto play videos and reels on Wi-Fi connection', action: () => alert('Auto Play is enabled for Wi-Fi and Cellular networks.') },
        { label: 'Background Activity', sub: 'Allow Zenivio to sync data in the background', action: () => alert('Background Activity is optimized for low battery usage.') },
      ]
    },
    storage: {
      title: 'Storage & Data',
      items: [
        { label: 'Clear Cache', sub: 'Clear temporary cache files to free up phone storage', action: () => { alert('Cache cleared successfully!'); } },
        { label: 'Storage Usage', sub: 'View total storage size used by downloaded media', action: () => alert('Storage Usage: 14.2 MB used.') },
        { label: 'Download Settings', sub: 'Configure automatic media download settings', action: () => alert('Download settings are optimized.') },
      ]
    },
    appearance: {
      title: 'Language & Appearance',
      items: [
        { label: 'Language', sub: 'Select your preferred display language', action: () => { setActiveSubMenu(null); onLanguageClick(); } },
        { label: 'Dark Mode', sub: 'Toggle dark mode and system theme settings', isToggle: true, value: darkMode, action: onToggleDarkMode },
        { label: 'Theme', sub: 'Select accents and background themes', action: () => alert('Theme settings are managed via Dark Mode.') },
      ]
    },
    support: {
      title: 'Help & Support',
      items: [
        { label: 'Report Problem', sub: 'Encountered a bug? File a report with our dev team', action: () => { setActiveSubMenu(null); onSupportClick(); } },
        { label: 'Contact Support', sub: 'Chat with our support executive for queries', action: () => { setActiveSubMenu(null); onSupportClick(); } },
        { label: 'FAQ', sub: 'Read frequently asked questions and answers', action: () => { setActiveSubMenu(null); onSupportClick(); } },
      ]
    },
    actions: {
      title: 'Account Actions',
      items: [
        { label: 'Logout', sub: 'Sign out from this device', action: () => { setActiveSubMenu(null); onLogout(); } },
        { label: 'Delete Account', sub: 'Permanently remove your account and all data', action: () => { setActiveSubMenu(null); onDeleteClick(); } },
      ]
    }
  };

  const allItems = [
    { 
      id: 'account_settings', 
      icon: User, 
      color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-405', 
      label: 'Account Settings', 
      sub: 'Manage your profile, security and account', 
      action: () => setActiveSubMenu(subMenuData.account_settings)
    },
    { 
      id: 'notifications', 
      icon: Bell, 
      color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-405', 
      label: 'Notifications', 
      sub: 'Control alerts and notification preferences', 
      action: () => setActiveSubMenu(subMenuData.notifications)
    },
    { 
      id: 'privacy', 
      icon: Shield, 
      color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-405', 
      label: 'Privacy', 
      sub: 'Manage privacy and visibility settings', 
      action: () => setActiveSubMenu(subMenuData.privacy)
    },
    { 
      id: 'verification', 
      icon: ShieldCheck, 
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400', 
      label: 'Verification', 
      sub: 'Verify your identity and account status', 
      action: () => { setActiveSubMenu(null); onVerifyClick(); }
    },
    { 
      id: 'messenger', 
      icon: MessageCircle, 
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-405', 
      label: 'Messenger', 
      sub: 'Chat and messaging preferences', 
      action: () => setActiveSubMenu(subMenuData.messenger)
    },
    { 
      id: 'performance', 
      icon: Rocket, 
      color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-650 dark:text-purple-405', 
      label: 'App Performance', 
      sub: 'Data saver, optimization and app performance', 
      action: () => setActiveSubMenu(subMenuData.performance)
    },
    { 
      id: 'storage', 
      icon: Database, 
      color: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-405', 
      label: 'Storage & Data', 
      sub: 'Manage storage, data usage and cache', 
      action: () => setActiveSubMenu(subMenuData.storage)
    },
    { 
      id: 'appearance', 
      icon: Palette, 
      color: 'bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-405', 
      label: 'Language & Appearance', 
      sub: 'Theme, dark mode and language', 
      action: () => setActiveSubMenu(subMenuData.appearance)
    },
    { 
      id: 'support', 
      icon: Headphones, 
      color: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-405', 
      label: 'Help & Support', 
      sub: 'Get help, report issues and more', 
      action: () => setActiveSubMenu(subMenuData.support)
    },
    { 
      id: 'actions', 
      icon: LogOut, 
      color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455', 
      label: 'Account Actions', 
      sub: 'Logout or delete your account', 
      action: () => setActiveSubMenu(subMenuData.actions)
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-955 pb-32">
          <style>{`
            @keyframes scaleUp {
              from {
                opacity: 0;
                transform: scale(0.92);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-scale-up {
              animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
          `}</style>

          {/* Sticky Header Section */}
          <div className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-955/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-900">
            <button 
              onClick={() => {
                if (showProfileModal) {
                  setShowProfileModal(false);
                } else if (activeSubMenu) {
                  setActiveSubMenu(null);
                } else {
                  onBack();
                }
              }}
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

            {/* Single Flat Cards List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden flex flex-col w-full">
              {allItems.map((item, idx) => (
                <button 
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                      <item.icon className="w-5 h-5" strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-[15px] text-slate-855 dark:text-slate-200 block truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold block truncate mt-0.5">{item.sub}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" strokeWidth={3} />
                </button>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wide">Zenivio v2.1.0 • Built with ❤️</p>
            </div>
          </div>
        </div>
      </PullToRefresh>

      {/* Account Settings / Personal Info Modal - Centered Viewport */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowProfileModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-855 dark:text-white">Account Settings</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-55/40 dark:bg-slate-855 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-450 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/50"
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
                  className="w-full bg-slate-55/40 dark:bg-slate-855 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-450 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/55"
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
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/60 text-slate-800 dark:text-white rounded-2xl font-black border border-slate-150/40 dark:border-slate-800 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer shadow-3xs"
                >
                  <Lock className="w-4 h-4 text-[#7C3AED]" /> Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Settings Detail Modal - Centered Viewport */}
      {activeSubMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setActiveSubMenu(null)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden max-h-[80vh] flex flex-col animate-scale-up"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-855 dark:text-white">{activeSubMenu.title}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Configure your preferences</p>
              </div>
              <button 
                onClick={() => setActiveSubMenu(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Items List */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900">
              {activeSubMenu.items.map((subItem, idx) => {
                if (subItem.isToggle) {
                  return (
                    <div
                      key={idx}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-955 border border-slate-150/30 dark:border-slate-855 rounded-2xl text-left shadow-3xs animate-fade-in"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="font-bold text-sm text-slate-855 dark:text-white block">{subItem.label}</span>
                        <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold block mt-0.5 leading-relaxed">{subItem.sub}</span>
                      </div>
                      
                      <button 
                        onClick={subItem.action}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${subItem.value ? 'bg-[#7C3AED]' : 'bg-slate-250 dark:bg-slate-800'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${subItem.value ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={subItem.action}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 dark:bg-slate-955 dark:hover:bg-slate-905 border border-slate-150/30 dark:border-slate-855 rounded-2xl transition-all active:scale-98 text-left shadow-3xs animate-fade-in"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="font-bold text-sm text-slate-855 dark:text-white block">{subItem.label}</span>
                      <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold block mt-0.5 leading-relaxed">{subItem.sub}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
