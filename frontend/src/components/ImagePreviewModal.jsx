import React, { useState, useRef, useEffect } from 'react';
import { Download, X, Loader2, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { getImageUrl } from '../config';
import { saveImageToPhone } from '../utils/downloadHelper';

const ImagePreviewModal = ({ imageUrl, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTouchDistanceRef = useRef(null);
  const initialTouchScaleRef = useRef(1);

  // Close on Android native back button or Desktop Escape key
  useEffect(() => {
    const handleAppBackButton = (e) => {
      e.preventDefault();
      onClose();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('appBackButton', handleAppBackButton);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('appBackButton', handleAppBackButton);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);

    try {
      const ok = await saveImageToPhone(imageUrl);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch (err) {
      console.warn('Image download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistanceRef.current = dist;
      initialTouchScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialTouchDistanceRef.current;
      const newScale = Math.min(Math.max(initialTouchScaleRef.current * factor, 1), 4);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-[10005] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none touch-none animate-fade-in"
      onClick={scale === 1 ? onClose : undefined}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top action bar */}
      <div className="absolute top-[max(16px,env(safe-area-inset-top))] left-0 right-0 flex items-center justify-between px-5 z-50 pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`flex items-center gap-2 text-white text-xs font-black px-4 py-2.5 rounded-full backdrop-blur-md transition-all border shadow-lg cursor-pointer active:scale-95 ${
              downloadSuccess 
                ? 'bg-emerald-600 border-emerald-400/50' 
                : 'bg-white/15 hover:bg-white/25 border-white/20'
            }`}
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>Saved / Shared!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-90 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all border border-rose-400/40 cursor-pointer"
          title="Close Preview"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
          <span>Close</span>
        </button>
      </div>

      {/* Floating Bottom Zoom Controls Bar */}
      <div className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full shadow-2xl pointer-events-auto">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className={`p-2 rounded-full text-white transition-all active:scale-90 ${scale <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-white text-xs font-black px-2 min-w-[48px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className={`p-2 rounded-full text-white transition-all active:scale-90 ${scale >= 4 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {scale > 1 && (
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-full text-indigo-400 hover:bg-white/20 transition-all active:scale-90 ml-1"
            title="Reset Zoom (1:1)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image Viewport Container */}
      <div
        className="w-full h-full flex items-center justify-center p-4 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={imageUrl}
          alt="Full Preview"
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
