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

  // Web fallback — minimal placeholder for development only
  return (
    <div className="w-full border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-2 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 relative overflow-hidden">
      <span className="text-[10px] text-slate-400 font-medium">Ad Space</span>
    </div>
  );
};

export default BannerAd;
