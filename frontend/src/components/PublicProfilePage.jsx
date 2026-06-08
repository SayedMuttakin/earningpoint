import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Share2, 
  ChevronDown, 
  Play, 
  Heart, 
  Loader2,
  FileText,
  MessageCircle,
  Globe,
  User,
  UserPlus,
  Camera,
  MapPin,
  Link as LinkIcon,
  Grid,
  Bookmark,
  ShoppingBag,
  Plus,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';

const formatCount = (num) => {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

const formatRelativeTime = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

const PublicProfilePage = ({ userId, onBack, currentUser, isOwnProfile, setActiveTab, setSelectedReelId, setActiveChatPartner }) => {
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // 4-icon tabs navigation: 'grid', 'reels', 'shop', 'saved'
  const [activeSubTab, setActiveSubTab] = useState('grid');
  
  // Highlights Modal State
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [hlTitle, setHlTitle] = useState('');
  const [hlCover, setHlCover] = useState('');
  const [hlSelectedPosts, setHlSelectedPosts] = useState([]);

  // Story Highlights Player State
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [hlActiveIndex, setHlActiveIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyMuted, setStoryMuted] = useState(true);

  // Post Detail Modal State
  const [selectedDetailPost, setSelectedDetailPost] = useState(null);

  // Refs for File Uploads
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const highlightCoverInputRef = useRef(null);

  const isOwn = isOwnProfile || userId === 'me' || (profile && currentUser && (profile._id === currentUser._id || profile._id === currentUser.id));

  const fetchPublicProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setVideos(data.videos || []);
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  // Handle auto-advancing story highlights
  useEffect(() => {
    if (!activeHighlight || !activeHighlight.posts || activeHighlight.posts.length === 0) {
      setStoryProgress(0);
      return;
    }

    const STORY_DURATION = 5000; // 5 seconds per story slide
    const intervalTime = 50; 
    const step = (intervalTime / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeHighlight, hlActiveIndex]);

  const handleNextStory = () => {
    if (!activeHighlight) return;
    setStoryProgress(0);
    if (hlActiveIndex < activeHighlight.posts.length - 1) {
      setHlActiveIndex(prev => prev + 1);
    } else {
      setActiveHighlight(null);
      setHlActiveIndex(0);
    }
  };

  const handlePrevStory = () => {
    if (!activeHighlight) return;
    setStoryProgress(0);
    if (hlActiveIndex > 0) {
      setHlActiveIndex(prev => prev - 1);
    } else {
      setStoryProgress(0); // restart first story
    }
  };

  const handlePlayHighlight = (hl) => {
    if (!hl.posts || hl.posts.length === 0) return;
    setActiveHighlight(hl);
    setHlActiveIndex(0);
    setStoryProgress(0);
  };

  // Upload/Change Cover photo
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setProfile(prev => ({ ...prev, coverPic: base64 }));
        
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/profile/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ coverPic: base64 })
          });
          if (res.ok) {
            fetchPublicProfile();
          }
        } catch (err) {
          console.error('Failed to save cover photo:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload/Change Profile photo
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setProfile(prev => ({ ...prev, profilePic: base64 }));
        
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/profile/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ profilePic: base64 })
          });
          if (res.ok) {
            fetchPublicProfile();
          }
        } catch (err) {
          console.error('Failed to save profile picture:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload highlight cover photo
  const handleHighlightCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHlCover(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select/Deselect post inside highlight modal
  const handleTogglePostSelect = (postId) => {
    setHlSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  // Close creation highlight modal
  const handleCloseHighlightModal = () => {
    setShowHighlightModal(false);
    setHlTitle('');
    setHlCover('');
    setHlSelectedPosts([]);
  };

  // Create Highlight Submission
  const handleCreateHighlightSubmit = async () => {
    if (!hlTitle.trim() || hlSelectedPosts.length === 0) return;

    const newHighlight = {
      title: hlTitle.trim(),
      cover: hlCover,
      posts: hlSelectedPosts
    };

    const updatedHighlights = [...(profile.highlights || []), newHighlight];
    handleCloseHighlightModal();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlights: updatedHighlights })
      });
      if (res.ok) {
        fetchPublicProfile();
      }
    } catch (err) {
      console.error('Failed to save highlight:', err);
    }
  };

  // Delete Highlight (Owner only)
  const handleDeleteHighlight = async (indexToDelete) => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) return;
    
    const updatedHighlights = (profile.highlights || []).filter((_, idx) => idx !== indexToDelete);
    setProfile(prev => ({ ...prev, highlights: updatedHighlights }));

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlights: updatedHighlights })
      });
    } catch (err) {
      console.error('Failed to delete highlight:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (actionLoading || !profile) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.isFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1)
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!profile) return;
    if (setActiveChatPartner) {
      setActiveChatPartner({
        _id: profile._id,
        name: profile.name,
        profilePic: profile.profilePic || profile.googleAvatar || ''
      });
    }
    if (setActiveTab) {
      setActiveTab('Messenger');
    }
  };

  // Combined posts and reels list for Selection in Highlight modal
  const allSelectablePosts = [
    ...posts.map(p => ({ ...p, video: null })),
    ...videos.map(v => ({ ...v, content: v.title || 'Video Reel', image: null }))
  ];

  const totalPosts = (videos ? videos.length : 0) + (posts ? posts.length : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-slate-400 font-bold text-sm">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-slate-500 dark:text-slate-400 font-bold">User profile could not be loaded.</p>
        <button 
          onClick={onBack}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-850 dark:text-slate-100 flex flex-col no-scrollbar">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-900">
        {isOwn ? (
          <div className="w-10" />
        ) : (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-350 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h2 className="font-extrabold text-sm truncate max-w-[50%]">{profile.username}</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-350">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-350">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Cover Banner */}
      <div className="relative w-full h-44 sm:h-52 bg-slate-200 dark:bg-slate-800 overflow-hidden group">
        {profile.coverPic ? (
          <img
            src={profile.coverPic.startsWith('http') || profile.coverPic.startsWith('/api') || profile.coverPic.startsWith('data:')
              ? profile.coverPic
              : `${API_BASE}/api/image?file=${encodeURIComponent(profile.coverPic)}`}
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-violet-650 via-indigo-600 to-purple-700 flex items-center justify-center opacity-90">
            <span className="text-white/20 font-black tracking-widest text-lg select-none">ZENIVIO</span>
          </div>
        )}
        
        {isOwn && (
          <>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all active:scale-90 shadow-md border border-white/20"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={coverInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleCoverUpload}
            />
          </>
        )}
      </div>

      {/* Centered Avatar and Info Overlap */}
      <div className="relative flex flex-col items-center px-4 -mt-14 sm:-mt-16">
        <div className="relative group">
          {/* Glowing ring/border */}
          <div className="p-1 bg-gradient-to-tr from-[#00ffff] via-[#818cf8] to-[#c084fc] rounded-full shadow-xl">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-950 bg-slate-100 flex items-center justify-center relative">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:')
                    ? profile.profilePic
                    : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
          
          {isOwn && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all active:scale-90 shadow-lg border-2 border-white dark:border-slate-950"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </>
          )}
          
          {!isOwn && (
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-550 rounded-full border-4 border-white dark:border-slate-950 shadow-md animate-pulse" />
          )}
        </div>

        {/* User Details */}
        <div className="text-center mt-3.5 space-y-1 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            {profile.name}
            {profile.isEmailVerified && (
              <VerifiedBadge iconClassName="w-5 h-5 fill-blue-500 text-white flex-shrink-0" />
            )}
          </h2>
          
          <p className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-wide font-mono">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 leading-relaxed px-4 pt-1 max-w-sm mx-auto whitespace-pre-wrap select-text">
              {profile.bio}
            </p>
          )}

          {/* Location & Website row */}
          {(profile.location || profile.website) && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{profile.location}</span>
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{profile.website.replace(/(^\w+:|^)\/\//, '')}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Statistics counts card */}
      <div className="max-w-md mx-auto w-full px-4 mt-5">
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 flex justify-around text-center shadow-xs border border-slate-100 dark:border-slate-800/50">
          <div className="flex-1">
            <span className="text-base font-black text-slate-900 dark:text-white block">{totalPosts}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Posts</span>
          </div>
          <div className="flex-1 border-x border-slate-100 dark:border-slate-800/50">
            <span className="text-base font-black text-slate-900 dark:text-white block">{formatCount(profile.followersCount)}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Followers</span>
          </div>
          <div className="flex-1">
            <span className="text-base font-black text-slate-900 dark:text-white block">{formatCount(profile.followingCount)}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Following</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md mx-auto">
        {isOwn ? (
          <div className="flex items-center gap-3 select-none justify-center px-4 mt-4 w-full">
            <button 
              onClick={() => setActiveTab('EditProfile')}
              className="flex-1 py-2.5 rounded-full font-black text-sm bg-indigo-650 hover:bg-indigo-750 text-white transition-all active:scale-95 shadow-md shadow-indigo-650/15"
            >
              Edit Profile
            </button>
            
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${profile.name}'s Profile`,
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied to clipboard!');
                }
              }}
              className="px-4 py-2.5 rounded-full font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200/40 dark:border-slate-850"
            >
              Share
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 select-none justify-center px-4 mt-4 w-full">
            <button 
              disabled={actionLoading}
              onClick={handleFollowToggle}
              className={`flex-1 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-md ${
                profile.isFollowing 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-250 dark:hover:bg-slate-750' 
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-650 hover:to-rose-655 text-white shadow-rose-500/25'
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : profile.isFollowing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </button>
            
            <button 
              onClick={handleMessageClick}
              className="flex-1 py-2.5 rounded-full font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs border border-slate-200/40 dark:border-slate-850"
            >
              Message
            </button>

            <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200/40 dark:border-slate-850">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Instagram-Style Story Highlights */}
      {(profile.highlights?.length > 0 || isOwn) && (
        <div className="w-full max-w-md mx-auto px-4 mt-5 select-none">
          <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
            {/* + New Highlight button */}
            {isOwn && (
              <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => setShowHighlightModal(true)}>
                <div className="w-16 h-16 rounded-full border border-dashed border-slate-350 dark:border-slate-700 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                  <Plus className="w-6 h-6 text-slate-450 dark:text-slate-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">New</span>
              </div>
            )}

            {/* Render highlights */}
            {profile.highlights?.map((hl, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group relative"
                onClick={() => handlePlayHighlight(hl)}
              >
                <div className="p-[2px] bg-slate-200 dark:bg-slate-800 rounded-full group-hover:scale-105 transition-transform duration-200">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-950 bg-slate-100 flex items-center justify-center">
                    {hl.cover ? (
                      <img
                        src={hl.cover.startsWith('http') || hl.cover.startsWith('/api') || hl.cover.startsWith('data:')
                          ? hl.cover
                          : `${API_BASE}/api/image?file=${encodeURIComponent(hl.cover)}`}
                        alt={hl.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-rose-400 to-indigo-500 flex items-center justify-center text-white font-black text-base uppercase">
                        {hl.title?.charAt(0) || 'H'}
                      </div>
                    )}
                  </div>
                </div>
                
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 max-w-[70px] truncate text-center">
                  {hl.title}
                </span>

                {/* Delete button (Owner only) */}
                {isOwn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHighlight(index);
                    }}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-650 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs z-10"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4-Icon Tabs Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-around py-3 select-none mt-5">
          <button 
            onClick={() => setActiveSubTab('grid')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'grid' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Grid className="w-5 h-5" />
            {activeSubTab === 'grid' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('reels')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'reels' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            {activeSubTab === 'reels' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('shop')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'shop' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {activeSubTab === 'shop' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('saved')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'saved' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            {activeSubTab === 'saved' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-2 px-1">
          {activeSubTab === 'grid' ? (
            posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map(post => (
                  <div
                    key={post._id}
                    onClick={() => setSelectedDetailPost(post)}
                    className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/20 shadow-xs cursor-pointer group hover:opacity-95 active:scale-98 transition-all"
                  >
                    {post.image ? (
                      <img
                        src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:')
                          ? post.image
                          : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full p-2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex flex-col justify-between text-left">
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-4 leading-normal select-none">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
                          <span>Post</span>
                          <span>{formatRelativeTime(post.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {/* Likes/Comments Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-black z-10 select-none">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-white text-white" />
                        {formatCount(post.likesCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 fill-white text-white" />
                        {formatCount(post.commentsCount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl text-slate-450 font-bold text-xs select-none">
                No posts published yet.
              </div>
            )
          ) : activeSubTab === 'reels' ? (
            videos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                {videos.map(video => (
                  <div 
                    key={video._id}
                    onClick={() => {
                      if (setSelectedReelId && setActiveTab) {
                        setSelectedReelId(video._id);
                        setActiveTab('Video');
                      }
                    }}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/20 shadow-sm cursor-pointer group active:scale-98 transition-transform select-none"
                  >
                    <video 
                      src={video.video.startsWith('http') || video.video.startsWith('/api') || video.video.startsWith('data:') ? video.video : `${API_BASE}/api/image?file=${encodeURIComponent(video.video)}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-extrabold text-white">
                      <Play className="w-2.5 h-2.5 fill-white text-white" />
                      <span>{formatCount(video.views)}</span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-extrabold text-white">
                      <Heart className="w-2.5 h-2.5 fill-red-500 stroke-red-500" />
                      <span>{formatCount(video.likesCount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl text-slate-450 font-bold text-xs select-none">
                No videos uploaded yet.
              </div>
            )
          ) : activeSubTab === 'shop' ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl select-none flex flex-col items-center gap-3">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-indigo-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">Shop is Empty</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                This creator hasn't added any products or digital goods for sale yet.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl select-none flex flex-col items-center gap-3">
              <div className="p-4 bg-pink-50 dark:bg-pink-950/30 rounded-full text-pink-500">
                <Bookmark className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">No Saved Posts</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                Posts and videos saved by this user are private. Only the profile owner can view their saved items.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Story Highlights Creation Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md border border-slate-200/50 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white">Create Story Highlight</h3>
              <button 
                onClick={handleCloseHighlightModal} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
              {/* Title Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Highlight Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Vibes ☀️"
                  value={hlTitle}
                  onChange={(e) => setHlTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Cover Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                    {hlCover ? (
                      <img src={hlCover} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => highlightCoverInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                  >
                    Choose Photo
                  </button>
                  <input
                    type="file"
                    ref={highlightCoverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleHighlightCoverChange}
                  />
                </div>
              </div>

              {/* Post List */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Select Posts to Include</label>
                {allSelectablePosts.length > 0 ? (
                  <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                    {allSelectablePosts.map((post) => {
                      const isSelected = hlSelectedPosts.includes(post._id);
                      return (
                        <div 
                          key={post._id}
                          onClick={() => handleTogglePostSelect(post._id)}
                          className={`flex items-center gap-3 p-2 border rounded-2xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' 
                              : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isSelected 
                              ? 'bg-indigo-500 border-indigo-500 text-white' 
                              : 'border-slate-350 dark:border-slate-755'
                          }`}>
                            {isSelected && <span className="text-[10px] font-black">✓</span>}
                          </div>

                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 flex items-center justify-center text-[8px] border border-slate-100 dark:border-slate-800">
                            {post.video ? (
                              <video 
                                src={post.video.startsWith('http') || post.video.startsWith('/api') || post.video.startsWith('data:') ? post.video : `${API_BASE}/api/image?file=${encodeURIComponent(post.video)}`}
                                className="w-full h-full object-cover" 
                                muted 
                              />
                            ) : post.image ? (
                              <img 
                                src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-750 dark:text-slate-300 truncate">
                              {post.content}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">
                              {post.video ? 'Video Reel' : 'Community Post'} • {formatRelativeTime(post.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-bold">
                    You haven't uploaded any posts or videos yet.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={handleCloseHighlightModal}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateHighlightSubmit}
                disabled={!hlTitle.trim() || hlSelectedPosts.length === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-indigo-650 hover:bg-indigo-700 text-white transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                Save Highlight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Story Highlights Viewer */}
      {activeHighlight && activeHighlight.posts && activeHighlight.posts.length > 0 && (
        <div className="fixed inset-0 z-[150] bg-black flex flex-col justify-between select-none">
          {/* Progress indicators */}
          <div className="absolute top-4 left-0 right-0 z-[160] px-3 flex gap-1.5">
            {activeHighlight.posts.map((_, idx) => {
              let width = '0%';
              if (idx < hlActiveIndex) width = '100%';
              else if (idx === hlActiveIndex) width = `${storyProgress}%`;

              return (
                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-[50ms] ease-linear" 
                    style={{ width }} 
                  />
                </div>
              );
            })}
          </div>

          {/* User Info Header */}
          <div className="absolute top-8 left-0 right-0 z-[160] px-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-slate-800">
                {profile.profilePic ? (
                  <img 
                    src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:') 
                      ? profile.profilePic 
                      : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black uppercase">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                  {profile.name}
                  {profile.isEmailVerified && (
                    <VerifiedBadge iconClassName="w-3.5 h-3.5 fill-blue-500 text-white" />
                  )}
                </h4>
                <p className="text-[9px] text-white/60 font-semibold">{activeHighlight.title}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveHighlight(null);
                setHlActiveIndex(0);
              }}
              className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tap Overlays */}
          <div className="absolute inset-0 z-[155] flex">
            <div className="w-[30%] h-full cursor-w-resize" onClick={handlePrevStory} />
            <div className="w-[70%] h-full cursor-e-resize" onClick={handleNextStory} />
          </div>

          {/* Core Media Slide */}
          <div className="w-full h-full flex items-center justify-center bg-black">
            {activeHighlight.posts[hlActiveIndex]?.video ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video 
                  src={activeHighlight.posts[hlActiveIndex].video.startsWith('http') || activeHighlight.posts[hlActiveIndex].video.startsWith('/api') || activeHighlight.posts[hlActiveIndex].video.startsWith('data:') 
                    ? activeHighlight.posts[hlActiveIndex].video 
                    : `${API_BASE}/api/image?file=${encodeURIComponent(activeHighlight.posts[hlActiveIndex].video)}`}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted={storyMuted}
                  loop
                />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStoryMuted(!storyMuted);
                  }}
                  className="absolute bottom-20 right-4 p-2 bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-full text-white z-[158] border border-white/10"
                >
                  {storyMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            ) : activeHighlight.posts[hlActiveIndex]?.image ? (
              <img 
                src={activeHighlight.posts[hlActiveIndex].image.startsWith('http') || activeHighlight.posts[hlActiveIndex].image.startsWith('/api') || activeHighlight.posts[hlActiveIndex].image.startsWith('data:') 
                  ? activeHighlight.posts[hlActiveIndex].image 
                  : `${API_BASE}/api/image?file=${encodeURIComponent(activeHighlight.posts[hlActiveIndex].image)}`} 
                alt="" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center px-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-center select-text">
                <p className="text-lg sm:text-xl font-bold text-white leading-relaxed max-w-sm whitespace-pre-wrap">
                  {activeHighlight.posts[hlActiveIndex]?.content || 'Story Details'}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Captions Overlay */}
          {activeHighlight.posts[hlActiveIndex] && (activeHighlight.posts[hlActiveIndex].image || activeHighlight.posts[hlActiveIndex].video) && activeHighlight.posts[hlActiveIndex].content && (
            <div className="absolute bottom-12 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-center text-white z-[157] pointer-events-none select-text">
              <p className="text-xs sm:text-sm font-semibold max-w-sm mx-auto line-clamp-3 leading-relaxed">
                {activeHighlight.posts[hlActiveIndex].content}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedDetailPost && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in" onClick={() => setSelectedDetailPost(null)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md border border-slate-200/50 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
                  {profile.profilePic ? (
                    <img 
                      src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:') 
                        ? profile.profilePic 
                        : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black uppercase">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-850 dark:text-white flex items-center gap-1">
                    {profile.name}
                    {profile.isEmailVerified && (
                      <VerifiedBadge iconClassName="w-3.5 h-3.5 fill-blue-500 text-white" />
                    )}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                    {formatRelativeTime(selectedDetailPost.createdAt)}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedDetailPost(null)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
              {selectedDetailPost.content && (
                <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold leading-relaxed whitespace-pre-wrap text-left select-text">
                  {selectedDetailPost.content}
                </p>
              )}

              {selectedDetailPost.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex items-center justify-center w-full max-h-[350px]">
                  <img 
                    src={selectedDetailPost.image.startsWith('http') || selectedDetailPost.image.startsWith('/api') || selectedDetailPost.image.startsWith('data:') 
                      ? selectedDetailPost.image 
                      : `${API_BASE}/api/image?file=${encodeURIComponent(selectedDetailPost.image)}`} 
                    alt="Attachment"
                    className="w-full h-auto object-contain max-h-[350px]"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-850 text-xs font-black text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Heart className="w-4.5 h-4.5 text-red-500 fill-red-500" />
                {selectedDetailPost.likesCount} Likes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4.5 h-4.5 text-indigo-500" />
                {selectedDetailPost.commentsCount} Comments
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
