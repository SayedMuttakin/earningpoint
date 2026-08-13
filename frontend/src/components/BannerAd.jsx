import React, { useEffect, useState } from 'react';
import { AdMobService } from '../utils/admob';
import { Capacitor } from '@capacitor/core';
import { ExternalLink, Sparkles } from 'lucide-react';

const SPONSOR_ADS = [
  {
    title: 'Zenivio Premium Membership',
    desc: 'Get verified golden badge, 2x referral bonus, and ad-free experience!',
    tag: 'SPONSORED',
    cta: 'Upgrade Now',
    bgColor: 'from-amber-500/10 via-purple-500/5 to-indigo-500/10',
    btnColor: 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white',
    icon: '🚀'
  },
  {
    title: 'Daily Quiz & Spin Rewards',
    desc: 'Spin the wheel daily to win up to 5,000 bonus coins instantly!',
    tag: 'PROMOTION',
    cta: 'Claim Rewards',
    bgColor: 'from-[#7C3AED]/10 via-indigo-500/5 to-pink-500/10',
    btnColor: 'bg-gradient-to-r from-[#7C3AED] to-pink-600 text-white',
    icon: '🎁'
  },
  {
    title: 'Zenivio Official Store',
    desc: 'Shop gadgets, gift cards, and mobile recharges with your earned coins!',
    tag: 'ADVERTISEMENT',
    cta: 'Shop Now',
    bgColor: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
    btnColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
    icon: '🛒'
  }
];

const BannerAd = ({ globalSettings, size = 'banner', onAdClick }) => {
  const [sponsorAd] = useState(() => SPONSOR_ADS[Math.floor(Math.random() * SPONSOR_ADS.length)]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      AdMobService.showBanner(size);
      return () => {
        AdMobService.hideBanner();
      };
    }
  }, [size]);

  const handleAdCardClick = () => {
    if (Capacitor.isNativePlatform()) {
      AdMobService.showInterstitial();
    }
    if (onAdClick) onAdClick();
  };

  const isBig = size === 'big' || size === 'medium_rectangle' || size === 'large';

  return (
    <div 
      onClick={handleAdCardClick}
      className={`relative w-full ${isBig ? 'min-h-[160px] p-4.5' : 'min-h-[85px] p-3.5'} border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl bg-gradient-to-br ${sponsorAd.bgColor} dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer my-3 select-none`}
    >
      {/* Sponsored Badge */}
      <div className="flex items-center justify-between w-full mb-1.5">
        <div className="flex items-center gap-1.5 bg-indigo-500/15 dark:bg-indigo-900/40 text-[#7C3AED] dark:text-indigo-400 text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-[#7C3AED]" />
          <span>{sponsorAd.tag}</span>
        </div>
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Ad
        </span>
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-3 my-1">
        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl flex-shrink-0">
          {sponsorAd.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight truncate">
            {sponsorAd.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1 line-clamp-2">
            {sponsorAd.desc}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-1.5 flex items-center justify-end">
        <button className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-md ${sponsorAd.btnColor} flex items-center gap-1.5 transform active:scale-95 transition-all`}>
          <span>{sponsorAd.cta}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BannerAd;
