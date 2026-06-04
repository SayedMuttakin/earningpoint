import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config';
import {
  Settings,
  History,
  Users,
  User,
  ShieldCheck,
  Lock,
  Globe,
  HeadphonesIcon,
  FileText,
  Trash2,
  Moon,
  ChevronRight,
  Camera,
  Trophy,
  ArrowLeft,
  Heart,
  UserPlus,
  Wallet,
  Bell,
  Shield,
  Edit3,
  Bookmark,
  Award,
  Loader2,
  X
} from 'lucide-react';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import VerifiedBadge from './VerifiedBadge';
import EmailVerifyModal from './EmailVerifyModal';

const ProfilePage = ({ 
  onBack, 
  onVerifyClick, 
  onLanguageClick, 
  onPasswordClick, 
  onReferralsClick, 
  onLeaderboardClick, 
  onTermsClick, 
  onDeleteClick, 
  onNotificationClick,
  onSettingsClick,
  darkMode, 
  onToggleDarkMode, 
  onTransactionsClick, 
  onSupportClick 
}) => {
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userBio, setUserBio] = useState('Dream Big. Stay Positive. ✨');
  const [userBalance, setUserBalance] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);
  
  // Stats Counts
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Email Verification
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  
  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPicPreview, setEditPicPreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
        setUserBio(data.bio || 'Dream Big. Stay Positive. ✨');
        setUserBalance(data.balance || 0);
        setPostsCount(data.postsCount || 0);
        setFollowersCount(data.followersCount || 0);
        setFollowingCount(data.followingCount || 0);
        if (data.profilePic) setProfilePic(data.profilePic);
      }

      if (verificationRes.ok) {
        const vData = await verificationRes.json();
        setIsVerified(vData.status === 'approved');
      }

      // Fetch email verification status
      const emailRes = await fetch(`${API_BASE}/api/email-verify/status`, { headers: { Authorization: `Bearer ${token}` } });
      if (emailRes.ok) {
        const eData = await emailRes.json();
        setIsEmailVerified(eData.isEmailVerified);
        setVerifiedEmail(eData.verifiedEmail || '');
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

  // Convert image to base64
  const processImageChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle direct avatar uploads (from camera icon on page)
  const handleDirectImageUpload = (e) => {
    processImageChange(e, async (base64) => {
      setProfilePic(base64);
      // Automatically save to backend
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/profile/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ profilePic: base64 })
        });
      } catch (err) {
        console.error('Failed to save profile pic:', err);
      }
    });
  };

  // Edit Profile Modal handlers
  const openEditProfileModal = () => {
    setEditName(userName);
    setEditBio(userBio);
    setEditPicPreview(profilePic);
    setShowEditModal(true);
  };

  const handleModalImageChange = (e) => {
    processImageChange(e, (base64) => {
      setEditPicPreview(base64);
    });
  };

  const handleSaveProfileSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editLoading) return;

    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim(),
          profilePic: editPicPreview
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserName(data.name || 'User');
        setUserBio(data.bio || 'Dream Big. Stay Positive. ✨');
        if (data.profilePic) setProfilePic(data.profilePic);
        setShowEditModal(false);
        alert('Profile details updated successfully!');
      }
    } catch (err) {
      console.error('Failed to save profile updates:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  // Menu items grouped into clean mockup list items
  const menuGroup1 = [
    { icon: FileText, label: 'My Posts', color: 'bg-purple-100 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400', action: () => alert('Your community posts are listed on the Home page feed!') },
    { icon: Heart, label: 'Liked Posts', color: 'bg-pink-100 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400', action: () => alert('Coming soon!') },
    { icon: Bookmark, label: 'Saved Posts', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400', action: () => alert('Coming soon!') },
    { icon: Wallet, label: 'My Wallet', color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400', value: `৳ ${userBalance.toFixed(2)}`, action: onTransactionsClick },
  ];

  const menuGroup2 = [
    { icon: Users, label: 'My Referrals', color: 'bg-indigo-105 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400', action: onReferralsClick },
    { icon: Trophy, label: 'Leaderboard', color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400', action: onLeaderboardClick },
    { icon: History, label: 'Transaction History', color: 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400', action: onTransactionsClick },
  ];

  const menuGroup3 = [
    { icon: ShieldCheck, label: 'Verify Account', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400', action: () => setShowEmailVerifyModal(true) },
    { icon: Lock, label: 'Change Password', color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-500 dark:text-rose-450', action: onPasswordClick },
    { icon: Globe, label: 'Language', color: 'bg-teal-100 dark:bg-teal-950/40 text-teal-500 dark:text-teal-400', action: onLanguageClick },
    { icon: Bell, label: 'Notifications', color: 'bg-orange-100 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400', action: onNotificationClick },
    { icon: Shield, label: 'Privacy & Security Settings', color: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400', action: onSettingsClick },
  ];

  const MenuSectionList = ({ items }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-[2.2rem] p-2 space-y-1 shadow-2xs">
      {items.map((item, idx) => (
        <button 
          key={idx}
          onClick={item.action}
          className="w-full flex items-center justify-between p-3 hover:bg-slate-55/65 dark:hover:bg-slate-850/60 transition-all rounded-2xl group active:scale-[0.99] text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-2xs`}>
              <item.icon className="w-5 h-5" strokeWidth={2.4} />
            </div>
            <span className="text-slate-850 dark:text-slate-200 font-bold text-sm sm:text-[15px] truncate">{item.label}</span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.value && (
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-350 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {item.value}
              </span>
            )}
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="w-full bg-gradient-to-b from-indigo-50/30 via-slate-50 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 min-h-screen pb-28 flex flex-col relative select-none">
          
          {/* Banner Ad */}
          <div className="sticky top-16 z-30 w-full bg-slate-50 dark:bg-slate-950 pb-2 pt-2 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4">
            <BannerAd globalSettings={globalSettings} />
          </div>

          <div className="max-w-md mx-auto px-4 pt-6 w-full space-y-6">
            
            {/* Header Toolbar (Matches mockup top bar) */}
            <div className="flex items-center justify-between relative shrink-0">
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-xs"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
              <h1 className="text-lg font-black text-slate-850 dark:text-white absolute left-1/2 -translate-x-1/2">Profile</h1>
              <button 
                onClick={openEditProfileModal}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-xs"
                title="Edit Profile"
              >
                <Edit3 className="w-4.5 h-4.5 text-slate-750 dark:text-slate-350" />
              </button>
            </div>

            {/* Profile Info Section (Avatar glow ring and metadata) */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="relative">
                {/* Glowing neon purple border wrapper */}
                <div className="relative p-1 bg-gradient-to-tr from-[#38bdf8] via-[#818cf8] to-[#c084fc] rounded-full shadow-lg">
                  <div 
                    onClick={triggerFileInput}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-sm bg-slate-100 flex items-center justify-center cursor-pointer relative group"
                  >
                    {profilePic ? (
                      <img 
                        src={profilePic.startsWith('http') || profilePic.startsWith('/api') || profilePic.startsWith('data:') ? profilePic : `${API_BASE}/api/image?file=${profilePic}`}
                        alt="Avatar" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-3xl font-black">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Hover camera edit overlay */}
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleDirectImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                {/* Online status indicator dot (Mockup styling) */}
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
              </div>

              {/* Text metadata */}
              <div className="space-y-1.5 w-full">
                <h2 className="text-xl font-black text-slate-850 dark:text-white flex items-center justify-center gap-1.5">
                  {userName}
                  {isEmailVerified && (
                    <VerifiedBadge iconClassName="w-[18.5px] h-[18.5px] fill-blue-500 text-white flex-shrink-0" />
                  )}
                </h2>
                
                {/* Auto-generated professional profile handle */}
                <p className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 tracking-wide font-mono uppercase bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full w-fit mx-auto">
                  @{userName.toLowerCase().replace(/\s+/g, '')}
                </p>

                {/* Editable Status biography */}
                <p className="text-xs font-black text-slate-450 dark:text-slate-400 max-w-xs mx-auto leading-relaxed pt-1 select-text">
                  {userBio}
                </p>
              </div>
            </div>

            {/* Profile Statistics counts card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-5 flex justify-around text-center shadow-2xs w-full">
              <div className="flex-1 border-r border-slate-100 dark:border-slate-850">
                <User strokeWidth={2.4} className="w-5 h-5 text-indigo-500 mx-auto" />
                <span className="text-base font-black text-slate-850 dark:text-white block mt-2.5">{postsCount}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Posts</span>
              </div>
              <div className="flex-1 border-r border-slate-100 dark:border-slate-850">
                <Heart strokeWidth={2.4} className="w-5 h-5 text-pink-500 mx-auto fill-pink-500/10" />
                <span className="text-base font-black text-slate-850 dark:text-white block mt-2.5">{formatCount(followersCount)}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Followers</span>
              </div>
              <div className="flex-1">
                <UserPlus strokeWidth={2.4} className="w-5 h-5 text-blue-500 mx-auto" />
                <span className="text-base font-black text-slate-850 dark:text-white block mt-2.5">{formatCount(followingCount)}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Following</span>
              </div>
            </div>

            {/* Zenevio Premium Upgrade banner (Purple-blue gradient card) */}
            <div className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] rounded-3xl p-4.5 text-white flex items-center justify-between shadow-lg relative overflow-hidden select-none w-full group">
              <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute bottom-[-30px] left-[-30px] w-20 h-20 bg-white/10 rounded-full blur-lg" />
              
              <div className="z-10 flex items-center gap-3.5">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-xs rounded-2xl flex items-center justify-center text-xl shadow-xs">
                  💎
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                    Zenevio Premium {isVerified && '👑'}
                  </h3>
                  <p className="text-[10px] text-white/80 font-bold tracking-wide mt-0.5">Unlock exclusive rewards & features</p>
                </div>
              </div>

              <button 
                onClick={onVerifyClick}
                className="z-10 px-4.5 py-2.5 bg-white text-[#7C3AED] hover:scale-105 active:scale-95 transition-all text-xs font-black rounded-2xl flex items-center gap-1 shadow-md shadow-indigo-900/10 cursor-pointer"
              >
                Upgrade
                <ChevronRight className="w-4 h-4 text-[#7C3AED]" strokeWidth={2.8} />
              </button>
            </div>

            {/* Redesigned Menu sections */}
            <div className="space-y-4 w-full">
              <MenuSectionList items={menuGroup1} />
              <MenuSectionList items={menuGroup2} />
              <MenuSectionList items={menuGroup3} />
              
              {/* Settings & System block */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-[2.2rem] p-2 space-y-1 shadow-2xs">
                
                {/* Contact Support */}
                <button 
                  onClick={onSupportClick}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-55/65 dark:hover:bg-slate-850/60 transition-all rounded-2xl group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 dark:text-cyan-400 shadow-2xs">
                      <HeadphonesIcon className="w-5 h-5" strokeWidth={2.4} />
                    </div>
                    <span className="text-slate-850 dark:text-slate-200 font-bold text-sm sm:text-[15px] truncate">Contact Support</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
                </button>

                {/* Dark Mode toggle switch */}
                <div className="w-full flex items-center justify-between p-3 rounded-2xl">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 shadow-2xs">
                      <Moon className="w-5 h-5" strokeWidth={2.4} />
                    </div>
                    <span className="text-slate-850 dark:text-slate-200 font-bold text-sm sm:text-[15px] truncate">Dark Mode</span>
                  </div>
                  
                  {/* Slider Toggle */}
                  <button 
                    onClick={onToggleDarkMode}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-[#7C3AED]' : 'bg-slate-250 dark:bg-slate-800'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Delete Account */}
                <button 
                  onClick={onDeleteClick}
                  className="w-full flex items-center justify-between p-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all rounded-2xl group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-500 shadow-2xs">
                      <Trash2 className="w-5 h-5" strokeWidth={2.4} />
                    </div>
                    <span className="text-rose-600 dark:text-rose-450 font-bold text-sm sm:text-[15px] truncate">Delete Account</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-rose-350 group-hover:text-rose-500 transition-colors" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </PullToRefresh>

      {/* Edit Profile Details Modal overlay (Mockup Pencil action) */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowEditModal(false)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-transparent dark:border-slate-800 animate-fade-in-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 className="text-slate-850 dark:text-white font-black text-base">Edit Profile Info</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveProfileSubmit} className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
              
              {/* Profile Image Select */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative group">
                  <div 
                    onClick={() => modalFileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center relative cursor-pointer"
                  >
                    {editPicPreview ? (
                      <img 
                        src={editPicPreview.startsWith('http') || editPicPreview.startsWith('/api') || editPicPreview.startsWith('data:') ? editPicPreview : `${API_BASE}/api/image?file=${editPicPreview}`}
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 text-xl font-black">
                        {editName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="absolute -bottom-0.5 -right-0.5 p-1.5 bg-[#7C3AED] text-white rounded-full shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input 
                  type="file" 
                  ref={modalFileInputRef}
                  onChange={handleModalImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tap to change avatar</span>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter display name"
                  required
                  maxLength={30}
                  className="w-full bg-slate-55/40 dark:bg-slate-850 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Bio / Status Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Status Biography</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Dream Big. Stay Positive..."
                  maxLength={100}
                  rows={3}
                  className="w-full bg-slate-55/40 dark:bg-slate-850 rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* Submit Save */}
              <button
                type="submit"
                disabled={!editName.trim() || editLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-black rounded-2xl shadow-md shadow-indigo-650/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-4"
              >
                {editLoading ? (
                  <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving changes...</>
                ) : (
                  'Save Profile Details'
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerifyModal && (
        <EmailVerifyModal
          onClose={() => setShowEmailVerifyModal(false)}
          onSuccess={() => {
            setIsEmailVerified(true);
            fetchProfile();
          }}
        />
      )}
    </>
  );
};

export default ProfilePage;
