import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config';
import {
  Settings,
  History,
  Users,
  ShieldCheck,
  Lock,
  Globe,
  HeadphonesIcon,
  FileText,
  Trash2,
  Moon,
  ChevronRight,
  Camera,
  Trophy
} from 'lucide-react';
import PullToRefresh from './PullToRefresh';

import BannerAd from './BannerAd';
import VerifiedBadge from './VerifiedBadge';

const ProfilePage = ({ onVerifyClick, onLanguageClick, onPasswordClick, onReferralsClick, onLeaderboardClick, onTermsClick, onDeleteClick, darkMode, onToggleDarkMode }) => {
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const [profileRes, verificationRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/verification`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setUserName(data.name || data.phoneOrEmail || 'User');
        setUserEmail(data.phoneOrEmail || '');
        if (data.profilePic) setProfilePic(data.profilePic);
      }

      if (verificationRes.ok) {
        const vData = await verificationRes.json();
        setIsVerified(vData.status === 'approved');
      }
    } catch (err) {
      console.error('Failed to fetch profile info:', err);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/earning/settings`);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchGlobalSettings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchGlobalSettings();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const menuItemsBlock1 = [
    { icon: History, label: 'Transaction History' },
    { icon: Users, label: 'My Referrals', action: onReferralsClick },
    { icon: Trophy, label: 'Leaderboard', action: onLeaderboardClick },
    { icon: ShieldCheck, label: 'Verify Now', action: onVerifyClick },
    { icon: Lock, label: 'Change Password', action: onPasswordClick },
    { icon: Globe, label: 'Language', action: onLanguageClick },
    { icon: HeadphonesIcon, label: 'Contact Support' },
    { icon: FileText, label: 'Terms & Privacy Policy', action: onTermsClick },
  ];

  const MenuList = ({ items }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 p-1 sm:p-2">
      {items.map((item, index) => (
        <button 
          key={index}
          onClick={item.action ? item.action : undefined}
          className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-xl group active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base whitespace-nowrap truncate">{item.label}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors flex-shrink-0 ml-1" />
        </button>
      ))}
    </div>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen pb-24 flex flex-col">
        {/* Sticky Header for Ad */}
        <div className="sticky top-[132px] sm:top-[140px] md:top-16 z-30 flex flex-col w-full bg-slate-50 dark:bg-slate-900 pb-2 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900 pt-2 px-2 sm:px-0">
            <BannerAd globalSettings={globalSettings} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 sm:pb-10 mb-6 sm:mb-10 text-center relative border-b border-slate-100 dark:border-slate-700">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Profile</h1>
            <div className="w-full flex justify-end gap-2">
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-transform hover:scale-105">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 md:gap-x-6 lg:gap-x-8">
          {/* Profile Info - Horizontal Layout on Mobile/Desktop */}
          <div className="md:col-span-12 lg:col-span-12">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8 flex flex-row items-center gap-5 sm:gap-8 hover:shadow-md transition-shadow duration-300">
              <div className="relative flex-shrink-0">
                <div 
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer group"
                  onClick={triggerFileInput}
                >
                  <img 
                    src={profilePic}
                    alt="Profile" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-brand-500 rounded-lg border-2 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-lg">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">{userName}</h2>
                  {isVerified && <VerifiedBadge iconClassName="w-5 h-5 sm:w-6 sm:h-6 fill-blue-500 text-white" />}
                </div>
                <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 font-bold mb-3 truncate font-mono tracking-tight">{userEmail}</p>
                <div className="flex flex-wrap gap-2">
                  {isVerified && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 uppercase tracking-wider">
                      Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Menu Block - Spans below the profile card */}
          <div className="md:col-span-8 lg:col-span-8">
            <MenuList items={menuItemsBlock1} />
          </div>

          {/* Secondary Menu Block - Bottom Left on Desktop, Bottom on Mobile */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 p-1 sm:p-2">
              {/* Delete Account */}
              <button 
                onClick={onDeleteClick}
                className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-xl group active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <span className="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-base whitespace-nowrap truncate">Delete Account</span>
                </div>
                <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors flex-shrink-0 ml-1" />
              </button>

              {/* Dark Mode Toggle */}
              <div className="w-full flex items-center justify-between p-2 sm:p-3 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-yellow-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base whitespace-nowrap truncate">Dark Mode</span>
                </div>
                {/* Toggle Switch */}
                <button 
                  onClick={onToggleDarkMode}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-brand-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
};

export default ProfilePage;
