import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Move, Loader2 } from 'lucide-react';

const ImageCropModal = ({ imageSrc, type = 'avatar', onCrop, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const isAvatar = type === 'avatar';
  const cropWidth = isAvatar ? 280 : 320;
  const cropHeight = isAvatar ? 280 : 160;

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

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || processing) return;
    setProcessing(true);

    try {
      const img = imageRef.current;
      const canvas = document.createElement('canvas');
      const targetWidth = isAvatar ? 500 : 1200;
      const targetHeight = isAvatar ? 500 : 500;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      // Calculate crop metrics relative to crop container
      const displayedImgWidth = img.width * scale;
      const displayedImgHeight = img.height * scale;

      const cropCenterX = cropWidth / 2;
      const cropCenterY = cropHeight / 2;

      const imgCenterX = cropCenterX + position.x;
      const imgCenterY = cropCenterY + position.y;

      const srcLeft = (imgCenterX - cropWidth / 2) / displayedImgWidth * img.naturalWidth;
      const srcTop = (imgCenterY - cropHeight / 2) / displayedImgHeight * img.naturalHeight;
      const srcWidth = cropWidth / displayedImgWidth * img.naturalWidth;
      const srcHeight = cropHeight / displayedImgHeight * img.naturalHeight;

      // Draw cropped area onto canvas
      ctx.drawImage(
        img,
        Math.max(0, -srcLeft / (srcWidth / canvas.width)),
        Math.max(0, -srcTop / (srcHeight / canvas.height)),
        img.naturalWidth,
        img.naturalHeight,
        (position.x * (targetWidth / cropWidth)) + (targetWidth - displayedImgWidth * (targetWidth / cropWidth)) / 2,
        (position.y * (targetHeight / cropHeight)) + (targetHeight - displayedImgHeight * (targetHeight / cropHeight)) / 2,
        displayedImgWidth * (targetWidth / cropWidth),
        displayedImgHeight * (targetHeight / cropHeight)
      );

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
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
            <Move className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              {isAvatar ? 'Adjust Profile Photo' : 'Adjust Cover Photo'}
            </h3>
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
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            className="max-w-[80%] max-h-[80%] object-contain pointer-events-none"
          />

          {/* Mask & Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div 
              style={{ width: `${cropWidth}px`, height: `${cropHeight}px` }}
              className={`border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] ${
                isAvatar ? 'rounded-full' : 'rounded-2xl'
              }`}
            />
          </div>

          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full pointer-events-none">
            Drag to reposition
          </div>
        </div>

        {/* Zoom & Adjustment Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3 px-2">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-[#7C3AED] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
            
            <button
              onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 active:scale-95"
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
              className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Photo</span>
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
