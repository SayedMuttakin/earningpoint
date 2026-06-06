import React, { useState, useEffect } from 'react';
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
  UserPlus
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
  const [activeSubTab, setActiveSubTab] = useState('reels'); // 'reels' or 'posts'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-850 dark:text-slate-100 flex flex-col">
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

      {/* Main Profile Info Section */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-5 flex-1">
        {/* Profile Info Section (Avatar glow ring and metadata - HORIZONTAL) */}
        <div className="flex items-center gap-5 px-1 mt-4">
          <div className="relative shrink-0">
            {/* Glowing neon gradient border wrapper */}
            <div className="relative p-1 bg-gradient-to-tr from-[#00ffff] via-[#818cf8] to-[#c084fc] rounded-full shadow-lg">
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-sm bg-slate-100 flex items-center justify-center relative group"
              >
                {profile.profilePic ? (
                  <img 
                    src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:') 
                      ? profile.profilePic 
                      : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`} 
                    alt={profile.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-3xl font-black">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Online status indicator dot (Mockup styling) */}
            <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-emerald-500 rounded-full border-3 border-white dark:border-slate-900 shadow-xs animate-pulse" />
          </div>

          {/* Text metadata - Left Aligned */}
          <div className="flex-1 min-w-0 text-left">
            <h2 className="text-lg sm:text-xl font-black text-slate-850 dark:text-white flex items-center gap-1.5 truncate">
              {profile.name}
              {profile.isEmailVerified && (
                <VerifiedBadge iconClassName="w-[18.5px] h-[18.5px] fill-blue-500 text-white flex-shrink-0" />
              )}
            </h2>
            
            {/* Auto-generated professional profile handle */}
            <p className="text-[11.5px] font-black text-slate-500 dark:text-slate-400 tracking-wide font-mono mt-0.5">
              @{profile.username}
            </p>

            {/* Status biography */}
            <p className="text-[11.5px] font-semibold text-slate-600 dark:text-slate-350 leading-relaxed mt-1.5 select-text line-clamp-2">
              {profile.bio || 'Follow and support me!'}
            </p>
          </div>
        </div>

        {/* Profile Statistics counts card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 flex justify-around text-center shadow-xs w-full">
          <div className="flex-1">
            <User strokeWidth={2.4} className="w-5.5 h-5.5 text-indigo-500 mx-auto" />
            <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{totalPosts}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Posts</span>
          </div>
          <div className="flex-1">
            <Heart strokeWidth={2.4} className="w-5.5 h-5.5 text-pink-500 mx-auto fill-pink-500/10" />
            <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{formatCount(profile.followersCount)}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Followers</span>
          </div>
          <div className="flex-1">
            <UserPlus strokeWidth={2.4} className="w-5.5 h-5.5 text-blue-500 mx-auto" />
            <span className="text-base font-black text-slate-850 dark:text-white block mt-1.5">{formatCount(profile.followingCount)}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Following</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 select-none justify-center px-4 w-full">
          {isOwn ? (
            <>
              <button 
                onClick={() => setActiveTab && setActiveTab('EditProfile')}
                className="flex-1 py-2.5 rounded-full font-black text-sm bg-gradient-to-r from-[#7C3AED] to-brand-500 hover:from-indigo-650 hover:to-brand-600 text-white hover:opacity-95 shadow-md transition-all active:scale-95 text-center font-bold"
              >
                Edit Profile
              </button>
              
              <button 
                onClick={() => setActiveTab && setActiveTab('Setting')}
                className="flex-1 py-2.5 rounded-full font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs text-center font-bold"
              >
                Settings
              </button>
            </>
          ) : (
            <>
              <button 
                disabled={actionLoading}
                onClick={handleFollowToggle}
                className={`flex-1 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-md ${
                  profile.isFollowing 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-250 dark:hover:bg-slate-750' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-rose-500/25'
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
                className="flex-1 py-2.5 rounded-full font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs"
              >
                Message
              </button>

              <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Sub-Tabs Selector */}
        <div className="border-t border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-around py-2 select-none">
          <button 
            onClick={() => setActiveSubTab('reels')}
            className={`flex flex-col items-center gap-1 py-1.5 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${
              activeSubTab === 'reels' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Play className="w-4 h-4 fill-current" />
              <span>Videos ({videos.length})</span>
            </div>
            {activeSubTab === 'reels' && (
              <span className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('posts')}
            className={`flex flex-col items-center gap-1 py-1.5 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${
              activeSubTab === 'posts' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Posts ({posts.length})</span>
            </div>
            {activeSubTab === 'posts' && (
              <span className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Tab Displays */}
        <div className="pt-1 pb-16">
          {activeSubTab === 'reels' ? (
            /* Videos Grid Layout (3 columns exactly like TikTok/IG layout in screenshot) */
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
                    {/* Video Thumbnail (render video element muted on hover or image placeholder) */}
                    <video 
                      src={video.video.startsWith('http') || video.video.startsWith('/api') || video.video.startsWith('data:') ? video.video : `${API_BASE}/api/image?file=${encodeURIComponent(video.video)}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    
                    {/* Views Count Indicator */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-extrabold text-white">
                      <Play className="w-2.5 h-2.5 fill-white text-white" />
                      <span>{formatCount(video.views)}</span>
                    </div>

                    {/* Quick Like Overlay */}
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
          ) : (
            /* Community Posts List Layout */
            posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <article 
                    key={post._id}
                    className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-3xl p-4.5 space-y-3.5 shadow-2xs"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between select-none">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[1.5px] rounded-full">
                          <div className="bg-white dark:bg-slate-900 p-[1.2px] rounded-full">
                            {profile.profilePic ? (
                              <img 
                                src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:') 
                                  ? profile.profilePic 
                                  : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`} 
                                alt={profile.name} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-[10px]">
                                {profile.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs flex items-center gap-1">
                            {profile.name}
                            {profile.isEmailVerified && (
                              <VerifiedBadge iconClassName="w-3 h-3 fill-blue-500 text-white" />
                            )}
                          </h3>
                          <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            <span>•</span>
                            <Globe className="w-3 h-3 text-slate-450" />
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content text */}
                    <div className="text-slate-750 dark:text-slate-300 text-xs leading-relaxed font-semibold whitespace-pre-wrap">
                      {post.content}
                    </div>

                    {/* Image Attachment if exists */}
                    {post.image && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 w-full max-h-[450px] select-none">
                        <img 
                          src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
                          alt="Post attachment"
                          className="w-full h-auto object-cover max-h-[450px]"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Counts Row */}
                    <div className="flex items-center gap-4 pt-1 border-t border-slate-100/50 dark:border-slate-800/50 select-none text-[11px] font-black text-slate-450">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>{post.likesCount} Likes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-indigo-500" />
                        <span>{post.commentsCount} Comments</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl text-slate-450 font-bold text-xs select-none">
                No posts published yet.
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicProfilePage;
