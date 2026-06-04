import React, { useEffect, useRef } from 'react';
import { AdMobService } from '../utils/admob';
import { Capacitor } from '@capacitor/core';

const BannerAd = ({ globalSettings, size = 'banner' }) => {
  const bannerShown = useRef(false);

  useEffect(() => {
    // On native platform, show real AdMob banner
    if (Capacitor.isNativePlatform() && !bannerShown.current) {
      bannerShown.current = true;
      AdMobService.showBanner();
    }
    return () => {
      if (bannerShown.current) {
        AdMobService.hideBanner();
        bannerShown.current = false;
      }
    };
  }, []);

  // On native, the banner is rendered natively by AdMob plugin (overlaid on WebView)
  // We just need a spacer div to make room for it
  if (Capacitor.isNativePlatform()) {
    return (
      <div className="w-full h-[60px] flex items-center justify-center">
        {/* Native AdMob banner renders here as an overlay */}
      </div>
    );
  }

  // Web fallback — premium realistic AdMob test banner ad
  return (
    <div className="relative w-full h-[60px] border border-slate-200/80 dark:border-slate-700/80 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shadow-sm">
      {/* Test Ad Badge in the top-right corner */}
      <div className="absolute top-0 right-0 bg-[#4A5568] dark:bg-slate-700 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold tracking-wide uppercase select-none">
        Test Ad
      </div>
      
      {/* Center Layout split by divider */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 select-none">
        <span className="text-[#3182CE] dark:text-blue-400 font-black text-sm tracking-widest uppercase">
          SPONSORED
        </span>
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
        <span className="text-[#718096] dark:text-slate-400 text-sm font-semibold tracking-tight">
          468x60 Banner Ad
        </span>
      </div>
    </div>
  );
};

export default BannerAd;
