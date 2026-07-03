import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Image as ImageIcon, X, Globe, MoreVertical, Search, MessageCircle, Users, Smile, Heart, Send, Bookmark, Download, Trash2, AlertTriangle, UserX } from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import NewsSlider from './NewsSlider';

const GRADIENTS_MAP = {
  aurora: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white',
  sunset: 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white',
  neon: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
  purpleHaze: 'bg-gradient-to-br from-purple-700 to-indigo-900 text-white',
  emerald: 'bg-gradient-to-tr from-emerald-400 to-teal-700 text-white',
  obsidian: 'bg-gradient-to-b from-slate-800 to-slate-950 text-white',
  candy: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-white',
  peach: 'bg-gradient-to-r from-orange-400 to-rose-400 text-white',
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

// Full Screen Image Preview Modal Component
const ImagePreviewModal = ({ imageUrl, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenivio_image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      window.open(imageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 z-10">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md transition-all"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download</span>
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image Container */}
      <div className="w-full max-w-4xl max-h-[85vh] p-4 flex items-center justify-center select-none" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Preview"
          className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-scale-up"
        />
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
                <div className="flex-1 bg-slate-50 dark:bg-slate-850 rounded-2xl px-4 py-2.5 relative">
                  <button
                    onClick={() => comment.user && onUserClick && onUserClick(comment.user)}
                    className="block font-black text-xs text-slate-750 dark:text-slate-350 hover:underline text-left"
                  >
                    {comment.userName || 'User'}
                  </button>
                  <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed pr-6">
                    {comment.text}
                  </p>
                  
                  {(comment.user === currentUserId || post.authorId === currentUserId) && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('Delete comment?')) return;
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_BASE}/api/posts/${post._id}/comment/${comment._id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.ok) {
                            window.location.reload();
                          }
                        } catch (err) {
                          console.error('Failed to delete comment:', err);
                        }
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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

const CommunityPostCard = ({ post, onFollowToggle, onLikeToggle, onCommentClick, currentUserId, setSelectedReelId, setActiveTab, onUserClick, onImageClick, showToast, onActionTrigger }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const videoRef = useRef(null);

  const handleSaveToggle = async (e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
        if (showToast) {
          showToast(data.isSaved ? 'Post saved! 💾' : 'Post unsaved! ❌');
        }
      }
    } catch (err) {
      console.error('Failed to toggle save post:', err);
    }
  };

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

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

  const parsedFeeling = (() => {
    if (!post.feeling) return null;
    if (typeof post.feeling === 'object') return post.feeling;
    try {
      return JSON.parse(post.feeling);
    } catch (e) {
      return { label: post.feeling, emoji: '' };
    }
  })();

  const parsedTaggedFriends = (() => {
    if (!post.taggedFriends) return [];
    if (Array.isArray(post.taggedFriends)) return post.taggedFriends;
    try {
      return JSON.parse(post.taggedFriends);
    } catch (e) {
      return typeof post.taggedFriends === 'string' ? post.taggedFriends.split(',').map(f => f.trim()) : [];
    }
  })();

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-[2rem] p-4.5 space-y-3.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with IG gradient border and follow plus button overlay */}
          <div className="relative select-none">
            <button
              onClick={() => post.authorId && onUserClick && onUserClick(post.authorId)}
              className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm relative active:scale-95 transition-transform"
            >
              {post.authorDetails?.profilePic ? (
                <img 
                  src={post.authorDetails.profilePic.startsWith('http') || post.authorDetails.profilePic.startsWith('/api') || post.authorDetails.profilePic.startsWith('data:') 
                    ? post.authorDetails.profilePic 
                    : `${API_BASE}/api/image?file=${encodeURIComponent(post.authorDetails.profilePic)}`} 
                  alt={post.authorDetails.name || post.authorName} 
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-white dark:border-slate-900 flex items-center justify-center font-black">
                  {post.authorDetails?.name ? post.authorDetails.name.charAt(0).toUpperCase() : (post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U')}
                </div>
              )}
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
            <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <button
                onClick={() => post.authorId && onUserClick && onUserClick(post.authorId)}
                className="hover:underline font-extrabold text-left active:opacity-70 transition-opacity"
              >
                {post.authorDetails?.name || post.authorName || 'User'}
              </button>
              {((post.authorDetails && (post.authorDetails.verificationBadge === 'blue' || post.authorDetails.verificationBadge === 'golden' || (post.authorDetails.isEmailVerified && post.authorDetails.verificationBadge !== 'none'))) || (!post.authorDetails && post.isVerified)) && (
                <VerifiedBadge type={post.authorDetails?.verificationBadge === 'golden' ? 'golden' : 'blue'} iconClassName="w-[14px] h-[14px] inline-block flex-shrink-0" />
              )}
              {parsedFeeling && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  is feeling <span className="font-bold text-slate-700 dark:text-slate-250">{parsedFeeling.label} {parsedFeeling.emoji}</span>
                </span>
              )}
              {parsedTaggedFriends.length > 0 && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  with <span className="font-bold text-slate-700 dark:text-slate-250">
                    {parsedTaggedFriends.length === 1 
                      ? parsedTaggedFriends[0] 
                      : parsedTaggedFriends.length === 2 
                        ? `${parsedTaggedFriends[0]} and ${parsedTaggedFriends[1]}`
                        : `${parsedTaggedFriends[0]} and ${parsedTaggedFriends.length - 1} others`}
                  </span>
                </span>
              )}
              {post.location && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  at <span className="font-bold text-slate-705 dark:text-slate-200">{post.location}</span>
                </span>
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
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
              {post.privacy === 'friends' ? (
                <Users className="w-3 h-3 text-slate-450" />
              ) : post.privacy === 'private' ? (
                <Lock className="w-3 h-3 text-slate-450" />
              ) : (
                <Globe className="w-3 h-3 text-slate-450" />
              )}
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/80 py-1.5 z-40 animate-fade-in text-left">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    await handleSaveToggle();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  <span>{isSaved ? 'Unsave Post' : 'Save Post'}</span>
                </button>

                {post.authorId === currentUserId || post.isOwnPost ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      setActiveActionModal('delete');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setActiveActionModal('report');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report Post</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setActiveActionModal('block');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Block User</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content text (Shown as a description caption) */}
      {post.bgGradient && GRADIENTS_MAP[post.bgGradient] ? (
        <div className={`w-full rounded-2xl p-5 flex items-center justify-center min-h-[160px] text-center text-base md:text-lg font-black shadow-inner my-2 ${GRADIENTS_MAP[post.bgGradient]}`}>
          {post.content}
        </div>
      ) : (
        <div className="text-slate-750 dark:text-slate-355 text-xs leading-relaxed whitespace-pre-wrap font-medium pb-1">
          {post.content}
        </div>
      )}

      {/* Media Attachment (Image or Video) */}
      {post.image && (
        <div 
          onClick={() => onImageClick && onImageClick(post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`)}
          className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-100/40 dark:bg-slate-900/40 mt-1 w-full max-h-[450px] select-none cursor-pointer hover:opacity-95 transition-opacity"
        >
          <img 
            src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
            alt="Post Content"
            className="w-full h-auto object-contain max-h-[450px]"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {post.video && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 bg-slate-100/40 dark:bg-slate-900/40 mt-1 flex items-center justify-center w-full max-h-[500px] cursor-pointer group select-none">
          <video 
            ref={videoRef}
            src={post.video.startsWith('http') || post.video.startsWith('/api') || post.video.startsWith('data:') ? post.video : `${API_BASE}/api/image?file=${encodeURIComponent(post.video)}`} 
            className="w-full h-auto object-contain max-h-[500px]"
            playsInline
            controls={isPlaying}
            onClick={handlePlayPause}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div 
              onClick={handlePlayPause}
              className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95 animate-fade-in">
                <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
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
            onClick={(e) => {
              e.stopPropagation();
              const shareUrl = `${window.location.origin}?post=${post._id}`;
              if (navigator.share) {
                navigator.share({
                  title: post.title || 'Zenivio Post',
                  text: post.content,
                  url: shareUrl
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(shareUrl);
                if (showToast) {
                  showToast('Link copied to clipboard! 🔗');
                } else {
                  alert('Link copied to clipboard!');
                }
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
        <button 
          onClick={handleSaveToggle}
          className="text-slate-700 dark:text-slate-350 hover:text-yellow-500 active:scale-90 transition-transform p-0.5"
        >
          <Bookmark className={`w-6 h-6 transition-all duration-200 ${isSaved ? 'fill-yellow-500 text-yellow-500 scale-110' : ''}`} strokeWidth={2} />
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
        {!post.bgGradient && (
          <div className="text-xs leading-relaxed text-slate-750 dark:text-slate-300">
            <span className="font-extrabold mr-2 text-slate-900 dark:text-white">
              {post.authorDetails?.name || post.authorName || 'User'}
            </span>
            {post.content.length > 120 ? `${post.content.substring(0, 120)}...` : post.content}
          </div>
        )}

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

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
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
  const [postingLoading, setPostingLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [activeActionModal, setActiveActionModal] = useState(null); // null or { type: 'delete' | 'report' | 'block', post }
  const [reportReason, setReportReason] = useState('spam');

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeActionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeActionModal]);

  const handleActionTrigger = (type, post) => {
    setActiveActionModal({ type, post });
  };

  const handleDeleteConfirm = async () => {
    if (!activeActionModal?.post) return;
    const { post } = activeActionModal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToastNotification('Post deleted successfully! 🗑️');
        handlePostDelete(post._id);
        setActiveActionModal(null);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleReportSubmit = async () => {
    if (!activeActionModal?.post) return;
    const { post } = activeActionModal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        showToastNotification('🚨 Post reported! Hidden from feed.');
        handlePostDelete(post._id);
        setActiveActionModal(null);
      } else {
        const errData = await res.json();
        showToastNotification(errData.message || 'Error reporting post');
        setActiveActionModal(null);
      }
    } catch (err) {
      console.error('Failed to report post:', err);
    }
  };

  const handleBlockConfirm = async () => {
    if (!activeActionModal?.post) return;
    const { post } = activeActionModal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/block/${post.authorId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToastNotification('🚫 User blocked successfully!');
        handleBlockAuthor(post.authorId);
        setActiveActionModal(null);
      }
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
  };

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

      // Parallelize fetches to load all resources simultaneously with a 5s timeout
      const [profileRes, newsRes, feedRes] = await Promise.all([
        fetchWithTimeout(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 5000).catch(err => { console.error('Profile fetch failed:', err); return null; }),
        fetchWithTimeout(`${API_BASE}/api/posts?adminOnly=true`, {}, 5000).catch(err => { console.error('News fetch failed:', err); return null; }),
        fetchWithTimeout(`${API_BASE}/api/posts/feed`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 5000).catch(err => { console.error('Feed fetch failed:', err); return null; })
      ]);

      // Process user profile
      if (profileRes && profileRes.ok) {
        const userData = await profileRes.json();
        setCurrentUser(userData);
        safeLocalStorageSet('cached_current_user', JSON.stringify(userData));
      }

      // Process news updates
      if (newsRes && newsRes.ok) {
        const data = await newsRes.json();
        const updates = data.filter(p => !p.authorId);
        setNewsPosts(updates);
        safeLocalStorageSet('cached_news_posts', JSON.stringify(updates));
      }

      // Process feed posts
      if (feedRes && feedRes.ok) {
        const feedData = await feedRes.json();
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
      const response = await fetchWithTimeout(`${API_BASE}/api/earning/settings`, {}, 5000);
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
      if (activeCommentPost) {
        e.preventDefault();
        setActiveCommentPost(null);
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [activeCommentPost]);


  const handlePostDelete = (postId) => {
    setFeedPosts(prev => {
      const updated = prev.filter(p => p._id !== postId);
      localStorage.setItem('cached_feed_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBlockAuthor = (authorId) => {
    setFeedPosts(prev => {
      const updated = prev.filter(p => p.authorId !== authorId);
      localStorage.setItem('cached_feed_posts', JSON.stringify(updated));
      return updated;
    });
  };

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
                    onImageClick={setPreviewImageUrl}
                    showToast={showToastNotification}
                    onActionTrigger={handleActionTrigger}
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
          onClick={() => setActiveTab && setActiveTab('CreatePost')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 z-40 transition-transform duration-300"
          title="Create Post"
        >
          <Plus className="w-7 h-7" strokeWidth={2.8} />
        </button>
      </div>
    </PullToRefresh>

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

        {/* Full Screen Image Preview Modal */}
        {previewImageUrl && (
          <ImagePreviewModal 
            imageUrl={previewImageUrl} 
            onClose={() => setPreviewImageUrl(null)} 
          />
        )}

        {/* React Modals for Post UGC actions (replaces window.confirm/prompt) */}
        {activeActionModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActiveActionModal(null)} />
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl animate-scale-pulse-glow text-left">
              
              {activeActionModal.type === 'delete' && (
                <>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Delete Post</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                    Are you sure you want to permanently delete this post? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveActionModal(null)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteConfirm}
                      className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

              {activeActionModal.type === 'block' && (
                <>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Block User</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                    Are you sure you want to block {activeActionModal.post?.authorDetails?.name || activeActionModal.post?.authorName || 'this user'}? You won't see their posts or chats anymore.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveActionModal(null)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBlockConfirm}
                      className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                    >
                      Block User
                    </button>
                  </div>
                </>
              )}

              {activeActionModal.type === 'report' && (
                <>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Report Post</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-4 leading-relaxed">
                    Please select a reason for reporting this post. It will be hidden from your feed and reviewed by moderators.
                  </p>
                  <div className="space-y-2 mb-6">
                    {[
                      { value: 'spam', label: 'Spam or scams' },
                      { value: 'harassment', label: 'Harassment or hate speech' },
                      { value: 'violence', label: 'Violence or threats' },
                      { value: 'sexual', label: 'Sexually explicit content' },
                      { value: 'other', label: 'Other violation' }
                    ].map(opt => (
                      <label 
                        key={opt.value} 
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer font-bold text-xs sm:text-sm transition-all ${
                          reportReason === opt.value 
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-655 dark:text-indigo-400' 
                            : 'border-slate-100 dark:border-slate-800 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="postReportReason" 
                          value={opt.value} 
                          checked={reportReason === opt.value} 
                          onChange={(e) => setReportReason(e.target.value)}
                          className="sr-only" 
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${reportReason === opt.value ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                          {reportReason === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </div>
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveActionModal(null)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReportSubmit}
                      className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                    >
                      Submit Report
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
};

export default HomePage;
