import React, { useState, useEffect } from 'react';
import { Home, Bell, ShoppingCart, User, Settings, Menu, X, Video, Newspaper } from 'lucide-react';
import { API_BASE } from '../config';


const Navbar = ({ onLogout, activeTab, setActiveTab, currentUser, activePublicProfileUserId }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  return (
    <>
      {/* Desktop & Top Mobile Navbar */}
      {activeTab !== 'Video' && (
        <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 relative">
              {/* Left Side: Mobile Menu Button with Dropdown */}
              <div className="relative flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-600 p-2 transition-colors relative z-50"
                >
                  {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                </button>
                
                {/* Dropdown Menu for Setting */}
                {isMobileMenuOpen && (
                  <div 
                    className="absolute top-14 left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2.5 z-50 overflow-hidden animate-fade-in-up"
                  >
                    <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab && setActiveTab('Setting'); }} className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-600 flex items-center gap-3 transition-colors">
                      <Settings className="w-4.5 h-4.5" /> Setting
                    </button>
                  </div>
                )}
              </div>

              {/* Center Side: Logo & Brand (Centered) */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 cursor-pointer h-16" onClick={() => setActiveTab && setActiveTab('Home')}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                   <img src="/zenivio-logo.png" alt="Zenivio Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent transform hover:scale-105 transition-all duration-300">
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

          {/* Video Tab */}
          <button 
            onClick={() => setActiveTab && setActiveTab('Video')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Video' ? 'text-purple-500 dark:text-purple-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <Video className="w-5.5 h-5.5" strokeWidth={activeTab === 'Video' ? 2.5 : 2} fill={activeTab === 'Video' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Video' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-450 dark:text-slate-500'}`}>Video</span>
          </button>

          {/* News Tab */}
          <button 
            onClick={() => setActiveTab && setActiveTab('Updates')}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${activeTab === 'Updates' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-450 dark:text-slate-500'}`}
          >
            <Newspaper className="w-5.5 h-5.5" strokeWidth={activeTab === 'Updates' ? 2.5 : 2} fill={activeTab === 'Updates' ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-black mt-1 tracking-wide ${activeTab === 'Updates' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-450 dark:text-slate-500'}`}>News</span>
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
