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

  // Flat menu items listing exactly like mockup and keeping all original options
  const allMenuItems = [
    { icon: FileText, label: 'My Posts', color: 'bg-purple-100 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400', action: () => alert('Your community posts are listed on the Home page feed!') },
    { icon: Heart, label: 'Liked Posts', color: 'bg-pink-100 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400', action: () => alert('Coming soon!') },
    { icon: Bookmark, label: 'Saved Posts', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400', action: () => alert('Coming soon!') },
    { icon: Wallet, label: 'My Wallet', color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400', value: `৳ ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, action: onTransactionsClick },
    { icon: Users, label: 'My Referrals', color: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400', action: onReferralsClick },
    { icon: Trophy, label: 'Leaderboard', color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400', action: onLeaderboardClick },
    { icon: History, label: 'Transaction History', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400', action: onTransactionsClick },
    { icon: ShieldCheck, label: 'Verify Account', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400', action: () => setShowEmailVerifyModal(true) },
    { icon: Lock, label: 'Change Password', color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-500 dark:text-rose-450', action: onPasswordClick },
    { icon: Globe, label: 'Language', color: 'bg-teal-100 dark:bg-teal-950/40 text-teal-500 dark:text-teal-400', action: onLanguageClick },
    { icon: Bell, label: 'Notifications', color: 'bg-orange-100 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400', action: onNotificationClick },
    { icon: Shield, label: 'Privacy & Security Settings', color: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400', action: onSettingsClick },
    { icon: HeadphonesIcon, label: 'Contact Support', color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 dark:text-cyan-400', action: onSupportClick },
    { icon: Moon, label: 'Dark Mode', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400', isToggle: true, action: onToggleDarkMode },
    { icon: Trash2, label: 'Delete Account', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500', isDelete: true, action: onDeleteClick }
  ];

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen pb-28 flex flex-col relative select-none">
          
          {/* Top Transparent Header Section */}
          <div className="pt-6 px-4">
            <div className="max-w-md mx-auto w-full space-y-4">
              
              {/* Header Toolbar (Matches mockup top bar) */}
              <div className="flex items-center justify-between relative shrink-0">
                <button 
                  onClick={onBack}
                  className="hover:scale-110 transition-transform active:scale-90"
                >
                  <ArrowLeft className="w-6.5 h-6.5 text-slate-800 dark:text-slate-200" />
                </button>
                <h1 className="text-lg font-black text-slate-850 dark:text-white absolute left-1/2 -translate-x-1/2">Profile</h1>
                <button 
                  onClick={openEditProfileModal}
                  className="hover:scale-110 transition-transform active:scale-90"
                  title="Edit Profile"
                >
                  <Edit3 className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                </button>
              </div>

              {/* Profile Info Section (Avatar glow ring and metadata - HORIZONTAL) */}
              <div className="flex items-center gap-5 px-1 mt-4">
                <div className="relative shrink-0">
                  {/* Glowing neon purple border wrapper */}
                  <div className="relative p-1 bg-gradient-to-tr from-[#00ffff] via-[#818cf8] to-[#c084fc] rounded-full shadow-lg">
                    <div 
                      onClick={triggerFileInput}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-sm bg-slate-100 flex items-center justify-center cursor-pointer relative group"
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
                  <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-emerald-500 rounded-full border-3 border-white dark:border-slate-900 shadow-xs animate-pulse" />
                </div>

                {/* Text metadata - Left Aligned */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-slate-850 dark:text-white flex items-center gap-1.5 truncate">
                    {userName}
                    {isEmailVerified && (
                      <VerifiedBadge iconClassName="w-[18.5px] h-[18.5px] fill-blue-500 text-white flex-shrink-0" />
                    )}
                  </h2>
                  
                  {/* Auto-generated professional profile handle */}
                  <p className="text-[11.5px] font-black text-slate-500 dark:text-slate-400 tracking-wide font-mono mt-0.5">
                    @{userName.toLowerCase().replace(/\s+/g, '_')}
                  </p>

                  {/* Editable Status biography */}
                  <p className="text-[11.5px] font-semibold text-slate-600 dark:text-slate-350 leading-relaxed mt-1.5 select-text line-clamp-2">
                    {userBio}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="max-w-md mx-auto px-4 mt-4 w-full space-y-4">
            
            {/* Profile Statistics counts card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 flex justify-around text-center shadow-xs w-full">
              <div className="flex-1">
                <User strokeWidth={2.4} className="w-5.5 h-5.5 text-indigo-500 mx-auto" />
                <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{postsCount}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Posts</span>
              </div>
              <div className="flex-1">
                <Heart strokeWidth={2.4} className="w-5.5 h-5.5 text-pink-500 mx-auto fill-pink-500/10" />
                <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{formatCount(followersCount)}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Followers</span>
              </div>
              <div className="flex-1">
                <UserPlus strokeWidth={2.4} className="w-5.5 h-5.5 text-blue-500 mx-auto" />
                <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{formatCount(followingCount)}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Following</span>
              </div>
            </div>

            {/* Zenevio Premium Upgrade banner (Purple-blue gradient card) */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 rounded-3xl p-4.5 text-white flex items-center justify-between shadow-md relative overflow-hidden select-none w-full group">
              <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute bottom-[-30px] left-[-30px] w-20 h-20 bg-white/10 rounded-full blur-lg" />
              
              <div className="z-10 flex items-center gap-3.5">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-xs rounded-2xl flex items-center justify-center text-xl shadow-xs">
                  💎
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                    Zenevio Premium 👑
                  </h3>
                  <p className="text-[10px] text-white/85 font-semibold tracking-wide mt-0.5">Unlock exclusive features</p>
                </div>
              </div>

              <button 
                onClick={onVerifyClick}
                className="z-10 px-4.5 py-2.5 bg-white text-[#7C3AED] hover:scale-105 active:scale-95 transition-all text-xs font-black rounded-full flex items-center gap-0.5 shadow-md shadow-indigo-900/10 cursor-pointer"
              >
                Upgrade
                <ChevronRight className="w-4 h-4 text-[#7C3AED]" strokeWidth={3} />
              </button>
            </div>

            {/* Redesigned Menu list */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden flex flex-col w-full">
              {allMenuItems.map((item, idx) => {
                if (item.isToggle) {
                  return (
                    <div 
                      key={idx} 
                      className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                          <item.icon className="w-5 h-5" strokeWidth={2.4} />
                        </div>
                        <span className="text-slate-850 dark:text-slate-200 font-black text-[15px] truncate">{item.label}</span>
                      </div>
                      <button 
                        onClick={item.action}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-[#7C3AED]' : 'bg-slate-250 dark:bg-slate-800'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                }

                return (
                  <button 
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                        <item.icon className="w-5 h-5" strokeWidth={2.4} />
                      </div>
                      <span className={`font-black text-[15px] truncate ${item.isDelete ? 'text-rose-600 dark:text-rose-450' : 'text-slate-850 dark:text-slate-200'}`}>{item.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.value && (
                        <span className="text-xs sm:text-sm font-black text-[#7C3AED] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl">
                          {item.value}
                        </span>
                      )}
                      <ChevronRight className={`w-4.5 h-4.5 ${item.isDelete ? 'text-[#f43f5e]' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
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
