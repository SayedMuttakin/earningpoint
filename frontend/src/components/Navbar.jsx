import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, ShoppingCart, User, Settings, Menu, X, Video, Newspaper,
  Lock, Globe, Shield, ShieldCheck, Trash2, ChevronRight, Moon, Sun, 
  Database, HelpCircle, FileText, LogOut, ArrowLeft, Smartphone, 
  CheckCircle2, Search, Rocket, Palette, Headphones, MessageCircle, Plus 
} from 'lucide-react';
import { API_BASE } from '../config';
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Polling every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const getAvatarUrl = (u) => {
    if (!u) return `https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff&bold=true`;
    const pic = u.profilePic || u.googleAvatar;
    if (!pic) return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=7C3AED&color=fff&bold=true`;
    return pic.startsWith('http') || pic.startsWith('/api') || pic.startsWith('data:') 
      ? pic 
      : `${API_BASE}/api/image?file=${encodeURIComponent(pic)}`;
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
            className="fixed inset-0 z-[60] bg-slate-955/70 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 h-full w-[85%] sm:w-[70%] md:w-[320px] bg-white dark:bg-slate-900 shadow-2xl z-[70] flex flex-col overflow-hidden animate-slide-in">
            {/* Header / Profile Card */}
            <div className="px-4.5 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent dark:from-indigo-950/10 dark:via-purple-950/5">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex-shrink-0">
                  <img 
                    src={getAvatarUrl(currentUser)} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-900"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-[15px] text-slate-800 dark:text-white block truncate leading-tight">
                      {currentUser?.name || 'User'}
                    </span>
                    {((currentUser?.verificationBadge === 'blue' || currentUser?.verificationBadge === 'golden') || (currentUser?.isEmailVerified && currentUser?.verificationBadge !== 'none')) && (
                      <VerifiedBadge type={currentUser?.verificationBadge === 'golden' ? 'golden' : 'blue'} iconClassName="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[9.5px] text-slate-405 dark:text-slate-500 font-bold block truncate mt-0.5">
                    {currentUser?.phoneOrEmail || ''}
                  </span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-355 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel: Categories (Full Width List, No sub-menus, No scrollbar visible) */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-4 space-y-1 bg-slate-55/10 dark:bg-slate-955/10">
              {allItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between py-2 px-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-2xl transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                    <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                      <item.icon className="w-4 h-4" strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-[13px] text-slate-800 dark:text-slate-200 block truncate leading-none">{item.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 ml-0.5" strokeWidth={3} />
                </button>
              ))}
              
              <div className="pt-8 pb-4 text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold space-y-1">
                <div>Zenivio v2.1.0 • Built with ❤️</div>
                <div className="mt-1">
                  Build & Developed by{' '}
                  <a
                    href="https://muttakinrahman.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
                  >
                    Muttakin Rahman
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop & Top Mobile Navbar */}
      {activeTab !== 'Video' && (
        <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 relative">
              {/* Left Side: Mobile Menu Button and Brand */}
              <div className="flex items-center gap-1 sm:gap-2 relative z-50">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-600 p-2 transition-colors"
                >
                  <Menu className="h-7 w-7" />
                </button>
                <span 
                  className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent cursor-pointer transform hover:scale-105 transition-all duration-300 select-none"
                  onClick={() => setActiveTab && setActiveTab('Home')}
                >
                  Zenivio
                </span>
              </div>

              {/* Right Side: Notification & Messenger Icons */}
              <div className="flex items-center gap-1">
                {/* Notification (Bell) Button - Placed before Messenger */}
                <button 
                  onClick={() => setActiveTab && setActiveTab('Notification')}
                  className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-slate-150/40 dark:hover:border-slate-750/30"
                  title="Notifications"
                >
                  <div className="relative">
                    <Bell className="w-6.5 h-6.5 text-slate-700 dark:text-slate-200" strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                    )}
                  </div>
                </button>

                {/* Messenger Button */}
                <button 
                  onClick={() => setActiveTab && setActiveTab('Messenger')}
                  className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-slate-150/40 dark:hover:border-slate-750/30"
                  title="Messenger Chat"
                >
                  <div className="relative">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 transform active:scale-90 transition-transform duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.9 1.44 5.49 3.7 7.14v3.86a.75.75 0 001.17.62l4.03-2.58c.36.07.73.11 1.1.11 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1.25 12.25l-2.5-2.68-4.88 2.68 5.38-5.71 2.5 2.68 4.88-2.68-5.38 5.71z" fill="url(#messenger-gradient)"/>
                      <defs>
                        <linearGradient id="messenger-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#09f" />
                          <stop offset="30%" stopColor="#a0f" />
                          <stop offset="70%" stopColor="#f35" />
                          <stop offset="100%" stopColor="#f85" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  </div>
                </button>
              </div>
              
            </div>
          </div>
        </nav>
      )}

      {/* Sticky Flat Bottom Navigation (Visible on all sizes) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-50/95 via-purple-50/95 to-pink-50/95 dark:from-slate-900/95 dark:via-slate-950/50 dark:to-slate-900/95 backdrop-blur-md rounded-t-[24px] z-45 shadow-[0_-8px_30px_rgba(99,102,241,0.15)] h-[76px] pb-safe flex items-center px-2">
        <div className="flex justify-around items-center w-full relative h-full">
          
          {/* Home Tab */}
          <button 
            onClick={() => setActiveTab && setActiveTab('Home')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Home' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <Home className="w-5.5 h-5.5" strokeWidth={activeTab === 'Home' ? 2.5 : 2} fill={activeTab === 'Home' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-450 dark:text-slate-500'}`}>Home</span>
          </button>

          {/* News Tab */}
          <button 
            onClick={() => setActiveTab && setActiveTab('Updates')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Updates' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <Newspaper className="w-5.5 h-5.5" strokeWidth={activeTab === 'Updates' ? 2.5 : 2} fill={activeTab === 'Updates' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Updates' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-450 dark:text-slate-500'}`}>News</span>
          </button>

          {/* Create Post Tab (Styled Round Plus Button) */}
          <button 
            onClick={() => setActiveTab && setActiveTab('CreatePost')}
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
            onClick={() => setActiveTab && setActiveTab('Cart')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Cart' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <ShoppingCart className="w-5.5 h-5.5" strokeWidth={activeTab === 'Cart' ? 2.5 : 2} fill={activeTab === 'Cart' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Cart' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-450 dark:text-slate-500'}`}>Cart</span>
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => setActiveTab && setActiveTab('MyProfile')}
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
    </>
  );
};


export default Navbar;
