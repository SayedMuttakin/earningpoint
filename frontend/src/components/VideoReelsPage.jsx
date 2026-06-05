import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, Send, Loader2, X, Globe, User, Bookmark, Search, ArrowLeft, Plus, Forward } from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';

// Helper to format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
};

// Helper to get creator avatar URL
const getCreatorAvatar = (video) => {
  const pic = video.authorDetails?.profilePic || (video.authorId && typeof video.authorId === 'object' ? video.authorId.profilePic : null);
  const google = video.authorDetails?.googleAvatar || (video.authorId && typeof video.authorId === 'object' ? video.authorId.googleAvatar : null);
  
  if (pic) {
    if (pic.startsWith('http') || pic.startsWith('/api') || pic.startsWith('data:')) {
      return pic;
    }
    return `${API_BASE}/api/image?file=${pic}`;
  }
  return google || '';
};

// Inner Reel Video Card Component
const ReelCard = ({ video, isActive, isMuted, toggleMute, currentUserId, onLikeToggle, onCommentClick, onBack, currentUser, onFollowToggle }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [playOverlayType, setPlayOverlayType] = useState('play'); // 'play' or 'pause'
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [recordAvatarError, setRecordAvatarError] = useState(false);

  // Sync autoplay state with active visibility
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.log('Autoplay blocked or interrupted:', err);
              setIsPlaying(false);
            });
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const handleVideoPress = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setPlayOverlayType('pause');
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      });
      setPlayOverlayType('play');
    }
    setShowPlayOverlay(true);
    setTimeout(() => setShowPlayOverlay(false), 600);
  };

  const handleDoublePress = () => {
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 800);
    
    // Toggle like if not already liked
    const userHasLiked = video.likes?.includes(currentUserId);
    if (!userHasLiked) {
      triggerLike();
    }
  };

  const triggerLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await onLikeToggle(video._id);
    setIsLiking(false);
  };

  const hasLiked = video.likes?.includes(currentUserId);
  const creatorId = video.authorId?._id ? String(video.authorId._id) : String(video.authorId);
  const isCreatorFollowing = currentUser?.following?.some(id => String(id) === creatorId);
  const isSelf = creatorId === String(currentUserId);
  const creatorName = video.authorDetails?.name || video.authorName || 'User';
  const creatorAvatar = getCreatorAvatar(video);

  return (
    <div className="snap-start snap-always w-full h-[calc(100vh-76px)] relative bg-black flex items-center justify-center overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        src={`${API_BASE}${video.video}`}
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoPress}
        onDoubleClick={handleDoublePress}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Top Transparent Header (Matches TikTok top bar) */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors filter drop-shadow-md animate-fade-in"
        >
          <ArrowLeft className="w-6.5 h-6.5" />
        </button>
        <button 
          onClick={() => alert('Search feature coming soon!')}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors filter drop-shadow-md animate-fade-in"
        >
          <Search className="w-6.5 h-6.5" />
        </button>
      </div>

      {/* Floating Mute Indicator */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-16 right-4 z-20 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Play/Pause Overlay Animation */}
      {showPlayOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-ping duration-300">
          <div className="p-5 rounded-full bg-black/50 text-white">
            {playOverlayType === 'play' ? (
              <Play className="w-10 h-10 fill-white" />
            ) : (
              <Pause className="w-10 h-10 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Double Tap Heart Pop Animation */}
      {showHeartPop && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-bounce">
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
        </div>
      )}

      {/* Right Side Overlay Actions (TikTok Style) */}
      <div className="absolute right-4 bottom-16 z-20 flex flex-col items-center gap-5.5">
        {/* Creator Profile with Follow button */}
        <div className="flex flex-col items-center relative pb-3">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
            {creatorAvatar && !avatarError ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>{creatorName ? creatorName.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          {/* Red Follow (+) Button */}
          {!isCreatorFollowing && !isSelf && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle(creatorId);
              }}
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 border border-white flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Follow user"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3.5]" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={triggerLike}
          disabled={isLiking}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md group active:scale-90 transition-transform"
        >
          <div className="transition-colors">
            <Heart className={`w-7.5 h-7.5 transition-all ${hasLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white'}`} />
          </div>
          <span className="text-[11.5px] font-black tracking-wide mt-0.5">{video.likes?.length || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onCommentClick(video)}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md active:scale-90 transition-transform"
        >
          <div>
            <MessageCircle className="w-7.5 h-7.5 text-white" />
          </div>
          <span className="text-[11.5px] font-black tracking-wide mt-0.5">{video.comments?.length || 0}</span>
        </button>

        {/* Save/Bookmark Button */}
        <button
          onClick={() => alert('Reel saved to collection!')}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md active:scale-90 transition-transform"
        >
          <div>
            <Bookmark className="w-7.5 h-7.5 text-white" />
          </div>
          <span className="text-[11.5px] font-black tracking-wide mt-0.5">{video.likes ? video.likes.length * 2 + 5 : 365}</span>
        </button>

        {/* Share Button (TikTok Curved Arrow) */}
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/?reelId=${video._id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert('Reel link copied to clipboard!');
            });
          }}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md active:scale-90 transition-transform"
        >
          <div>
            <Forward className="w-8.5 h-8.5 text-white stroke-[1.8]" />
          </div>
          <span className="text-[11.5px] font-black tracking-wide mt-0.5">{video.likes ? Math.round(video.likes.length * 1.5) : 173}</span>
        </button>

        {/* Spinning Music Record disc at the bottom right */}
        <div className="w-10 h-10 rounded-full border-4 border-slate-900/80 bg-black flex items-center justify-center animate-spin-slow mt-2 relative">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-850 p-1 flex items-center justify-center overflow-hidden">
            {creatorAvatar && !recordAvatarError ? (
              <img 
                src={creatorAvatar} 
                alt="music record" 
                className="w-5.5 h-5.5 rounded-full object-cover"
                onError={() => setRecordAvatarError(true)}
              />
            ) : (
              <div className="w-5.5 h-5.5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[8px] font-bold">
                {creatorName ? creatorName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Overlay Info (Description/Creator) */}
      <div className="absolute left-4 bottom-4 right-20 z-20 text-white flex flex-col gap-1 filter drop-shadow-md select-text">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-sm sm:text-base flex items-center gap-1">
            {creatorName}
            {(video.isVerified || video.authorDetails?.isEmailVerified) && (
              <VerifiedBadge iconClassName="w-4 h-4 fill-blue-500 text-white flex-shrink-0" />
            )}
          </h3>
          {!isSelf && !isCreatorFollowing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle(creatorId);
              }}
              className="px-2 py-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer animate-pulse"
            >
              <Plus className="w-2.5 h-2.5 mr-0.5 stroke-[3.5]" />
              Follow
            </button>
          )}
          {video.createdAt && (
            <span className="text-slate-300 text-xs font-semibold">· {formatRelativeTime(video.createdAt)}</span>
          )}
        </div>
        <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 text-slate-100/95 font-medium mt-1">
          {video.content}
        </p>
      </div>

      {/* Bottom Shading Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};


// Comments Drawer Component
const CommentsDrawer = ({ video, onClose, onCommentSubmit, currentUserId }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onCommentSubmit(video._id, commentText.trim());
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
    <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-white dark:bg-slate-900 rounded-t-3xl z-40 shadow-2xl flex flex-col animate-fade-in-up border-t border-slate-150 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-850 dark:text-slate-200">
          Comments ({video.comments?.length || 0})
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {video.comments && video.comments.length > 0 ? (
          video.comments.map((comment, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl px-4 py-2.5">
                <span className="block font-black text-xs text-slate-750 dark:text-slate-350">
                  {comment.userName || 'User'}
                </span>
                <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 space-y-2">
            <MessageCircle className="w-10 h-10 opacity-40" />
            <p className="text-xs font-bold">No comments yet. Share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 pb-safe">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || isSubmitting}
          className="p-2.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

// Main Reels View Page
const VideoReelsPage = ({ selectedReelId, onBack }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeCommentVideo, setActiveCommentVideo] = useState(null);

  // Follow/unfollow creator toggle
  const handleFollowToggle = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Toggle follow state locally
        setCurrentUser(prev => {
          if (!prev) return prev;
          const targetId = String(userId);
          const isFollowing = prev.following?.some(id => String(id) === targetId);
          const newFollowing = isFollowing 
            ? prev.following.filter(id => String(id) !== targetId)
            : [...(prev.following || []).map(id => String(id)), targetId];
          return { ...prev, following: newFollowing };
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow in Reels:', err);
    }
  };

  // Fetch current user ID
  useEffect(() => {
    fetchProfile();
    fetchVideos();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile in Reels:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/videos`);
      const data = await res.json();
      if (res.ok) {
        // Sort to place selectedReelId first if deep-linked
        let list = data;
        if (selectedReelId) {
          const targetIndex = list.findIndex(v => v._id === selectedReelId);
          if (targetIndex > -1) {
            const [target] = list.splice(targetIndex, 1);
            list = [target, ...list];
          }
        }
        setVideos(list);
      }
    } catch (err) {
      console.error('Failed to fetch reels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const height = e.target.clientHeight;
    if (height === 0) return;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < videos.length) {
      setActiveIndex(newIndex);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVideos(prev =>
          prev.map(v => {
            if (v._id === postId) {
              const userLiked = v.likes?.includes(currentUser?._id);
              let newLikes = v.likes || [];
              if (userLiked) {
                newLikes = newLikes.filter(id => id !== currentUser?._id);
              } else {
                newLikes = [...newLikes, currentUser?._id];
              }
              return { ...v, likes: newLikes };
            }
            return v;
          })
        );
      }
    } catch (err) {
      console.error('Failed to toggle like on reel:', err);
    }
  };

  const handleCommentSubmit = async (postId, text) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const newComment = await res.json();
      if (res.ok) {
        setVideos(prev =>
          prev.map(v => {
            if (v._id === postId) {
              const updatedComments = [...(v.comments || []), newComment];
              const updatedVideo = { ...v, comments: updatedComments };
              // Also keep comments drawer synced
              if (activeCommentVideo?._id === postId) {
                setActiveCommentVideo(updatedVideo);
              }
              return updatedVideo;
            }
            return v;
          })
        );
      }
    } catch (err) {
      console.error('Failed to add comment to reel:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-76px)] flex flex-col items-center justify-center bg-black text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <span className="text-xs font-bold tracking-wide">Loading reels...</span>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-[calc(100vh-76px)] flex flex-col items-center justify-center bg-black text-slate-400 space-y-3 px-6 text-center">
        <Play className="w-12 h-12 text-slate-600 opacity-60" />
        <p className="text-sm font-bold">No Video Reels posted yet.</p>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Be the first to post a video from the Create Post (+) modal on the home tab!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-76px)] bg-black relative overflow-hidden flex flex-col">
      {/* Vertical Snap Scrolling Container */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {videos.map((video, idx) => (
          <ReelCard
            key={video._id}
            video={video}
            isActive={idx === activeIndex}
            isMuted={isMuted}
            toggleMute={() => setIsMuted(!isMuted)}
            currentUserId={currentUser?._id}
            onLikeToggle={handleLikeToggle}
            onCommentClick={(v) => setActiveCommentVideo(v)}
            onBack={onBack}
            currentUser={currentUser}
            onFollowToggle={handleFollowToggle}
          />
        ))}
      </div>

      {/* Comments Slide-up Sheet Drawer Overlay */}
      {activeCommentVideo && (
        <CommentsDrawer
          video={activeCommentVideo}
          onClose={() => setActiveCommentVideo(null)}
          onCommentSubmit={handleCommentSubmit}
          currentUserId={currentUser?._id}
        />
      )}
    </div>
  );
};

export default VideoReelsPage;
