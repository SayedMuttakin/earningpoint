import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Move, Loader2, Sparkles } from 'lucide-react';

const ImageCropModal = ({ imageSrc, type = 'avatar', onCrop, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTouchDistRef = useRef(null);
  const initialScaleRef = useRef(1);

  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const imageRef = useRef(null);

  const isAvatar = type === 'avatar';
  // Visual frame dimension inside the modal viewport
  const cropWidth = isAvatar ? 280 : 330;
  const cropHeight = isAvatar ? 280 : 150;

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers with multi-touch Pinch-to-Zoom support
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
      initialTouchDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistRef.current = dist;
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    } else if (e.touches.length === 2 && initialTouchDistRef.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(4, Math.max(1, (currentDist / initialTouchDistRef.current) * initialScaleRef.current));
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialTouchDistRef.current = null;
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || !frameRef.current || processing) return;
    setProcessing(true);

    try {
      const img = imageRef.current;
      const frame = frameRef.current;

      const frameRect = frame.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      // Original natural full resolution of user's image
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      // Scale factors between natural resolution and on-screen displayed image
      const scaleX = naturalWidth / imgRect.width;
      const scaleY = naturalHeight / imgRect.height;

      // Calculate the crop source rectangle in full natural pixels
      const sx = (frameRect.left - imgRect.left) * scaleX;
      const sy = (frameRect.top - imgRect.top) * scaleY;
      const sw = frameRect.width * scaleX;
      const sh = frameRect.height * scaleY;

      // Ultra-HD Canvas Resolution (1080x1080 for Avatar, 1920x870 for Cover)
      const targetWidth = isAvatar ? 1080 : 1920;
      const targetHeight = isAvatar ? 1080 : Math.round((cropHeight / cropWidth) * 1920) || 870;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill subtle dark/neutral background in case crop exceeds image bounds
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw high-resolution slice
      ctx.drawImage(
        img,
        Math.max(0, sx),
        Math.max(0, sy),
        Math.min(naturalWidth - Math.max(0, sx), sw),
        Math.min(naturalHeight - Math.max(0, sy), sh),
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Export as crystal clear WebP with 0.95 quality
      let croppedBase64 = canvas.toDataURL('image/webp', 0.95);
      if (!croppedBase64.startsWith('data:image/webp')) {
        croppedBase64 = canvas.toDataURL('image/jpeg', 0.95);
      }

      onCrop(croppedBase64);
    } catch (err) {
      console.error('Crop processing failed:', err);
      onCrop(imageSrc); // Fallback
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[#7C3AED]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {isAvatar ? 'Set Profile Photo (HD)' : 'Set Cover Photo (HD)'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400">Ultra-clear WebP Resolution</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Viewport */}
        <div 
          ref={containerRef}
          className="relative w-full h-[340px] bg-slate-950 flex items-center justify-center overflow-hidden touch-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Draggable & Scalable Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop Target"
            draggable={false}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.08s ease-out'
            }}
            className="max-w-[85%] max-h-[85%] object-contain pointer-events-none"
          />

          {/* Mask & Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div 
              ref={frameRef}
              style={{ width: `${cropWidth}px`, height: `${cropHeight}px` }}
              className={`border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ring-2 ring-[#7C3AED]/40 ${
                isAvatar ? 'rounded-full' : 'rounded-2xl'
              }`}
            />
          </div>

          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 shadow-sm border border-white/10">
            <Move className="w-3 h-3 text-[#7C3AED]" />
            <span>Drag & pinch to fit</span>
          </div>
        </div>

        {/* Zoom & Adjustment Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3 px-2">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-[#7C3AED] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
            
            <button
              onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 active:scale-95 text-xs font-bold flex items-center gap-1"
              title="Reset Position"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={processing}
              className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing WebP HD...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save HD Photo</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageCropModal;
