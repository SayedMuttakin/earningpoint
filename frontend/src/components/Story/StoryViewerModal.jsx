import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Volume2, VolumeX, Trash2, Download, Send, Heart, Flame, Laugh, 
  ChevronLeft, ChevronRight, Music, Eye, ChevronUp
} from 'lucide-react';
import { API_BASE, getImageUrl } from '../../config';
import { saveImageToPhone } from '../../utils/downloadHelper';

const formatRelativeTime = (timeStr) => {
  if (!timeStr) return '';
  const diffMs = Date.now() - new Date(timeStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

const StoryViewerModal = ({
  storyUser,
  storyUsers = [],
  initialIndex = 0,
  currentUser = null,
  onClose,
  onDeleteStory,
  onNextUser,
  onPrevUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Story Viewers State
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const recordedViewsRef = useRef(new Set());

  const audioRef = useRef(null);
  const progressTimerRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });
  const currentStory = storyUser?.stories?.[currentIndex];
  const isOwnStory = storyUser?._id?.toString() === currentUser?._id?.toString();

  // Reset index if storyUser changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setShowViewersSheet(false);
  }, [storyUser, initialIndex]);

  // Record Story View for non-owners
  useEffect(() => {
    if (!currentStory?._id || isOwnStory || !currentUser?._id) return;
    if (recordedViewsRef.current.has(currentStory._id)) return;
    recordedViewsRef.current.add(currentStory._id);

    const record = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch(`${API_BASE}/api/messages/story/${currentStory._id}/view`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Failed to record story view:', err);
      }
    };
    record();
  }, [currentStory?._id, isOwnStory, currentUser?._id]);

  // Audio Playback & Progress Timer
  useEffect(() => {
    if (!currentStory) return;

    // Background music playback
    if (currentStory.music?.url) {
      const musicUrl =
        currentStory.music.url.startsWith('http') ||
        currentStory.music.url.startsWith('/music') ||
        currentStory.music.url.startsWith('/api')
          ? currentStory.music.url
          : `${API_BASE}/api/image?file=${encodeURIComponent(currentStory.music.url)}`;

      if (!audioRef.current) {
        audioRef.current = new Audio(musicUrl);
      } else {
        audioRef.current.src = musicUrl;
      }
      audioRef.current.loop = true;
      audioRef.current.muted = isMuted;
      audioRef.current.currentTime = 0;
      if (!isPaused) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    // Auto Progress Timer
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(0);

    const totalDuration = 20000; // 20s per story / day
    const interval = 50;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
      if (isPaused) return;

      elapsed += interval;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);

      if (elapsed >= totalDuration) {
        clearInterval(progressTimerRef.current);
        handleNextStory();
      }
    }, interval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentStory, isMuted, isPaused]);

  // Toggle Mute
  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  // Next / Prev navigation
  const handleNextStory = () => {
    if (currentIndex + 1 < (storyUser?.stories?.length || 0)) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else if (onNextUser) {
      onNextUser();
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else if (onPrevUser) {
      onPrevUser();
    }
  };

  const handleDownloadImage = (e) => {
    e.stopPropagation();
    if (!currentStory?.image) return;
    saveImageToPhone(currentStory.image, (msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 2500);
    });
  };

  const handleDelete = async () => {
    if (!currentStory?._id) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/messages/story/${currentStory._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDeleteStory) onDeleteStory(currentStory._id);
      setShowDeleteConfirm(false);
      if (storyUser.stories.length <= 1) {
        onClose();
      } else {
        handleNextStory();
      }
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  };

  const handleSendReaction = (emoji) => {
    setToastMsg(`Reacted ${emoji} to story!`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setToastMsg('Reply sent! 💬');
    setReplyText('');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const openViewersSheet = async () => {
    setShowViewersSheet(true);
    setIsPaused(true);
    if (currentStory?.viewers && Array.isArray(currentStory.viewers)) {
      setViewersList(currentStory.viewers);
    }
    setLoadingViewers(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/messages/story/${currentStory._id}/viewers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setViewersList(data.viewers || []);
      }
    } catch (err) {
      console.error('Failed to fetch viewers:', err);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) {
      setIsPaused(false);
      return;
    }
    const t = e.changedTouches[0];
    const diffX = t.clientX - touchStartPos.current.x;
    const diffY = t.clientY - touchStartPos.current.y;
    const elapsed = Date.now() - touchStartPos.current.time;
    setIsPaused(false);

    if (elapsed < 600) {
      // Horizontal swipe between stories / users
      if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          // Swipe left -> Next user / next story
          handleNextStory();
        } else {
          // Swipe right -> Prev user / prev story
          handlePrevStory();
        }
        return;
      }

      // Vertical swipe down to close modal
      if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX)) {
        onClose();
        return;
      }

      // Vertical swipe up to see viewers (if own story)
      if (diffY < -60 && Math.abs(diffY) > Math.abs(diffX) && isOwnStory) {
        openViewersSheet();
        return;
      }
    }
  };

  // Lock body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!storyUser || !currentStory) return null;

  const hasImage = !!currentStory.image;
  const imageUrl = hasImage ? getImageUrl(currentStory.image) : null;
  const timeAgo = formatRelativeTime(currentStory.createdAt);

  return (
    <div
      className="fixed inset-0 z-[100000] bg-black flex items-center justify-center select-none overflow-hidden animate-fade-in h-[100dvh]"
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerCancel={() => setIsPaused(false)}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-16 z-50 px-4 py-2 rounded-full bg-slate-900/90 text-white border border-slate-700 text-xs font-bold shadow-2xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* ── 9:16 PHONE WRAPPER ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-md h-full sm:max-h-[92vh] sm:rounded-[2.5rem] overflow-hidden flex flex-col justify-between shadow-2xl border-0 sm:border border-white/10"
        style={
          hasImage
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {
                background: currentStory.bgGradient || 'linear-gradient(135deg, #7C3AED, #2563EB)',
              }
        }
      >
        {/* Subtle dark overlay for contrast */}
        {hasImage && <div className="absolute inset-0 bg-black/25 pointer-events-none" />}

        {/* ── TOP PROGRESS BARS ── */}
        <div className="relative z-20 flex gap-1 px-3 pt-[max(12px,env(safe-area-inset-top,12px))] pb-2 shrink-0">
          {storyUser.stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-none"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* ── HEADER ── */}
        <div
          className="relative z-20 flex items-center justify-between px-4 py-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow">
              {storyUser.profilePic ? (
                <img
                  src={getImageUrl(storyUser.profilePic)}
                  alt={storyUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-black">
                  {storyUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div>
              <p className="text-white font-black text-xs sm:text-sm drop-shadow leading-tight">
                {storyUser.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-bold drop-shadow">
                <span>{timeAgo}</span>
                {currentStory.music && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-purple-200 truncate max-w-[130px] sm:max-w-[200px]">
                      <Music className="w-2.5 h-2.5 animate-pulse text-purple-300 shrink-0" />
                      <span className="truncate">{currentStory.music.title}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Music Sound Mute/Unmute */}
            {currentStory.music?.url && (
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-90 border border-white/20"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
              </button>
            )}

            {/* Direct Phone Download Button */}
            {hasImage && (
              <button
                onClick={handleDownloadImage}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-90 border border-white/20"
                title="Download image to phone"
              >
                <Download className="w-4 h-4 text-cyan-300" />
              </button>
            )}

            {/* Delete button (for own stories) */}
            {isOwnStory && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-8 h-8 rounded-full bg-rose-500/80 backdrop-blur-md text-white flex items-center justify-center active:scale-90 shadow"
                title="Delete story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-90 border border-white/20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── TAP NAVIGATION ZONES (Left to Prev, Right to Next) ── */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-[30%] h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
          />
          <div
            className="w-[70%] h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
          />
        </div>

        {/* ── CENTER CONTENT (Emoji for text stories & Text Overlay) ── */}
        <div className="relative z-15 flex-1 flex flex-col items-center justify-center px-6 gap-4 text-center pointer-events-none">
          {!hasImage && currentStory.emoji && (
            <span
              className="text-7xl leading-none drop-shadow-2xl select-none"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))' }}
            >
              {currentStory.emoji}
            </span>
          )}

          {currentStory.text && (
            <p
              className="text-2xl sm:text-3xl leading-snug select-none max-w-xs break-words"
              style={{
                color: currentStory.textColor || '#ffffff',
                fontWeight: currentStory.fontStyle === 'bold' ? '900' : '700',
                fontStyle: currentStory.fontStyle === 'italic' ? 'italic' : 'normal',
                textShadow: '0 3px 20px rgba(0,0,0,0.8), 0 1px 6px rgba(0,0,0,0.9)',
              }}
            >
              {currentStory.text}
            </p>
          )}
        </div>

        {/* ── BOTTOM REPLY / REACTION BAR OR OWNER VIEWS BAR ── */}
        <div
          className="relative z-20 px-4 pb-[max(16px,env(safe-area-inset-bottom,16px))] pt-2 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isOwnStory ? (
            <div
              onClick={openViewersSheet}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 cursor-pointer hover:bg-black/70 active:scale-[0.99] transition-all group shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-indigo-600 flex items-center justify-center text-white shadow">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-xs font-black">
                      {(currentStory.viewsCount ?? currentStory.viewers?.length ?? 0)} {((currentStory.viewsCount ?? currentStory.viewers?.length ?? 0) === 1) ? 'View' : 'Views'}
                    </span>
                    <span className="text-[10px] text-white/60">• Tap to see viewers</span>
                  </div>
                  {currentStory.viewers && currentStory.viewers.length > 0 ? (
                    <p className="text-[10px] text-purple-200 truncate max-w-[210px] font-medium">
                      Seen by {currentStory.viewers.slice(0, 2).map(v => v.name).join(', ')}{currentStory.viewers.length > 2 ? ` and ${currentStory.viewers.length - 2} others` : ''}
                    </p>
                  ) : (
                    <p className="text-[10px] text-white/50">No views yet</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-white/80 group-hover:text-white transition-colors">
                <span className="text-xs font-bold">Activity</span>
                <ChevronUp className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          ) : (
            <>
              {/* Quick emoji reactions */}
              <div className="flex items-center justify-center gap-3 py-1">
                {['❤️', '🔥', '😂', '👏', '😍', '🎉'].map((em) => (
                  <button
                    key={em}
                    onClick={() => handleSendReaction(em)}
                    className="text-2xl hover:scale-125 active:scale-95 transition-transform"
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Reply input */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${storyUser.name?.split(' ')[0]}...`}
                  className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-xs font-semibold text-white placeholder-white/60 outline-none border border-white/25 focus:border-white/60 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white flex items-center justify-center active:scale-90 transition-transform shadow shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── STORY VIEWERS BOTTOM SHEET MODAL (OWN STORY) ── */}
      {showViewersSheet && (
        <div
          className="fixed inset-0 z-[100020] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowViewersSheet(false);
            setIsPaused(false);
          }}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl max-h-[75vh] sm:max-h-[70vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Drag Handle & Header */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1 rounded-full bg-slate-700" />
            </div>
            <div className="px-6 pt-3 pb-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-tight">
                    Seen by {viewersList.length}
                  </h3>
                  <p className="text-[10px] text-slate-400">People who viewed your day</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewersSheet(false);
                  setIsPaused(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewers List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/40 max-h-[55vh]">
              {loadingViewers && viewersList.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">Checking viewers...</span>
                </div>
              ) : viewersList.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-2xl">
                    👀
                  </div>
                  <p className="font-black text-sm text-white">No views yet</p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    When someone views your story, their name and profile will show up here.
                  </p>
                </div>
              ) : (
                viewersList.map((viewer) => (
                  <div key={viewer._id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow">
                        {viewer.profilePic ? (
                          <img
                            src={getImageUrl(viewer.profilePic)}
                            alt={viewer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{viewer.name?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs sm:text-sm text-white truncate">
                            {viewer.name}
                          </p>
                          {viewer.isPremium && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black">
                              PRO
                            </span>
                          )}
                        </div>
                        {viewer.username && (
                          <p className="text-[11px] text-slate-400 truncate font-mono">
                            @{viewer.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {formatRelativeTime(viewer.viewedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE STORY CONFIRMATION MODAL ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100010] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full shadow-2xl text-white text-center space-y-3">
            <h3 className="font-black text-base">Delete Story?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently remove this story?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewerModal;
