import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Image as ImageIcon, X, Globe, MoreVertical, Search, MessageCircle, Users, Smile, Heart, Send, Bookmark } from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import NewsSlider from './NewsSlider';

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

const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[Local Storage] Failed to save key "${key}":`, e);
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      try {
        localStorage.removeItem('cached_feed_posts');
        localStorage.removeItem('cached_news_posts');
      } catch (innerErr) {
        console.error('Failed to clear local storage items:', innerErr);
      }
    }
  }
};

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

// Comments Drawer Slide-up Component
const CommentsDrawer = ({ post, onClose, onCommentSubmit, currentUserId, onUserClick }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listRef = React.useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onCommentSubmit(post._id, commentText.trim());
    setCommentText('');
    setIsSubmitting(false);

    // Scroll comments list to the bottom
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative z-10 w-full sm:max-w-md h-[38%] bg-white dark:bg-slate-900 rounded-t-[2rem] shadow-2xl flex flex-col animate-fade-in-up border-t border-slate-150 dark:border-slate-800 mb-[76px] sm:mb-0">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-250 dark:bg-slate-750 rounded-full mx-auto my-3 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-850 flex-shrink-0">
          <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">
            Comments ({post.comments?.length || 0})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, i) => (
              <div key={i} className="flex gap-3 items-start">
                <button
                  onClick={() => comment.user && onUserClick && onUserClick(comment.user)}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden active:scale-90 transition-transform"
                >
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar.startsWith('http') || comment.userAvatar.startsWith('/api') || comment.userAvatar.startsWith('data:') 
                        ? comment.userAvatar 
                        : `${API_BASE}/api/image?file=${encodeURIComponent(comment.userAvatar)}`}
                      alt={comment.userName}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </button>
                <div className="flex-1 bg-slate-50 dark:bg-slate-850 rounded-2xl px-4 py-2.5">
                  <button
                    onClick={() => comment.user && onUserClick && onUserClick(comment.user)}
                    className="block font-black text-xs text-slate-750 dark:text-slate-350 hover:underline text-left"
                  >
                    {comment.userName || 'User'}
                  </button>
                  <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 space-y-2">
              <MessageCircle className="w-10 h-10 opacity-30 animate-bounce" />
              <p className="text-xs font-bold">No comments yet. Share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 pb-safe flex-shrink-0">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 transition-opacity active:scale-95 flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

const CommunityPostCard = ({ post, onFollowToggle, onLikeToggle, onCommentClick, currentUserId, setSelectedReelId, setActiveTab, onUserClick }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    await onFollowToggle(post.authorId);
    setActionLoading(false);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await onLikeToggle(post._id);
    setIsLiking(false);
  };

  const isLiked = post.likes?.includes(currentUserId);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;
  const shareCount = Math.max(1, Math.floor(likesCount * 0.15));

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-[2rem] p-4.5 space-y-3.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with IG gradient border and follow plus button overlay */}
          <div className="relative select-none">
            <button
              onClick={() => post.authorId && onUserClick && onUserClick(post.authorId)}
              className="block active:scale-90 transition-transform"
            >
              <div className="bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[1.8px] rounded-full">
                <div className="bg-white dark:bg-slate-900 p-[1.5px] rounded-full">
                  {post.authorDetails?.profilePic ? (
                    <img 
                      src={post.authorDetails.profilePic.startsWith('http') || post.authorDetails.profilePic.startsWith('/api') || post.authorDetails.profilePic.startsWith('data:') 
                        ? post.authorDetails.profilePic 
                        : `${API_BASE}/api/image?file=${encodeURIComponent(post.authorDetails.profilePic)}`} 
                      alt={post.authorDetails.name || post.authorName} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-sm">
                      {post.authorDetails?.name ? post.authorDetails.name.charAt(0).toUpperCase() : (post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U')}
                    </div>
                  )}
                </div>
              </div>
            </button>
            
            {/* Follow overlay plus badge */}
            {!post.isOwnPost && post.authorId && !post.isFollowing && (
              <button 
                onClick={handleFollowClick}
                disabled={actionLoading}
                className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 border border-white dark:border-slate-900 hover:scale-110 active:scale-90 transition-transform shadow-md flex items-center justify-center"
                title="Follow User"
              >
                {actionLoading ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Plus className="w-2.5 h-2.5" strokeWidth={3.5} />
                )}
              </button>
            )}
          </div>

          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <button
                onClick={() => post.authorId && onUserClick && onUserClick(post.authorId)}
                className="hover:underline font-extrabold text-left active:opacity-70 transition-opacity"
              >
                {post.authorDetails?.name || post.authorName || 'User'}
              </button>
              {post.isVerified && (
                <VerifiedBadge iconClassName="w-[14px] h-[14px] fill-blue-500 text-white" />
              )}
              {!post.isOwnPost && post.authorId && (
                <>
                  <span className="text-slate-400 font-normal text-xs">•</span>
                  <button 
                    onClick={handleFollowClick}
                    disabled={actionLoading}
                    className={`text-xs font-bold transition-all active:scale-95 ${
                      post.isFollowing 
                        ? 'text-slate-400 dark:text-slate-500' 
                        : 'text-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {actionLoading ? '...' : post.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </h3>
            {post.title ? (
              <p className="text-[11px] text-brand-500 dark:text-brand-400 font-black mt-0.5">
                {post.title}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                <span>{formatRelativeTime(post.createdAt)}</span>
                <span>•</span>
                <Globe className="w-3 h-3 text-slate-450" />
              </p>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content text (Shown as a description caption) */}
      <div className="text-slate-750 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-wrap font-medium pb-1">
        {post.content}
      </div>

      {/* Media Attachment (Image or Video) */}
      {post.image && (
        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-100/40 dark:bg-slate-900/40 mt-1 w-full max-h-[450px] select-none">
          <img 
            src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
            alt="Post Content"
            className="w-full h-auto object-cover max-h-[450px]"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {post.video && (
        <div 
          onClick={() => {
            if (setSelectedReelId && setActiveTab) {
              setSelectedReelId(post._id);
              setActiveTab('Video');
            }
          }}
          className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-100/40 dark:bg-slate-900/40 mt-1 flex items-center justify-center w-full max-h-[500px] cursor-pointer group select-none"
        >
          <video 
            src={post.video.startsWith('http') || post.video.startsWith('/api') || post.video.startsWith('data:') ? post.video : `${API_BASE}/api/image?file=${encodeURIComponent(post.video)}`} 
            className="w-full h-auto object-contain max-h-[500px]"
            muted
            playsInline
          />
          {/* Glassy Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95">
              <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Action Icons Row */}
      <div className="flex items-center justify-between pt-1 select-none">
        <div className="flex items-center gap-4.5">
          {/* Heart / Like Button */}
          <button 
            onClick={handleLikeClick}
            disabled={isLiking}
            className="flex items-center gap-1.5 group active:scale-90 transition-transform"
          >
            <Heart 
              className={`w-6 h-6 transition-colors duration-200 ${
                isLiked 
                  ? 'fill-red-500 stroke-red-500 scale-110 animate-pulse' 
                  : 'text-slate-700 dark:text-slate-350 group-hover:text-red-500'
              }`} 
              strokeWidth={2}
            />
            <span className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5">
              {likesCount > 0 ? (likesCount >= 1000 ? `${(likesCount/1000).toFixed(1)}k` : likesCount) : 'Like'}
            </span>
          </button>

          {/* Comment Button */}
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-1.5 group active:scale-90 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-slate-700 dark:text-slate-350 group-hover:text-indigo-500" strokeWidth={2} />
            <span className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5">
              {commentsCount > 0 ? commentsCount : 'Comment'}
            </span>
          </button>

          {/* Share Button */}
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: post.title || 'Zenivio Post',
                  text: post.content,
                  url: window.location.href
                }).catch(console.error);
              } else {
                alert('Link copied to clipboard!');
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-1.5 group active:scale-90 transition-transform"
          >
            <Send className="w-5.5 h-5.5 text-slate-700 dark:text-slate-350 group-hover:text-emerald-500 -rotate-12" strokeWidth={2} />
            <span className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5">
              {shareCount}
            </span>
          </button>
        </div>

        {/* Bookmark Button */}
        <button className="text-slate-700 dark:text-slate-350 hover:text-yellow-500 active:scale-90 transition-transform p-0.5">
          <Bookmark className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      {/* Social Info & Comments Container */}
      <div className="space-y-1.5 pt-0.5">
        {/* Liked By Summary */}
        {likesCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 border border-white dark:border-slate-900" />
              <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-white dark:border-slate-900" />
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-none">
              Liked by <span className="font-extrabold">{post.authorDetails?.name || post.authorName || 'user'}</span> and <span className="font-extrabold">{likesCount} others</span>
            </span>
          </div>
        )}

        {/* Caption */}
        <div className="text-xs leading-relaxed text-slate-750 dark:text-slate-300">
          <span className="font-extrabold mr-2 text-slate-900 dark:text-white">
            {post.authorDetails?.name || post.authorName || 'User'}
          </span>
          {post.content.length > 120 ? `${post.content.substring(0, 120)}...` : post.content}
        </div>

        {/* Inline Comments List (Last 2 comments) */}
        {commentsCount > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-100/50 dark:border-slate-800/50 mt-1">
            {post.comments.slice(-2).map((comment, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] leading-tight text-slate-750 dark:text-slate-300">
                <div className="truncate pr-4">
                  <span className="font-black mr-2 text-slate-900 dark:text-white">{comment.userName}</span>
                  <span>{comment.text}</span>
                </div>
                <button className="text-slate-400 hover:text-red-500 flex-shrink-0">
                  <Heart className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* View all comments link & relative time */}
        <div className="flex items-center justify-between pt-1 select-none">
          {commentsCount > 0 ? (
            <button 
              onClick={onCommentClick}
              className="text-[11px] font-bold text-[#7C3AED] hover:underline"
            >
              View all {commentsCount} comments
            </button>
          ) : (
            <button 
              onClick={onCommentClick}
              className="text-[11px] font-bold text-slate-400 hover:underline"
            >
              Add a comment...
            </button>
          )}

          <span className="text-[9.5px] font-black text-slate-400">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
};

const HomePage = ({ setActiveTab, setSelectedNewsId, setActiveChatPartner, setSelectedReelId, highlightedPostId, setHighlightedPostId, onUserClick }) => {
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [newsPosts, setNewsPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_news_posts');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [feedPosts, setFeedPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_feed_posts');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    // Stale-While-Revalidate: skip initial spinner if we have cached feed content
    const cachedNews = localStorage.getItem('cached_news_posts');
    const cachedFeed = localStorage.getItem('cached_feed_posts');
    return !(cachedNews || cachedFeed);
  });
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_global_settings');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_current_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  
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
          safeLocalStorageSet('cached_current_user', JSON.stringify(userData));
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
        safeLocalStorageSet('cached_news_posts', JSON.stringify(updates));
      }

      // 2. Fetch custom feed posts (Community posts)
      const feedResponse = await fetch(`${API_BASE}/api/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (feedResponse.ok) {
        const feedData = await feedResponse.json();
        setFeedPosts(feedData);
        safeLocalStorageSet('cached_feed_posts', JSON.stringify(feedData));
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
        safeLocalStorageSet('cached_global_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchHomeData();
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (highlightedPostId) {
      const fetchHighlightedPost = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/posts/${highlightedPostId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const postData = await res.json();
            setActiveCommentPost(postData);
            if (setHighlightedPostId) setHighlightedPostId(null);
          }
        } catch (err) {
          console.error('Failed to fetch highlighted post:', err);
        }
      };
      fetchHighlightedPost();
    }
  }, [highlightedPostId]);

  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (showCreateModal) {
        e.preventDefault();
        setShowCreateModal(false);
      } else if (activeCommentPost) {
        e.preventDefault();
        setActiveCommentPost(null);
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [showCreateModal, activeCommentPost]);


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
        setFeedPosts(prev => {
          const updated = prev.map(post => {
            if (post.authorId === authorId) {
              return { ...post, isFollowing: data.isFollowing };
            }
            return post;
          });
          safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  // Like/Unlike Toggle on post
  const handleLikeToggle = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json(); // { likesCount, isLiked }
        
        setFeedPosts(prev => {
          const updated = prev.map(p => {
            if (p._id === postId) {
              const userId = currentUser?._id;
              let newLikes = p.likes || [];
              if (data.isLiked) {
                if (userId && !newLikes.includes(userId)) {
                  newLikes = [...newLikes, userId];
                }
              } else {
                newLikes = newLikes.filter(id => id.toString() !== userId?.toString());
              }
              return { ...p, likes: newLikes };
            }
            return p;
          });
          safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Comment submit
  const handleCommentSubmit = async (postId, text) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const newComment = await res.json();
        
        setFeedPosts(prev => {
          const updated = prev.map(p => {
            if (p._id === postId) {
              const newComments = [...(p.comments || []), newComment];
              const updatedPost = { ...p, comments: newComments };
              // Also update the active comment post if it's the one open
              if (activeCommentPost && activeCommentPost._id === postId) {
                setActiveCommentPost(updatedPost);
              }
              return updatedPost;
            }
            return p;
          });
          safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
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
    <>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col relative">
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
                        <button
                          onClick={() => {
                            if (onUserClick) {
                              onUserClick(user._id);
                              setUserSearchQuery('');
                              setUserSearchResults([]);
                            }
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left active:opacity-70 transition-opacity"
                        >
                          {user.profilePic ? (
                            <img
                              src={user.profilePic.startsWith('http') || user.profilePic.startsWith('/api') || user.profilePic.startsWith('data:') ? user.profilePic : `${API_BASE}/api/image?file=${user.profilePic}`}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-850 dark:text-slate-200 block truncate leading-tight">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block truncate">{user.phoneOrEmail}</span>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {/* Follow Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSearchUserFollowToggle(user._id); }}
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
                            onClick={(e) => { e.stopPropagation(); handleSearchUserMessageClick(user); }}
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
                    onLikeToggle={handleLikeToggle}
                    onCommentClick={() => setActiveCommentPost(post)}
                    currentUserId={currentUser?._id}
                    setSelectedReelId={setSelectedReelId}
                    setActiveTab={setActiveTab}
                    onUserClick={onUserClick}
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
      </div>
    </PullToRefresh>

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

        {/* Comments Drawer Slide-up Sheet Drawer Overlay */}
        {activeCommentPost && (
          <CommentsDrawer
            post={activeCommentPost}
            onClose={() => setActiveCommentPost(null)}
            onCommentSubmit={handleCommentSubmit}
            currentUserId={currentUser?._id}
            onUserClick={onUserClick}
          />
        )}
      </>
    );
};

export default HomePage;
