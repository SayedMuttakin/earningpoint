import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, Send, Loader2, X, Globe, User } from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';

// Inner Reel Video Card Component
const ReelCard = ({ video, isActive, isMuted, toggleMute, currentUserId, onLikeToggle, onCommentClick }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [playOverlayType, setPlayOverlayType] = useState('play'); // 'play' or 'pause'
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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

  return (
    <div className="snap-start snap-always w-full h-[calc(100vh-140px)] relative bg-black flex items-center justify-center overflow-hidden">
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

      {/* Floating Mute Indicator */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition-colors"
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

      {/* Right Side Overlay Actions */}
      <div className="absolute right-4 bottom-16 z-20 flex flex-col items-center gap-5.5">
        {/* Creator Profile */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-md relative">
            {video.authorId?.profilePic || video.authorId?.googleAvatar ? (
              <img
                src={video.authorId.profilePic || video.authorId.googleAvatar}
                alt={video.authorName}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span>{video.authorName ? video.authorName.charAt(0).toUpperCase() : 'U'}</span>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={triggerLike}
          disabled={isLiking}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md group active:scale-90 transition-transform"
        >
          <div className={`p-3 rounded-full bg-black/40 backdrop-blur-xs hover:bg-black/60 transition-colors ${hasLiked ? 'text-rose-500' : ''}`}>
            <Heart className={`w-6.5 h-6.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
          </div>
          <span className="text-xs font-black tracking-wide">{video.likes?.length || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onCommentClick(video)}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md active:scale-90 transition-transform"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-xs hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6.5 h-6.5" />
          </div>
          <span className="text-xs font-black tracking-wide">{video.comments?.length || 0}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/?reelId=${video._id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert('Reel link copied to clipboard!');
            });
          }}
          className="flex flex-col items-center gap-1 text-white filter drop-shadow-md active:scale-90 transition-transform"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-xs hover:bg-black/60 transition-colors">
            <Share2 className="w-6.5 h-6.5" />
          </div>
          <span className="text-xs font-black tracking-wide">Share</span>
        </button>
      </div>

      {/* Bottom Overlay Info (Description/Creator) */}
      <div className="absolute left-4 bottom-4 right-20 z-20 text-white flex flex-col gap-1.5 filter drop-shadow-md">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm sm:text-base flex items-center gap-1">
            {video.authorName || 'User'}
            {(video.isVerified || video.authorId?.isEmailVerified) && (
              <VerifiedBadge iconClassName="w-4 h-4 fill-blue-500 text-white" />
            )}
          </h3>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Reel</span>
        </div>
        <p className="text-xs leading-relaxed line-clamp-3 text-slate-100/90 font-medium">
          {video.content}
        </p>
        <div className="flex items-center gap-1 text-[9px] text-slate-350 font-bold mt-1">
          <Globe className="w-3 h-3" />
          <span>Public</span>
        </div>
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
const VideoReelsPage = ({ selectedReelId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeCommentVideo, setActiveCommentVideo] = useState(null);

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
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-black text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <span className="text-xs font-bold tracking-wide">Loading reels...</span>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-black text-slate-400 space-y-3 px-6 text-center">
        <Play className="w-12 h-12 text-slate-600 opacity-60" />
        <p className="text-sm font-bold">No Video Reels posted yet.</p>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Be the first to post a video from the Create Post (+) modal on the home tab!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-140px)] bg-black relative overflow-hidden flex flex-col">
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
