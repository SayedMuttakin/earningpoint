import React, { useState, useEffect } from 'react';
import { 
  Home, Newspaper, Video, ShoppingCart, Rocket, Users, Award, 
  Settings, Headphones, FileText, Moon, Sun, LogOut, ChevronDown, 
  ChevronUp, Check, UserPlus, Trash2 
} from 'lucide-react';
import { getImageUrl } from '../config';
import VerifiedBadge, { isUserVerified, getUserBadgeType } from './VerifiedBadge';

const DesktopSidebarLeft = ({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  darkMode, 
  onToggleDarkMode,
  navigateToSettingsSubMenu
}) => {
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zenivio_saved_accounts') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setSavedAccounts(JSON.parse(localStorage.getItem('zenivio_saved_accounts') || '[]'));
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getAvatarUrl = (u) => {
    if (!u) return 'https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff&bold=true';
    const pic = u.profilePic || u.googleAvatar || u.facebookAvatar;
    if (!pic) return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'User') + '&background=7C3AED&color=fff&bold=true';
    return getImageUrl(pic);
  };

  const handleSwitchAccount = (account) => {
    if (account._id === currentUser?._id) {
      setShowAccountSwitcher(false);
      return;
    }
    localStorage.setItem('token', account.token);
    localStorage.setItem('tokenNormal', account.token);
    window.dispatchEvent(new CustomEvent('zenivio_account_switched', { detail: { token: account.token } }));
    setShowAccountSwitcher(false);
  };

  const handleAddAccount = () => {
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

  const navItems = [
    { id: 'Home', label: 'Feeds & Home', icon: Home, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'Updates', label: 'Latest News', icon: Newspaper, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
    { id: 'Cart', label: 'Marketplace / Cart', icon: ShoppingCart, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'Earning', label: 'Earn Rewards & Tasks', icon: Rocket, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { id: 'Referrals', label: 'Refer & Earn', icon: Users, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'Leaderboard', label: 'Top Earners', icon: Award, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40' },
    { id: 'Setting', label: 'Settings & Privacy', icon: Settings, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40' },
    { id: 'Support', label: 'Help & Support', icon: Headphones, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
    { id: 'TermsPrivacy', label: 'Terms & Privacy', icon: FileText, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 sticky top-0 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar space-y-3 pb-6 pt-0">
      {/* Profile Snapshot Card */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-2.5">
        <div 
          onClick={() => setActiveTab && setActiveTab('MyProfile')}
          className="flex items-center gap-3 cursor-pointer group"
          title="View your profile"
        >
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex-shrink-0 group-hover:scale-105 transition-transform">
            <img 
              src={getAvatarUrl(currentUser)} 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-900"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-slate-800 dark:text-white truncate block group-hover:text-brand-600 transition-colors">
                {currentUser?.name || 'User'}
              </span>
              {isUserVerified(currentUser) && (
                <VerifiedBadge type={getUserBadgeType(currentUser)} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate block">
              {currentUser?.phoneOrEmail || 'View profile'}
            </span>
          </div>
        </div>

        {/* Switch Account Quick Toggle */}
        <button
          onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <span>Saved Accounts ({savedAccounts.length || 1})</span>
          {showAccountSwitcher ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAccountSwitcher && (
          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            {savedAccounts.map((acc) => {
              const isActive = acc._id === currentUser?._id;
              return (
                <div
                  key={acc._id || acc.token}
                  onClick={() => handleSwitchAccount(acc)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-50/80 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-semibold' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img 
                      src={getAvatarUrl(acc)} 
                      alt={acc.name} 
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <span className="text-xs truncate">{acc.name || 'User'}</span>
                  </div>
                  {isActive ? (
                    <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0 ml-1" />
                  ) : (
                    <button
                      onClick={(e) => handleRemoveSavedAccount(e, acc._id)}
                      className="p-1 hover:text-rose-500 text-slate-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Log into another account</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all cursor-pointer ${
                isActive 
                  ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 shadow-3xs' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="truncate flex-1">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme & Logout Controls */}
      <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1">
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </div>
          <span className="truncate">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="truncate">Sign Out</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-3 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <span onClick={() => setActiveTab && setActiveTab('TermsPrivacy')} className="hover:underline cursor-pointer">Privacy</span>
          <span>·</span>
          <span onClick={() => setActiveTab && setActiveTab('TermsPrivacy')} className="hover:underline cursor-pointer">Terms</span>
          <span>·</span>
          <span onClick={() => setActiveTab && setActiveTab('Support')} className="hover:underline cursor-pointer">Help</span>
        </div>
        <p>Zenivio © 2026</p>
      </div>
    </aside>
  );
};

export default DesktopSidebarLeft;
