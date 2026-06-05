import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Image as ImageIcon, X, Globe, MoreVertical, Search, MessageCircle, Users, Smile } from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import NewsSlider from './NewsSlider';

const BannerSection = ({ onStartEarning }) => {
  return (
    <div className="bg-gradient-to-r from-[#0d0728] via-[#120a3a] to-[#25106d] text-white rounded-3xl p-5 sm:p-6 shadow-md flex items-center justify-between relative overflow-hidden group select-none">
      {/* Background decorations */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-700" />
      <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 bg-blue-500/10 rounded-full blur-xl" />

      {/* Text Area */}
      <div className="z-10 space-y-3 max-w-[65%]">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
          Earn More with <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Zenivio</span>
        </h2>
        <p className="text-slate-350 text-xs sm:text-sm font-medium leading-relaxed">
          Complete tasks, invite friends and earn real rewards.
        </p>
        <button 
          onClick={onStartEarning}
          className="px-4.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-900/30 w-fit"
        >
          Start Earning
          <svg className="w-3.5 h-3.5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Visual Graphic (Treasure Chest SVG) */}
      <div className="relative flex-shrink-0 animate-pulse" style={{ animationDuration: '3s' }}>
        <svg viewBox="0 0 160 140" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="90" r="10" fill="#EAB308" />
          <circle cx="140" cy="50" r="8" fill="#FACC15" />
          <circle cx="110" cy="20" r="12" fill="#FACC15" />
          
          <rect x="30" y="60" width="100" height="60" rx="12" fill="#5B21B6" stroke="#7C3AED" strokeWidth="3" />
          <path d="M30 75h100M80 60v15" stroke="#7C3AED" strokeWidth="3" />
          <circle cx="80" cy="60" r="30" fill="#a78bfa" opacity="0.2" />
          
          <path d="M25 60c0-10 15-25 55-25s55 15 55 25H25z" fill="#4C1D95" stroke="#7C3AED" strokeWidth="3" />
          <polygon points="70,60 90,60 85,72 75,72" fill="#EAB308" />
          <path d="M80 42l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#FACC15" />
        </svg>
      </div>
    </div>
  );
};

const CommunityPostCard = ({ post, onFollowToggle }) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    await onFollowToggle(post.authorId);
    setActionLoading(false);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-[2rem] p-4.5 space-y-3.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black shadow-xs">
            {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-1">
              {post.authorName || 'User'}
              {post.isVerified && (
                <VerifiedBadge iconClassName="w-[15px] h-[15px] fill-blue-500 text-white" />
              )}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
              <span>{formatDate(post.createdAt)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <Globe className="w-3.5 h-3.5 text-slate-450" />
            </p>
          </div>
        </div>

        {/* Follow/Unfollow Button */}
        {!post.isOwnPost && post.authorId && (
          <button 
            disabled={actionLoading}
            onClick={handleFollowClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 ${
              post.isFollowing 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500' 
                : 'text-[#7C3AED] bg-indigo-50 hover:bg-indigo-100/70 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
            }`}
          >
            {actionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : post.isFollowing ? (
              'Following'
            ) : (
              '+ Follow'
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="text-slate-750 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
        {post.content}
      </div>

      {/* Image Attachment */}
      {post.image && (
        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950">
          <img 
            src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
            alt="Community Post"
            className="w-full h-auto max-h-[350px] object-cover"
            loading="lazy"
          />
        </div>
      )}
    </article>
  );
};

const HomePage = ({ setActiveTab, setSelectedNewsId, setActiveChatPartner }) => {
  const [newsPosts, setNewsPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Post Creation States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('image'); // 'image' or 'video'
  const [postingLoading, setPostingLoading] = useState(false);

  // User Search Discovery States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const handleUserSearchChange = async (query) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserSearchResults(data);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSearchUserFollowToggle = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update search results list
        setUserSearchResults(prev => prev.map(u => {
          if (u._id === userId) {
            return { ...u, isFollowing: data.isFollowing };
          }
          return u;
        }));
        // Update main community feed list if user posts are on screen
        setFeedPosts(prev => prev.map(post => {
          if (post.authorId === userId) {
            return { ...post, isFollowing: data.isFollowing };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow from search results:', err);
    }
  };

  const handleSearchUserMessageClick = (user) => {
    if (setActiveChatPartner) {
      setActiveChatPartner(user);
    }
    if (setActiveTab) {
      setActiveTab('Messenger');
    }
  };

  const fetchHomeData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch current user details
      try {
        const userRes = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Failed to fetch user profile in Home:', err);
      }

      // 1. Fetch updates (news)
      const newsResponse = await fetch(`${API_BASE}/api/posts`);
      if (newsResponse.ok) {
        const data = await newsResponse.json();
        // updates (where authorId is null)
        const updates = data.filter(p => !p.authorId);
        setNewsPosts(updates);
      }

      // 2. Fetch custom feed posts (Community posts)
      const feedResponse = await fetch(`${API_BASE}/api/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (feedResponse.ok) {
        const feedData = await feedResponse.json();
        setFeedPosts(feedData);
      }
    } catch (err) {
      console.error('Failed to fetch home page feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    fetchHomeData();
    fetchGlobalSettings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
    fetchGlobalSettings();
  };

  // Follow/Unfollow Toggle
  const handleFollowToggle = async (authorId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${authorId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state dynamically
        setFeedPosts(prev => prev.map(post => {
          if (post.authorId === authorId) {
            return { ...post, isFollowing: data.isFollowing };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  // Create User Post
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      if (file.type.startsWith('video/')) {
        setSelectedFileType('video');
      } else {
        setSelectedFileType('image');
      }
    }
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || postingLoading) return;

    setPostingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', newPostContent.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const createdPost = await res.json();
        // Prepend new post immediately
        setFeedPosts(prev => [
          { ...createdPost, isOwnPost: true, isFollowing: false },
          ...prev
        ]);
        
        // Reset states
        setNewPostContent('');
        setSelectedImage(null);
        setImagePreview(null);
        setSelectedFileType('image');
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setPostingLoading(false);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col relative">
        {/* News ticker & Ad Banner */}
        <div className="sticky top-16 z-30 w-full bg-slate-50 dark:bg-slate-950 pb-2 pt-2 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4">
          <BannerAd globalSettings={globalSettings} />
        </div>

        {/* Content Body */}
        <main className="max-w-md mx-auto px-4 pt-5 pb-8 w-full flex-1 space-y-6">
          {/* Banner */}
          <BannerSection onStartEarning={() => setActiveTab && setActiveTab('Earning')} />

          {/* Latest News Slider */}
          {!loading && newsPosts.length > 0 && (
            <NewsSlider 
              posts={newsPosts} 
              onSeeAll={() => setActiveTab && setActiveTab('Updates')} 
              onCardClick={(postId) => {
                if (setSelectedNewsId) setSelectedNewsId(postId);
                if (setActiveTab) setActiveTab('Updates');
              }}
            />
          )}

          {/* Community Feed Section */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-850 dark:text-white">Community Posts</h2>
              <button className="text-xs font-black text-[#7C3AED] hover:underline">See All</button>
            </div>

            {/* Search Users to Follow or Chat */}
            <div className="relative z-20">
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl px-4 py-1 border border-slate-200/50 dark:border-slate-800 shadow-2xs focus-within:border-[#7C3AED]/30 transition-all">
                <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                  placeholder="Search users to follow or message..."
                  className="w-full bg-transparent border-none py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-xs sm:text-sm font-semibold"
                />
                {userSearchQuery && (
                  <button onClick={() => { setUserSearchQuery(''); setUserSearchResults([]); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown Overlay */}
              {userSearchQuery && (
                <div className="absolute top-13 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {searchingUsers ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span className="text-xs text-slate-450 font-bold">Searching...</span>
                    </div>
                  ) : userSearchResults.length > 0 ? (
                    userSearchResults.map(user => (
                      <div key={user._id} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic.startsWith('http') || user.profilePic.startsWith('/api') || user.profilePic.startsWith('data:') ? user.profilePic : `${API_BASE}/api/image?file=${user.profilePic}`}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-xs font-black">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-850 dark:text-slate-200 block truncate leading-tight">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block truncate">{user.phoneOrEmail}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Follow Button */}
                          <button
                            onClick={() => handleSearchUserFollowToggle(user._id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 ${
                              user.isFollowing
                                ? 'bg-slate-100 dark:bg-slate-850 text-slate-450 dark:text-slate-500'
                                : 'text-[#7C3AED] bg-indigo-50 dark:bg-[#7C3AED]/10 hover:bg-indigo-100/70'
                            }`}
                          >
                            {user.isFollowing ? 'Following' : '+ Follow'}
                          </button>

                          {/* Message Button */}
                          <button
                            onClick={() => handleSearchUserMessageClick(user)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-indigo-100/70 active:scale-95 transition-all"
                            title="Message User"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-450 font-bold">
                      No users found matching "{userSearchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="text-slate-400 font-bold text-sm">Loading feed...</span>
              </div>
            ) : feedPosts.length > 0 ? (
              <div className="space-y-4 pb-12">
                {feedPosts.map(post => (
                  <CommunityPostCard 
                    key={post._id} 
                    post={post} 
                    onFollowToggle={handleFollowToggle} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 font-bold text-sm">
                No community posts yet. Be the first to post!
              </div>
            )}
          </div>
        </main>

        {/* Floating Plus FAB to Create Post (Matches screenshot bottom right button) */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 z-40 transition-transform duration-300"
          title="Create Post"
        >
          <Plus className="w-7 h-7" strokeWidth={2.8} />
        </button>

        {/* Create Post Modal Overlay */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[calc(100vh-90px)] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up border border-transparent dark:border-slate-800 mb-[76px] sm:mb-0">
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <h3 className="text-slate-850 dark:text-white font-black text-[16px]">Create Community Post</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreatePostSubmit} className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
                
                {/* User Header Profile (Facebook Style) */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black shadow-xs">
                    {currentUser?.profilePic ? (
                      <img 
                        src={currentUser.profilePic.startsWith('http') || currentUser.profilePic.startsWith('/api') || currentUser.profilePic.startsWith('data:') ? currentUser.profilePic : `${API_BASE}/api/image?file=${currentUser.profilePic}`} 
                        alt="Current User avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{currentUser?.name || 'User'}</h4>
                    <div className="flex items-center gap-1 text-[9.5px] text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md w-fit font-bold mt-0.5">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  </div>
                </div>

                {/* Facebook-style Textarea */}
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`What's on your mind, ${currentUser?.name || 'User'}?`}
                  rows={4}
                  className="w-full bg-transparent text-slate-850 dark:text-white placeholder-slate-400 outline-none border-none resize-none text-[15px] leading-relaxed focus:ring-0 focus:border-transparent mt-2 p-0"
                />

                {/* Preview Image or Video */}
                {imagePreview && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 max-h-[180px] w-full flex items-center justify-center flex-shrink-0">
                    {selectedFileType === 'video' ? (
                      <video src={imagePreview} controls className="w-full h-full max-h-[180px] object-cover" />
                    ) : (
                      <img src={imagePreview} alt="Preview" className="w-full h-full max-h-[180px] object-cover" />
                    )}
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setSelectedFileType('image');
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors shadow-md active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex-1" />

                {/* Facebook-style Add to Post Toolbar */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex-shrink-0">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400">Add to your post</span>
                  <div className="flex items-center gap-1">
                    {/* Photo/Video trigger button */}
                    <label className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-500 rounded-full transition-colors active:scale-90 cursor-pointer">
                      <ImageIcon className="w-5.5 h-5.5" />
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                    {/* Mock tag friends button */}
                    <button 
                      type="button" 
                      onClick={() => alert('Tag friends coming soon!')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-blue-500 rounded-full transition-colors active:scale-90"
                      title="Tag Friends"
                    >
                      <Users className="w-5.5 h-5.5" />
                    </button>
                    {/* Mock feeling emoji button */}
                    <button 
                      type="button"
                      onClick={() => alert('Feelings/Activity coming soon!')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 rounded-full transition-colors active:scale-90"
                      title="Feeling/Activity"
                    >
                      <Smile className="w-5.5 h-5.5" />
                    </button>
                  </div>
                </div>

                {selectedImage && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-2 rounded-xl text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 text-xs font-black w-fit max-w-full flex-shrink-0">
                    <span className="truncate">{selectedImage.name}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={(!newPostContent.trim() && !selectedImage) || postingLoading}
                  className="w-full py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-black rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-650 flex items-center justify-center gap-2 text-sm flex-shrink-0"
                >
                  {postingLoading ? (
                    <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Publishing...</>
                  ) : (
                    'Publish Post'
                  )}
                </button>
              </form>

            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default HomePage;
