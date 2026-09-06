import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Music, Image as ImageIcon, Sparkles, Volume2, VolumeX, 
  Play, Pause, Upload, ZoomIn, ZoomOut, RotateCcw, Move, Loader2, Check 
} from 'lucide-react';
import { API_BASE } from '../../config';
import { STORY_MUSIC_CATALOG, STORY_MUSIC_CATEGORIES } from '../../data/storyMusicCatalog';

const STORY_BG_PRESETS = [
  { bg: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)', label: 'Purple' },
  { bg: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', label: 'Sunset' },
  { bg: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)', label: 'Ocean' },
  { bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', label: 'Fire' },
  { bg: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', label: 'Pink' },
  { bg: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)', label: 'Sky' },
  { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', label: 'Forest' },
  { bg: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', label: 'Dark' },
];

const QUICK_EMOJIS = ['😀','😍','🥰','🤩','😎','🥳','🔥','✨','💯','❤️','💜','🎉','🌈','👑','🌟','🎶','💫','🙌'];

const TEXT_COLORS = [
  '#ffffff',
  '#fef08a', // warm yellow
  '#67e8f9', // cyan
  '#f472b6', // pink
  '#a7f3d0', // mint
  '#000000',
];

const StoryCreatorModal = ({ isOpen, onClose, onStoryCreated }) => {
  // Content states
  const [storyText, setStoryText] = useState('');
  const [storyEmoji, setStoryEmoji] = useState('');
  const [storyBg, setStoryBg] = useState(STORY_BG_PRESETS[0].bg);
  const [storyTextColor, setStoryTextColor] = useState('#ffffff');
  const [storyFontStyle, setStoryFontStyle] = useState('normal'); // 'normal' | 'bold' | 'italic'

  // Image & Framing states
  const [rawImageFile, setRawImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef(null);

  // Music states
  const [storyMusic, setStoryMusic] = useState(null); // { id, title, artist, url, coverGradient, coverIcon }
  const [musicStickerStyle, setMusicStickerStyle] = useState('pill'); // 'pill' | 'card' | 'minimal'
  const [musicStickerPos, setMusicStickerPos] = useState({ y: 0 }); // relative vertical offset
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('all');
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [previewingAudioUrl, setPreviewingAudioUrl] = useState(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Controls UI visibility
  const [activeControlTab, setActiveControlTab] = useState('frame'); // 'frame' | 'text' | 'bg'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const customAudioInputRef = useRef(null);
  const previewAudioRef = useRef(null);
  const frameContainerRef = useRef(null);
  const previewImgRef = useRef(null);

  // Cleanup preview audio on unmount or close
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  // ────────────────── IMAGE UPLOAD & FRAMING ──────────────────
  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    e.target.value = '';
  };

  const removeImage = () => {
    setRawImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl('');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pointer drag for panning image
  const handlePointerDown = (e) => {
    if (!imagePreviewUrl) return;
    setIsDraggingImage(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingImage) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (e) => {
    setIsDraggingImage(false);
    if (e.currentTarget.releasePointerCapture) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (!imagePreviewUrl) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(3.0, Math.max(0.5, +(prev + delta).toFixed(2))));
  };

  // Touch pinch to zoom
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && imagePreviewUrl) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      if (touchDistRef.current !== null) {
        const delta = (dist - touchDistRef.current) * 0.005;
        setZoom((prev) => Math.min(3.0, Math.max(0.5, +(prev + delta).toFixed(2))));
      }
      touchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
  };

  // ────────────────── MUSIC PREVIEW & PICKER ──────────────────
  const togglePreviewAudio = (audioUrl) => {
    if (previewingAudioUrl === audioUrl) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingAudioUrl(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.play().catch(() => {});
      setPreviewingAudioUrl(audioUrl);
      previewAudioRef.current.onended = () => setPreviewingAudioUrl(null);
    }
  };

  const selectMusicTrack = (track) => {
    setStoryMusic(track);
    setShowMusicPicker(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingAudioUrl(null);
    }
  };

  const handleCustomAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAudio(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/messages/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const audioUrl = `${API_BASE}/api/image?file=${encodeURIComponent(data.filename)}`;
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        const customTrack = {
          id: `custom_${Date.now()}`,
          title: cleanTitle.length > 28 ? cleanTitle.substring(0, 28) + '...' : cleanTitle,
          artist: 'My Audio File',
          genre: 'Custom Sound',
          duration: 'Custom',
          coverGradient: 'from-purple-600 to-indigo-600',
          coverIcon: '🎵',
          url: audioUrl,
        };
        selectMusicTrack(customTrack);
      }
    } catch (err) {
      console.error('Audio upload failed:', err);
    } finally {
      setIsUploadingAudio(false);
      e.target.value = '';
    }
  };

  // ────────────────── BAKE CANVAS & SAVE STORY ──────────────────
  const handleSaveStory = async () => {
    if (!storyText.trim() && !storyEmoji && !rawImageFile && !storyMusic) {
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageBlob = null;

      // If user uploaded an image and adjusted framing, bake it to a crisp 1080x1920 canvas!
      if (imagePreviewUrl && frameContainerRef.current && previewImgRef.current) {
        finalImageBlob = await new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1920;
          const ctx = canvas.getContext('2d');

          // 1. Draw background gradient
          const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
          grad.addColorStop(0, '#111827');
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1080, 1920);

          // 2. Draw user photo with exact scale and pan
          const img = previewImgRef.current;
          const containerRect = frameContainerRef.current.getBoundingClientRect();
          const scaleMultiplier = 1080 / containerRect.width;

          const imgNaturalWidth = img.naturalWidth || 1080;
          const imgNaturalHeight = img.naturalHeight || 1920;

          // Base cover dimensions
          const coverRatio = Math.max(
            containerRect.width / imgNaturalWidth,
            containerRect.height / imgNaturalHeight
          );
          const baseW = imgNaturalWidth * coverRatio;
          const baseH = imgNaturalHeight * coverRatio;

          const finalW = baseW * zoom * scaleMultiplier;
          const finalH = baseH * zoom * scaleMultiplier;

          const centerX = (1080 - finalW) / 2 + (pan.x * scaleMultiplier);
          const centerY = (1920 - finalH) / 2 + (pan.y * scaleMultiplier);

          ctx.drawImage(img, centerX, centerY, finalW, finalH);

          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.92
          );
        });
      }

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('text', storyText.trim());
      formData.append('emoji', storyEmoji);
      formData.append('bgGradient', storyBg);
      formData.append('textColor', storyTextColor);
      formData.append('fontStyle', storyFontStyle);

      if (finalImageBlob) {
        formData.append('image', finalImageBlob, `story_${Date.now()}.jpg`);
      } else if (rawImageFile) {
        formData.append('image', rawImageFile);
      }

      if (storyMusic) {
        formData.append(
          'music',
          JSON.stringify({
            title: storyMusic.title,
            artist: storyMusic.artist,
            url: storyMusic.url,
            coverUrl: storyMusic.coverUrl || '',
          })
        );
      }

      const res = await fetch(`${API_BASE}/api/messages/story`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        if (onStoryCreated) onStoryCreated();
        handleClose();
      }
    } catch (err) {
      console.error('Failed to create story:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setStoryText('');
    setStoryEmoji('');
    removeImage();
    setStoryMusic(null);
    onClose();
  };

  const filteredMusicCatalog = STORY_MUSIC_CATALOG.filter((item) => {
    const matchesCategory =
      selectedMusicCategory === 'all' || item.category === selectedMusicCategory;
    const matchesQuery =
      !musicSearchQuery ||
      item.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
      item.artist.toLowerCase().includes(musicSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-between select-none overflow-hidden animate-fade-in h-[100dvh]">
      
      {/* ── TOP NAV BAR ── */}
      <div className="w-full max-w-lg px-4 pt-[max(12px,env(safe-area-inset-top,12px))] pb-2 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent shrink-0">
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Music Button */}
          <button
            onClick={() => setShowMusicPicker(true)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black backdrop-blur-md border transition-all active:scale-95 ${
              storyMusic
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/20 border-white/25 text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{storyMusic ? 'Change Music' : 'Add Music'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleSaveStory}
            disabled={isSubmitting || (!storyText.trim() && !storyEmoji && !rawImageFile && !storyMusic)}
            className="px-4 py-1.5 rounded-full bg-white text-[#7C3AED] hover:bg-slate-100 font-black text-xs sm:text-sm disabled:opacity-40 active:scale-95 transition-all shadow-xl flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                <span>Share Story</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN 9:16 STORY CANVAS FRAME ── */}
      <div className="flex-1 min-h-0 w-full max-w-sm flex items-center justify-center px-3 py-1 relative">
        <div
          ref={frameContainerRef}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-[9/16] max-h-[48dvh] sm:max-h-[56dvh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          style={
            imagePreviewUrl
              ? { backgroundColor: '#0f172a' }
              : { background: storyBg }
          }
        >
          {/* Image Layer with Zoom & Pan */}
          {imagePreviewUrl ? (
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-auto"
            >
              <img
                ref={previewImgRef}
                src={imagePreviewUrl}
                alt="Story content"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out',
                }}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              {/* Subtle framing guide border when zoomed */}
              {zoom !== 1 && (
                <div className="absolute inset-0 border border-white/20 rounded-[2.5rem] pointer-events-none" />
              )}
            </div>
          ) : (
            /* Empty photo placeholder prompt */
            <div className="flex flex-col items-center gap-3 p-6 text-center z-10">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-3xl shadow-xl active:scale-90 transition-transform border border-white/30"
              >
                📷
              </button>
              <p className="text-white/80 text-xs font-bold">Tap to add a photo or type text below</p>
            </div>
          )}

          {/* Overlays (Text & Emoji) */}
          <div className="relative z-20 flex flex-col items-center justify-center px-6 gap-3 text-center pointer-events-none">
            {storyEmoji && (
              <span
                className="text-6xl drop-shadow-2xl select-none animate-bounce"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              >
                {storyEmoji}
              </span>
            )}

            {storyText && (
              <p
                className="text-xl sm:text-2xl leading-snug select-none break-words max-w-[280px]"
                style={{
                  color: storyTextColor,
                  fontWeight: storyFontStyle === 'bold' ? '900' : '700',
                  fontStyle: storyFontStyle === 'italic' ? 'italic' : 'normal',
                  textShadow: '0 3px 16px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)',
                }}
              >
                {storyText}
              </p>
            )}
          </div>

          {/* ── INTERACTIVE FACEBOOK / INSTAGRAM MUSIC STICKER ── */}
          {storyMusic && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                // Cycle sticker style: pill -> card -> minimal
                setMusicStickerStyle((prev) =>
                  prev === 'pill' ? 'card' : prev === 'card' ? 'minimal' : 'pill'
                );
              }}
              title="Tap to change sticker style"
              className="absolute z-25 bottom-12 left-1/2 -translate-x-1/2 cursor-pointer active:scale-95 transition-transform animate-scale-up"
            >
              {/* STYLE 1: Modern Pill */}
              {musicStickerStyle === 'pill' && (
                <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/25 shadow-2xl flex items-center gap-3 text-white max-w-[280px]">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${storyMusic.coverGradient || 'from-purple-600 to-pink-600'} flex items-center justify-center text-xs shadow-md shrink-0`}>
                    {storyMusic.coverIcon || '🎵'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black truncate leading-tight">{storyMusic.title}</p>
                    <p className="text-[10px] text-white/70 truncate leading-tight">{storyMusic.artist}</p>
                  </div>
                  {/* Equalizer animation */}
                  <div className="flex items-end gap-0.5 h-3 ml-1 shrink-0">
                    <span className="w-0.5 bg-white rounded-full h-full animate-[bounce_0.6s_infinite_ease-in-out]"></span>
                    <span className="w-0.5 bg-white rounded-full h-[60%] animate-[bounce_0.8s_infinite_ease-in-out]"></span>
                    <span className="w-0.5 bg-white rounded-full h-[80%] animate-[bounce_0.5s_infinite_ease-in-out]"></span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStoryMusic(null);
                    }}
                    className="p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* STYLE 2: Glassmorphism Card */}
              {musicStickerStyle === 'card' && (
                <div className="p-3 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/30 shadow-2xl flex items-center gap-3 text-white w-64">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${storyMusic.coverGradient || 'from-purple-600 to-pink-600'} flex items-center justify-center text-lg shadow-md shrink-0`}>
                    {storyMusic.coverIcon || '🎵'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black truncate leading-tight">{storyMusic.title}</p>
                    <p className="text-[10px] text-white/70 truncate mt-0.5">{storyMusic.artist}</p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-purple-300 font-bold">
                      <span>Soundtrack</span>
                      <span>•</span>
                      <span>{storyMusic.genre || 'Music'}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStoryMusic(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STYLE 3: Minimalist Badge */}
              {musicStickerStyle === 'minimal' && (
                <div className="px-3 py-1.5 rounded-xl bg-white/25 backdrop-blur-md border border-white/40 shadow-xl flex items-center gap-2 text-white max-w-[260px]">
                  <Music className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-xs font-black truncate">{storyMusic.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStoryMusic(null);
                    }}
                    className="p-0.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Remove image button if image set */}
          {imagePreviewUrl && (
            <button
              onClick={removeImage}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 border border-white/20"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM CONTROLS & TOOLBAR ── */}
      <div className="w-full max-w-lg bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 rounded-t-3xl px-3.5 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom,12px))] space-y-2.5 z-30 shrink-0">
        
        {/* Sub-tab navigation (Frame Zoom / Text / Background) */}
        <div className="flex items-center justify-between px-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveControlTab('frame')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                activeControlTab === 'frame'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📸 Framing / Photo
            </button>
            <button
              onClick={() => setActiveControlTab('text')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                activeControlTab === 'text'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ✏️ Text & Emojis
            </button>
            {!imagePreviewUrl && (
              <button
                onClick={() => setActiveControlTab('bg')}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                  activeControlTab === 'bg'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🎨 Background
              </button>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-black flex items-center gap-1 border border-white/15"
          >
            <ImageIcon className="w-3 h-3" />
            <span>{imagePreviewUrl ? 'Change Photo' : 'Add Photo'}</span>
          </button>
        </div>

        {/* ── TAB 1: FRAMING / ZOOM / PAN CONTROLS ── */}
        {activeControlTab === 'frame' && (
          <div className="space-y-2.5 pt-1">
            {imagePreviewUrl ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    <Move className="w-3 h-3 text-purple-400" />
                    <span>Zoom & Pan Image</span>
                  </span>
                  <span className="font-black text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/60">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Zoom Slider + Quick Zoom Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-90"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => setZoom((z) => Math.min(3.0, +(z + 0.1).toFixed(2)))}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-90"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Presets: Fit, Fill, Reset */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-bold">
                  <span className="text-slate-400">💡 Drag photo to position</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setZoom(0.85); setPan({ x: 0, y: 0 }); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      Fit
                    </button>
                    <button
                      onClick={() => { setZoom(1.25); setPan({ x: 0, y: 0 }); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      Fill
                    </button>
                    <button
                      onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 active:scale-95"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs font-bold bg-slate-900 border border-slate-800 rounded-2xl">
                <span>Select a photo using </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-400 underline font-black"
                >
                  "Add Photo"
                </button>
                <span> to zoom and frame it!</span>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: TEXT & EMOJIS CONTROLS ── */}
        {activeControlTab === 'text' && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 gap-2">
              <input
                type="text"
                value={storyText}
                onChange={(e) => setStoryText(e.target.value.slice(0, 100))}
                placeholder="Type story text..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm font-semibold outline-none"
              />
              <span className="text-[10px] text-slate-500 font-black">{storyText.length}/100</span>
            </div>

            {/* Quick Emojis */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
              {QUICK_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => setStoryEmoji(storyEmoji === em ? '' : em)}
                  className={`text-xl p-1.5 rounded-xl shrink-0 transition-transform active:scale-90 ${
                    storyEmoji === em ? 'bg-purple-600/40 scale-110' : 'bg-slate-900'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Font Style & Colors */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-1.5">
                {[
                  { key: 'normal', label: 'Regular' },
                  { key: 'bold', label: 'Bold' },
                  { key: 'italic', label: 'Italic' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStoryFontStyle(st.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      storyFontStyle === st.key
                        ? 'bg-white text-slate-900 border-white font-black'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Color dots */}
              <div className="flex gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStoryTextColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      storyTextColor === c ? 'scale-125 border-purple-400' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: BACKGROUND GRADIENTS (FOR TEXT STORIES) ── */}
        {activeControlTab === 'bg' && !imagePreviewUrl && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Background Gradients
            </span>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2">
              {STORY_BG_PRESETS.map((p) => (
                <button
                  key={p.bg}
                  onClick={() => setStoryBg(p.bg)}
                  className={`w-10 h-10 rounded-2xl shrink-0 transition-transform active:scale-90 border-2 ${
                    storyBg === p.bg ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                  style={{ background: p.bg }}
                  title={p.label}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
      <input
        ref={customAudioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleCustomAudioUpload}
      />

      {/* ── MUSIC PICKER MODAL (Facebook & Instagram Style) ── */}
      {showMusicPicker && (
        <div
          className="fixed inset-0 z-[100010] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => {
            setShowMusicPicker(false);
            if (previewAudioRef.current) {
              previewAudioRef.current.pause();
              setPreviewingAudioUrl(null);
            }
          }}
        >
          <div
            className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">Story Music</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Bangla, Bollywood & Pop Hits</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMusicPicker(false);
                  if (previewAudioRef.current) {
                    previewAudioRef.current.pause();
                    setPreviewingAudioUrl(null);
                  }
                }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Song Upload From Device */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => customAudioInputRef.current?.click()}
                disabled={isUploadingAudio}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
              >
                {isUploadingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading audio from phone...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>📁 Pick Song from Device (MP3 / Audio)</span>
                  </>
                )}
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                placeholder="Search song title or artist..."
                value={musicSearchQuery}
                onChange={(e) => setMusicSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-3 py-2 border-b border-slate-800">
              {STORY_MUSIC_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMusicCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap transition-all ${
                    selectedMusicCategory === cat.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Song List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredMusicCatalog.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No music tracks found
                </div>
              ) : (
                filteredMusicCatalog.map((track) => {
                  const isSelected = storyMusic?.id === track.id;
                  const isPreviewing = previewingAudioUrl === track.url;

                  return (
                    <div
                      key={track.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Left: Play button + Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => togglePreviewAudio(track.url)}
                          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow active:scale-90 transition-transform"
                          title={isPreviewing ? 'Pause' : 'Play preview'}
                        >
                          {isPreviewing ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white truncate leading-tight">
                            {track.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {track.artist} • <span className="text-purple-400">{track.genre}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Select Button */}
                      <button
                        onClick={() => selectMusicTrack(track)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Use'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCreatorModal;
