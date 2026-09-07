import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, ShoppingCart, User, Settings, Menu, X, Video, Newspaper,
  Lock, Globe, Shield, ShieldCheck, Trash2, ChevronRight, ChevronDown, ChevronUp, Moon, Sun, 
  Database, HelpCircle, FileText, LogOut, ArrowLeft, Smartphone, 
  CheckCircle2, Search, Rocket, Coins, Palette, Headphones, MessageCircle, Plus, Check, Users, UserPlus 
} from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';
import VerifiedBadge from './VerifiedBadge';

const Navbar = ({ 
  onLogout, 
  activeTab, 
  setActiveTab, 
  currentUser, 
  activePublicProfileUserId, 
  darkMode, 
  onToggleDarkMode,
  navigateToSettingsSubMenu
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zenivio_saved_accounts') || '[]');
    } catch {
      return [];
    }
  });

  // Sync current active user account into saved_accounts
  useEffect(() => {
    if (currentUser?._id) {
      const token = localStorage.getItem('token');
      if (!token) return;

      setSavedAccounts(prev => {
        const existingIdx = prev.findIndex(a => a._id === currentUser._id || (currentUser.phoneOrEmail && a.phoneOrEmail === currentUser.phoneOrEmail));
        const accountData = {
          _id: currentUser._id,
          name: currentUser.name || 'User',
          phoneOrEmail: currentUser.phoneOrEmail || '',
          profilePic: currentUser.profilePic || currentUser.googleAvatar || currentUser.facebookAvatar || '',
          verificationBadge: currentUser.verificationBadge || 'none',
          isEmailVerified: !!currentUser.isEmailVerified,
          token: token,
          lastActive: Date.now()
        };

        let updated;
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...accountData };
        } else {
          updated = [accountData, ...prev];
        }
        localStorage.setItem('zenivio_saved_accounts', JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentUser]);

  const handleOpenMyProfile = () => {
    setIsSidebarOpen(false);
    setShowAccountSwitcher(false);
    if (setActiveTab) setActiveTab('MyProfile');
  };

  const handleSwitchAccount = (account) => {
    if (account._id === currentUser?._id) {
      setShowAccountSwitcher(false);
      return;
    }
    localStorage.setItem('token', account.token);
    localStorage.setItem('tokenNormal', account.token);
    window.dispatchEvent(new CustomEvent('zenivio_account_switched', { detail: { token: account.token } }));
    setIsSidebarOpen(false);
    setShowAccountSwitcher(false);
  };

  const handleAddAccount = () => {
    // Save current active account first before logging out for addition
    if (currentUser?._id) {
      const token = localStorage.getItem('token');
      if (token) {
        const prev = JSON.parse(localStorage.getItem('zenivio_saved_accounts') || '[]');
        const existingIdx = prev.findIndex(a => a._id === currentUser._id);
        const accountData = {
          _id: currentUser._id,
          name: currentUser.name || 'User',
          phoneOrEmail: currentUser.phoneOrEmail || '',
          profilePic: currentUser.profilePic || currentUser.googleAvatar || currentUser.facebookAvatar || '',
          verificationBadge: currentUser.verificationBadge || 'none',
          isEmailVerified: !!currentUser.isEmailVerified,
          token: token,
          lastActive: Date.now()
        };
        const updated = existingIdx >= 0 ? prev.map((a, i) => i === existingIdx ? accountData : a) : [accountData, ...prev];
        localStorage.setItem('zenivio_saved_accounts', JSON.stringify(updated));
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('tokenNormal');
    setIsSidebarOpen(false);
    setShowAccountSwitcher(false);
    if (onLogout) onLogout();
  };

  const handleRemoveSavedAccount = (e, accountId) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a._id !== accountId);
    setSavedAccounts(updated);
    localStorage.setItem('zenivio_saved_accounts', JSON.stringify(updated));
    if (accountId === currentUser?._id) {
      if (onLogout) onLogout();
    }
  };

  const handleTabButtonClick = (targetTab) => {
    const scrollToTopAll = () => {
      // Primary scroll container: main
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
        if (typeof mainEl.scrollTo === 'function') {
          mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.scrollTop = 0;
      }
      
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Scan all scrollable elements in DOM tree
      const scrollables = document.querySelectorAll('*');
      scrollables.forEach(el => {
        if (el && el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      });
    };

    // 1. Immediate scroll to top
    scrollToTopAll();

    // 2. Dispatch refresh event for current page listeners
    window.dispatchEvent(new CustomEvent('tabReclickRefresh', { detail: { tab: targetTab } }));

    // 3. Switch tab
    if (setActiveTab) {
      setActiveTab(targetTab);
    }

    // 4. Multi-pass scroll after layout updates & re-renders
    requestAnimationFrame(scrollToTopAll);
    setTimeout(scrollToTopAll, 40);
    setTimeout(scrollToTopAll, 120);
    setTimeout(scrollToTopAll, 250);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) {
      setUnreadCount(0);
      setUnreadMessagesCount(0);
      return;
    }

    fetchUnreadCount();
    fetchUnreadMessagesCount();
    const interval = setInterval(() => {
      const curToken = localStorage.getItem('token');
      if (!curToken) {
        setUnreadCount(0);
        setUnreadMessagesCount(0);
        return;
      }
      fetchUnreadCount();
      fetchUnreadMessagesCount();
    }, 25000);

    const handleNewUnreadMsg = () => {
      setUnreadMessagesCount(prev => prev + 1);
    };
    const handleReadMsgUpdate = () => {
      fetchUnreadMessagesCount();
    };

    window.addEventListener('new_unread_message', handleNewUnreadMsg);
    window.addEventListener('messages_read_update', handleReadMsgUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('new_unread_message', handleNewUnreadMsg);
      window.removeEventListener('messages_read_update', handleReadMsgUpdate);
    };
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data && typeof data.count === 'number') {
        setUnreadCount(data.count);
      }
    } catch (err) {
      // safe fallback on logout or network change
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data && typeof data.unreadCount === 'number') {
        setUnreadMessagesCount(data.unreadCount);
      }
    } catch (err) {
      // safe fallback on logout or network change
    }
  };

  const getAvatarUrl = (u) => {
    if (!u) return `https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff&bold=true`;
    const pic = u.profilePic || u.googleAvatar || u.facebookAvatar;
    if (!pic) return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=7C3AED&color=fff&bold=true`;
    return getImageUrl(pic);
  };

  const allItems = [
    { 
      id: 'account_settings', 
      icon: User, 
      color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-405', 
      label: 'Account Settings', 
      sub: 'Manage your profile, security and account', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('account_settings') : (setActiveTab && setActiveTab('EditProfile')); }
    },
    { 
      id: 'notifications', 
      icon: Bell, 
      color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-405', 
      label: 'Notifications', 
      sub: 'Control alerts and notification preferences', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('notifications') : (setActiveTab && setActiveTab('Notification')); }
    },
    { 
      id: 'privacy', 
      icon: Shield, 
      color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-405', 
      label: 'Privacy', 
      sub: 'Manage privacy and visibility settings', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('privacy') : (setActiveTab && setActiveTab('TermsPrivacy')); }
    },
    { 
      id: 'verification', 
      icon: ShieldCheck, 
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-405', 
      label: 'Verification', 
      sub: 'Verify your identity and account status', 
      action: () => { setIsSidebarOpen(false); setActiveTab && setActiveTab('Verify'); }
    },
    { 
      id: 'messenger', 
      icon: MessageCircle, 
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-405', 
      label: 'Messenger', 
      sub: 'Chat and messaging preferences', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('messenger') : (setActiveTab && setActiveTab('Messenger')); }
    },
    { 
      id: 'performance', 
      icon: Rocket, 
      color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-650 dark:text-purple-405', 
      label: 'App Performance', 
      sub: 'Data saver, optimization and app performance', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('performance') : (setActiveTab && setActiveTab('Setting')); }
    },
    { 
      id: 'storage', 
      icon: Database, 
      color: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-405', 
      label: 'Storage & Data', 
      sub: 'Manage storage, data usage and cache', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('storage') : (setActiveTab && setActiveTab('Setting')); }
    },
    { 
      id: 'appearance', 
      icon: Palette, 
      color: 'bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-405', 
      label: 'Language & Appearance', 
      sub: 'Theme, dark mode and language', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('appearance') : (setActiveTab && setActiveTab('Language')); }
    },
    { 
      id: 'support', 
      icon: Headphones, 
      color: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-405', 
      label: 'Help & Support', 
      sub: 'Get help, report issues and more', 
      action: () => { setIsSidebarOpen(false); setActiveTab && setActiveTab('Support'); }
    },
    { 
      id: 'actions', 
      icon: LogOut, 
      color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455', 
      label: 'Account Actions', 
      sub: 'Logout or delete your account', 
      action: () => { setIsSidebarOpen(false); navigateToSettingsSubMenu ? navigateToSettingsSubMenu('actions') : (onLogout && onLogout()); }
    }
  ];

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Sliding Sidebar Drawer */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[99999] bg-slate-955/70 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 h-fit max-h-[96vh] w-[88%] sm:w-[75%] md:w-[360px] bg-white dark:bg-slate-900 shadow-2xl z-[100000] flex flex-col overflow-hidden rounded-br-[2.5rem] animate-slide-in pt-[max(12px,env(safe-area-inset-top))]">
            {/* Header / Profile Card */}
            <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent dark:from-indigo-950/10 dark:via-purple-950/5">
              <div className="flex items-center gap-3">
                {/* Clickable Profile Avatar & Name */}
                <div 
                  onClick={handleOpenMyProfile}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group active:opacity-80 transition-opacity"
                  title="View your profile"
                >
                  <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <img 
                      src={getAvatarUrl(currentUser)} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-900"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[15px] text-slate-800 dark:text-white block truncate leading-tight group-hover:text-brand-600 transition-colors">
                        {currentUser?.name || 'User'}
                      </span>
                      {((currentUser?.verificationBadge === 'blue' || currentUser?.verificationBadge === 'golden') || (currentUser?.isEmailVerified && currentUser?.verificationBadge !== 'none')) && (
                        <VerifiedBadge type={currentUser?.verificationBadge === 'golden' ? 'golden' : 'blue'} iconClassName="w-4 h-4 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                      {currentUser?.phoneOrEmail || ''}
                    </span>
                  </div>
                </div>

                {/* Switch Account Toggle Button (Chevron Down/Up) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAccountSwitcher(!showAccountSwitcher);
                  }}
                  className={`p-2 rounded-full transition-all flex-shrink-0 ${
                    showAccountSwitcher 
                      ? 'bg-brand-500 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Switch Account"
                >
                  {showAccountSwitcher ? <ChevronUp className="w-4 h-4" strokeWidth={2} /> : <ChevronDown className="w-4 h-4" strokeWidth={2} />}
                </button>

                {/* Close Drawer Button */}
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 transition-colors flex-shrink-0"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Account Switcher View (Facebook Style) */}
            {showAccountSwitcher ? (
              <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-2 bg-slate-50/70 dark:bg-slate-950/40 animate-fade-in">
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Saved Accounts ({savedAccounts.length || 1})</span>
                  </div>
                </div>

                {/* Accounts List */}
                <div className="space-y-1.5">
                  {savedAccounts.map((acc) => {
                    const isActive = acc._id === currentUser?._id;
                    return (
                      <div
                        key={acc._id || acc.token}
                        onClick={() => handleSwitchAccount(acc)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border ${
                          isActive 
                            ? 'bg-brand-50/80 dark:bg-brand-950/30 border-brand-300 dark:border-brand-800/60 shadow-xs' 
                            : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-800 shadow-3xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex-shrink-0">
                            <img 
                              src={getAvatarUrl(acc)} 
                              alt={acc.name} 
                              className="w-full h-full object-cover rounded-full border border-white dark:border-slate-900"
                            />
                            {isActive && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className={`font-semibold text-[14px] truncate block ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-white'}`}>
                                {acc.name || 'User'}
                              </span>
                              {((acc.verificationBadge === 'blue' || acc.verificationBadge === 'golden') || (acc.isEmailVerified && acc.verificationBadge !== 'none')) && (
                                <VerifiedBadge type={acc.verificationBadge === 'golden' ? 'golden' : 'blue'} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block truncate">
                              {acc.phoneOrEmail || ''}
                            </span>
                          </div>
                        </div>

                        {/* Active Badge / Delete Option */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {isActive ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3 stroke-[2.5]" /> Active
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleRemoveSavedAccount(e, acc._id)}
                              className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Remove from device"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Another Account Button */}
                <button
                  onClick={handleAddAccount}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 active:scale-[0.98] rounded-2xl transition-all text-slate-700 dark:text-slate-200 font-semibold text-sm mt-2 cursor-pointer shadow-3xs"
                >
                  <UserPlus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Log into Another Account</span>
                </button>
              </div>
            ) : (
              /* Panel: Standard Menu Categories */
              <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3.5 space-y-1.5 bg-slate-55/10 dark:bg-slate-955/10">
                {allItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-[0.98] rounded-2xl transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
                      <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                        <item.icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100 block truncate leading-snug">{item.label}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-1" strokeWidth={2} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Desktop & Top Mobile/Tablet Navbar */}
      {activeTab !== 'Video' && activeTab !== 'Messenger' && activeTab !== 'Support' && (
        <nav className="fixed top-0 left-0 right-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs z-[9998] flex flex-col justify-center pt-[max(8px,env(safe-area-inset-top,8px))] pb-1 lg:py-2">
          <div className="w-full max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-4 lg:px-6 flex justify-between items-center h-12 lg:h-14">
            
            {/* Left Side: Mobile/Tablet Menu Button & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 relative z-50">
              {/* Mobile & Tablet Hamburger Menu */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-brand-600 p-1.5 transition-colors cursor-pointer"
                title="Menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Brand Logo with Icon */}
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity select-none group"
                onClick={() => handleTabButtonClick('Home')}
              >
                <img 
                  src="/zenivio-logo.png" 
                  alt="Zenivio Logo" 
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform" 
                />
                <span 
                  className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent transform transition-all duration-300"
                >
                  Zenivio
                </span>
              </div>
            </div>

            {/* Center Section: Desktop Primary Navigation Tabs with Icon + Text */}
            <div className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-3 flex-1 max-w-xl xl:max-w-2xl mx-auto h-full px-2">
              {/* Home Tab */}
              <button
                onClick={() => handleTabButtonClick('Home')}
                className={`relative flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'Home' 
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 shadow-3xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Home Feed"
              >
                <Home className="w-5 h-5" strokeWidth={activeTab === 'Home' ? 2.5 : 2} fill={activeTab === 'Home' ? 'currentColor' : 'none'} />
                <span>Home</span>
                {activeTab === 'Home' && (
                  <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                )}
              </button>

              {/* News Tab */}
              <button
                onClick={() => handleTabButtonClick('Updates')}
                className={`relative flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'Updates' 
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 shadow-3xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Latest News"
              >
                <Newspaper className="w-5 h-5" strokeWidth={activeTab === 'Updates' ? 2.5 : 2} fill={activeTab === 'Updates' ? 'currentColor' : 'none'} />
                <span>News</span>
                {activeTab === 'Updates' && (
                  <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full" />
                )}
              </button>

              {/* Cart / Marketplace Tab */}
              <button
                onClick={() => handleTabButtonClick('Cart')}
                className={`relative flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'Cart' 
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-3xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Marketplace"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={activeTab === 'Cart' ? 2.5 : 2} fill={activeTab === 'Cart' ? 'currentColor' : 'none'} />
                <span>Market</span>
                {activeTab === 'Cart' && (
                  <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </button>

              {/* Earn Rewards Tab */}
              <button
                onClick={() => handleTabButtonClick('Earning')}
                className={`relative flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'Earning' 
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 shadow-3xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Earn Rewards"
              >
                <Coins className="w-5 h-5" strokeWidth={activeTab === 'Earning' ? 2.5 : 2} fill={activeTab === 'Earning' ? 'currentColor' : 'none'} />
                <span>Earning</span>
                {activeTab === 'Earning' && (
                  <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Right Side: Create, Notifications & Messenger Icons, Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Desktop Create Post Button */}
              <button 
                onClick={() => handleTabButtonClick('CreatePost')}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Create Post"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Create</span>
              </button>

              {/* Notification (Bell) Button */}
              <button 
                onClick={() => handleTabButtonClick('Notification')}
                className="relative p-2 lg:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:bg-slate-100 lg:dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
                title="Notifications"
              >
                <div className="relative">
                  <Bell className="w-5.5 h-5.5 lg:w-5 lg:h-5 text-slate-700 dark:text-slate-200" strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </div>
              </button>

              {/* Messenger Button */}
              <button 
                onClick={() => {
                  handleTabButtonClick('Messenger');
                  setUnreadMessagesCount(0);
                }}
                className="relative p-2 lg:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:bg-slate-100 lg:dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
                title="Messenger Chat"
              >
                <div className="relative">
                  <MessageCircle className="w-5.5 h-5.5 lg:w-5 lg:h-5 text-slate-700 dark:text-slate-200 transform active:scale-90 transition-transform duration-300" strokeWidth={2} />
                  {unreadMessagesCount > 0 ? (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  ) : null}
                </div>
              </button>

              {/* Desktop User Profile Chip */}
              <div 
                onClick={handleOpenMyProfile}
                className="hidden lg:flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200/50 dark:border-slate-700/50"
                title="My Profile"
              >
                <img 
                  src={getAvatarUrl(currentUser)} 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full object-cover border border-white dark:border-slate-900"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {currentUser?.name?.split(' ')[0] || 'Profile'}
                </span>
              </div>
            </div>
            
          </div>
        </nav>
      )}

      {/* Sticky Flat Bottom Navigation (Pinned strictly to Mobile & Tablet Viewport Window, Hidden on Desktop) */}
      {activeTab !== 'Video' && activeTab !== 'Messenger' && activeTab !== 'Support' && (
        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-2xl md:max-w-3xl lg:hidden bg-gradient-to-r from-indigo-50/95 via-purple-50/95 to-pink-50/95 dark:from-slate-900/95 dark:via-slate-950/95 dark:to-slate-900/95 backdrop-blur-md rounded-t-[24px] z-[9999] shadow-[0_-8px_30px_rgba(99,102,241,0.15)] min-h-[68px] pt-1.5 pb-[max(12px,env(safe-area-inset-bottom,12px))] px-3 flex items-center">
        <div className="flex justify-around items-center w-full relative h-full">
          
          {/* Home Tab */}
          <button 
            onClick={() => handleTabButtonClick('Home')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Home' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <Home className="w-5.5 h-5.5" strokeWidth={activeTab === 'Home' ? 2.5 : 2} fill={activeTab === 'Home' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-450 dark:text-slate-500'}`}>Home</span>
          </button>

          {/* News Tab */}
          <button 
            onClick={() => handleTabButtonClick('Updates')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Updates' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <Newspaper className="w-5.5 h-5.5" strokeWidth={activeTab === 'Updates' ? 2.5 : 2} fill={activeTab === 'Updates' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Updates' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-450 dark:text-slate-500'}`}>News</span>
          </button>

          {/* Create Post Tab (Styled Round Plus Button) */}
          <button 
            onClick={() => handleTabButtonClick('CreatePost')}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-90 shadow-md ${
              activeTab === 'CreatePost' 
                ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-indigo-500/50 scale-105' 
                : 'bg-gradient-to-tr from-brand-500 to-indigo-500 text-white shadow-brand-500/30'
            }`}
            title="Create Post"
          >
            <Plus className="w-6 h-6" strokeWidth={3} />
          </button>

          {/* Cart Tab */}
          <button 
            onClick={() => handleTabButtonClick('Cart')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Cart' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <ShoppingCart className="w-5.5 h-5.5" strokeWidth={activeTab === 'Cart' ? 2.5 : 2} fill={activeTab === 'Cart' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Cart' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-450 dark:text-slate-500'}`}>Cart</span>
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => handleTabButtonClick('MyProfile')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${
              (activeTab === 'MyProfile' || activeTab === 'EditProfile' || (activeTab === 'PublicProfile' && (activePublicProfileUserId === 'me' || (currentUser && (activePublicProfileUserId === currentUser._id || activePublicProfileUserId === currentUser.id)))))
                ? 'text-indigo-500 dark:text-indigo-400' 
                : 'text-slate-450 dark:text-slate-500'
            }`}
          >
            <User 
              className="w-5.5 h-5.5" 
              strokeWidth={(activeTab === 'MyProfile' || activeTab === 'EditProfile' || (activeTab === 'PublicProfile' && (activePublicProfileUserId === 'me' || (currentUser && (activePublicProfileUserId === currentUser._id || activePublicProfileUserId === currentUser.id))))) ? 2.5 : 2} 
              fill={(activeTab === 'MyProfile' || activeTab === 'EditProfile' || (activeTab === 'PublicProfile' && (activePublicProfileUserId === 'me' || (currentUser && (activePublicProfileUserId === currentUser._id || activePublicProfileUserId === currentUser.id))))) ? 'currentColor' : 'none'} 
            />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${
              (activeTab === 'MyProfile' || activeTab === 'EditProfile' || (activeTab === 'PublicProfile' && (activePublicProfileUserId === 'me' || (currentUser && (activePublicProfileUserId === currentUser._id || activePublicProfileUserId === currentUser.id))))) 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-450 dark:text-slate-500'
            }`}>Profile</span>
          </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
