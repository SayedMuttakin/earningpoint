import React, { useEffect } from 'react';
import { AdMobService } from '../utils/admob';
import { Capacitor } from '@capacitor/core';

const BannerAd = ({ globalSettings, size = 'banner' }) => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      AdMobService.showBanner(size);
      return () => {
        AdMobService.hideBanner();
      };
    }
  }, [size]);

  const isBig = size === 'big' || size === 'medium_rectangle' || size === 'large';

  return (
    <div className={`relative w-full ${isBig ? 'h-[250px]' : 'h-[85px]'} border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-xs my-2 select-none`}>
      {/* Sponsored Badge */}
      <div className="absolute top-2 right-2 bg-indigo-500/10 dark:bg-indigo-900/30 text-[#7C3AED] dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-md font-black tracking-wide uppercase select-none">
        Ad
      </div>
      
      {/* Ad Card Content */}
      <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
        <span className="text-[#7C3AED] dark:text-indigo-400 font-black text-xs tracking-widest uppercase">
          SPONSORED ADVERTISEMENT
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">
          {isBig ? '320x250 Medium Rectangle Ad' : '320x100 Responsive Banner Ad'}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          (Real AdMob Ads render automatically inside Mobile App)
        </span>
      </div>
    </div>
  );
};

export default BannerAd;
