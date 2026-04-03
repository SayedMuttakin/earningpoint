import React, { useState, useEffect } from 'react';
import { Home, Bell, DollarSign, ShoppingCart, User, Settings, LogOut, Menu, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

const navItems = [
  { name: 'Home', icon: Home },
  { name: 'Notification', icon: Bell },
  { name: 'Earning', icon: DollarSign },
  { name: 'Cart', icon: ShoppingCart },
  { name: 'Profile', icon: User },
  { name: 'Setting', icon: Settings },
  { name: 'Support', icon: HelpCircle },
];

const mobileNavItems = navItems.filter(item => item.name !== 'Setting');

const Navbar = ({ onLogout, activeTab, setActiveTab }) => {
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
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Side: Logo & Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab('Home')}>
              <div className="w-10 h-10 flex items-center justify-center">
                 <img src="/zenvio-logo.png" alt="Zenvio Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
                Zenvio
              </span>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="relative flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  const isNotification = item.name === 'Notification';
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab && setActiveTab(item.name)}
                      className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isActive ? 'text-brand-700 dark:text-brand-400' : 'text-black dark:text-slate-300 hover:text-brand-600'}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-brand-100/50 dark:border-slate-600"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <div className="relative">
                          <Icon strokeWidth={2.5} className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                          {isNotification && unreadCount > 0 && (
                            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                          )}
                        </div>
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Quick Actions/Profile Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <button onClick={onLogout} className="hidden md:flex bg-brand-50 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-slate-700 text-brand-700 dark:text-brand-400 h-10 w-10 rounded-full items-center justify-center transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
              
              {/* Mobile Menu Button with Dropdown */}
              <div className="md:hidden relative flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-slate-500 dark:text-slate-400 hover:text-brand-600 p-2 transition-colors relative z-50"
                >
                  {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                </button>
                
                {/* Dropdown Menu for Setting and Log out */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-14 right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2.5 z-50 overflow-hidden"
                    >
                      <button className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-600 flex items-center gap-3 transition-colors">
                        <Settings className="w-4.5 h-4.5" /> Setting
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-3" />
                      <button onClick={() => { setIsMobileMenuOpen(false); onLogout(); }} className="w-full text-left px-5 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors">
                        <LogOut className="w-4.5 h-4.5" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Navigation Below Navbar */}
      <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-brand-100 dark:border-slate-700 sticky top-16 z-40 w-full shadow-sm">
        <div className="flex justify-evenly items-center px-2 py-2 w-full">
          {mobileNavItems.map((item) => {
            const isActive = activeTab === item.name;
            const Icon = item.icon;
            const isNotification = item.name === 'Notification';

            return (
              <button 
                key={item.name}
                onClick={() => setActiveTab && setActiveTab(item.name)}
                className="flex flex-col items-center justify-center p-2 group transition-all"
              >
                <div className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 shadow-sm scale-110' 
                    : 'text-slate-500 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 group-hover:text-brand-600'
                }`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {isNotification && unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  );
};


export default Navbar;
