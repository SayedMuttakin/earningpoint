import React from 'react';

const BannerAd = ({ globalSettings }) => {
  const bannerId = globalSettings?.admobConfig?.bannerAdUnitId;
  
  if (bannerId && bannerId.trim()) {
    // If there is a real ID, we show a professional placeholder for now 
    // In a real mobile app, Capacitor AdMob plugin would handle this
    return (
      <div className="w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
        <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">AdMob Active</span>
        <span className="text-xs text-slate-500 font-medium">Real Ad ID Connected: {bannerId}</span>
      </div>
    );
  }

  // Default Test Ad View
  return (
    <div className="w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
      <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Test Ad</span>
      <div className="flex items-center gap-4">
        <span className="text-blue-500 font-bold text-sm">SPONSORED</span>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">468x60 Banner Ad</span>
      </div>
    </div>
  );
};

export default BannerAd;
