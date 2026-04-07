import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, refreshing, children, className = "" }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  
  const pullThreshold = 80; // Distance to trigger refresh
  const maxPull = 150; // Maximum distance to pull down

  const handleTouchStart = (e) => {
    // Only allow pull-to-refresh if scrolled to top
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || refreshing) return;

    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY === 0) {
      // Prevent default scrolling when pulling down at the top
      if (e.cancelable) e.preventDefault();
      
      // Add resistance to the pull
      const easedDiff = Math.min(diff * 0.5, maxPull);
      setPullDistance(easedDiff);
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling || refreshing) return;

    if (pullDistance >= pullThreshold) {
      onRefresh();
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  // Reset pull distance when refreshing state changes
  useEffect(() => {
    if (!refreshing) {
      setPullDistance(0);
    }
  }, [refreshing]);

  const opacity = Math.min(pullDistance / pullThreshold, 1);
  const rotation = (pullDistance / pullThreshold) * 360;

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full ${className}`}
    >
      {/* Refresh Indicator Container */}
      <div 
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-50"
        style={{ 
          top: Math.max(-40, pullDistance - 40),
          opacity: refreshing ? 1 : opacity 
        }}
      >
        <div 
          style={{ 
            transform: `rotate(${refreshing ? 0 : rotation}deg)` 
          }}
          className={`w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'text-brand-600' : 'text-slate-400 dark:text-slate-300'}`} />
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${refreshing ? 40 : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
