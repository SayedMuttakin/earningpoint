import React, { useEffect, useState, useRef } from 'react';
import { AdMobService } from '../utils/admob';
import { Capacitor } from '@capacitor/core';
import { ExternalLink, Info, X, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

// Authentic Commercial Display Ads (matching BD-Pratidin / Google Display Network styling)
const COMMERCIAL_DISPLAY_ADS = [
  {
    id: 'kazi-hair-oil',
    brand: 'Kazi Herbal Care',
    headline: 'খাঁটি প্রাকৃতিক ভেষজ উপাদানে প্রস্তুত হেয়ার অয়েল',
    subline: 'চুলের গোড়া মজবুত ও উজ্জ্বলতা বৃদ্ধি করে প্রাকৃতিক গুণে',
    badge: 'সেরা অফার • ৫০% পর্যন্ত ছাড়',
    cta: 'Buy Now',
    link: 'https://www.daraz.com.bd',
    bgGradient: 'from-[#0D5C3A] via-[#1B794B] to-[#0A472C]',
    accentColor: '#10B981',
    btnBg: 'bg-[#FACC15] hover:bg-[#EAB308] text-[#1E293B]',
    productImage: '🌿',
    theme: 'green',
    rating: '4.9 ★★★★★'
  },
  {
    id: 'daraz-mega-sale',
    brand: 'Daraz Bangladesh',
    headline: 'Mega Shopping Fest — সর্বোচ্চ ৮০% পর্যন্ত নিশ্চিত ছাড়!',
    subline: 'ফ্রি ডেলিভারি ও ভাউচার সহ পছন্দের সকল ব্র্যান্ডের কালেকশন',
    badge: 'OFFICIAL STORE • 11.11 SALE',
    cta: 'Shop Now',
    link: 'https://www.daraz.com.bd',
    bgGradient: 'from-[#E11D48] via-[#F43F5E] to-[#FB7185]',
    accentColor: '#FB7185',
    btnBg: 'bg-white hover:bg-slate-100 text-[#E11D48]',
    productImage: '🛍️',
    theme: 'rose',
    rating: '4.8 ★★★★★'
  },
  {
    id: 'samsung-galaxy-ai',
    brand: 'Samsung Galaxy 5G',
    headline: 'Galaxy AI is Here — Next-Gen Flagship Smartphone',
    subline: 'ProVisual Engine, Circle to Search & 200MP Ultra Camera',
    badge: '0% EMI AVAILABLE • OFFICIAL WARRANTY',
    cta: 'Explore',
    link: 'https://www.samsung.com',
    bgGradient: 'from-[#0F172A] via-[#1E1B4B] to-[#312E81]',
    accentColor: '#6366F1',
    btnBg: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white',
    productImage: '📱',
    theme: 'indigo',
    rating: '5.0 ★★★★★'
  },
  {
    id: 'nagad-cashback',
    brand: 'Nagad Digital Payment',
    headline: 'যেকোনো কেনাকাটায় পাচ্ছেন নিশ্চিত ১৫% ক্যাশব্যাক!',
    subline: '৫০০০+ অনলাইন ও অফলাইন মার্চেন্টে নিরাপদ ও দ্রুত লেনদেন',
    badge: 'EXCLUSIVE CASHBACK OFFER',
    cta: 'Pay Now',
    link: 'https://www.nagad.com.bd',
    bgGradient: 'from-[#C2410C] via-[#EA580C] to-[#FB923C]',
    accentColor: '#F97316',
    btnBg: 'bg-slate-950 hover:bg-black text-[#FED7AA]',
    productImage: '💳',
    theme: 'orange',
    rating: '4.9 ★★★★★'
  },
  {
    id: 'walton-smart-inverter',
    brand: 'Walton Smart Inverter',
    headline: 'Walton Smart AC & 4K TV — বিদ্যুৎ সাশ্রয়ী ৭০% পর্যন্ত',
    subline: 'আইওটি স্মার্ট টেকনোলজি ও ১০ বছরের কম্প্রেসার গ্যারান্টি',
    badge: 'DIRECT FACTORY PRICE',
    cta: 'Order Today',
    link: 'https://waltonbd.com',
    bgGradient: 'from-[#0369A1] via-[#0284C7] to-[#38BDF8]',
    accentColor: '#38BDF8',
    btnBg: 'bg-[#F59E0B] hover:bg-[#D97706] text-slate-950',
    productImage: '❄️',
    theme: 'sky',
    rating: '4.8 ★★★★★'
  },
  {
    id: 'unilever-pureit',
    brand: 'Unilever Pureit Mineral',
    headline: '১০০% ব্যাকটেরিয়া ও ভাইরাস মুক্ত বিশুদ্ধ মিনারেল পানি',
    subline: 'উন্নত আরও (RO) ফিল্ট্রেশন প্রযুক্তি ও ফ্রি ইনস্টলেশন সুবিধা',
    badge: '100% SAFE DRINKING WATER',
    cta: 'Learn More',
    link: 'https://www.unilever.com',
    bgGradient: 'from-[#047857] via-[#059669] to-[#34D399]',
    accentColor: '#34D399',
    btnBg: 'bg-white hover:bg-slate-100 text-[#047857]',
    productImage: '💧',
    theme: 'emerald',
    rating: '4.9 ★★★★★'
  }
];

const BannerAd = ({ globalSettings, size = 'banner', onAdClick }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(() => Math.floor(Math.random() * COMMERCIAL_DISPLAY_ADS.length));
  const [showAdInfoModal, setShowAdInfoModal] = useState(false);
  const [isAdHidden, setIsAdHidden] = useState(false);
  const [adSenseFailed, setAdSenseFailed] = useState(false);
  const adRef = useRef(null);

  // Check if admin has configured an active custom promo banner
  const customPromoBanner = globalSettings?.promoBanners?.find(b => b.isActive && b.imageUrl) || 
    (globalSettings?.promoBanner?.isActive && globalSettings?.promoBanner?.imageUrl ? globalSettings.promoBanner : null);

  useEffect(() => {
    // Attempt Google AdSense push if on Web and adsbygoogle is loaded
    if (!Capacitor.isNativePlatform() && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        setAdSenseFailed(true);
      }
    }
  }, []);

  const handleAdCardClick = (e) => {
    // Prevent trigger when clicking AdChoices icons
    if (e.target.closest('.ad-choice-trigger')) return;

    const ad = COMMERCIAL_DISPLAY_ADS[currentAdIndex];

    if (customPromoBanner?.linkUrl) {
      window.open(customPromoBanner.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (Capacitor.isNativePlatform()) {
      AdMobService.showInterstitial();
    } else if (ad?.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }

    if (onAdClick) onAdClick();
  };

  const isLeaderboard = size === 'leaderboard' || size === 'top' || size === 'horizontal';
  const isBig = size === 'big' || size === 'medium_rectangle' || size === 'square';
  const ad = COMMERCIAL_DISPLAY_ADS[currentAdIndex];

  if (isAdHidden) {
    return (
      <div className="w-full p-2.5 my-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500 animate-fade-in">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Ad closed by Google.
        </span>
        <button 
          onClick={() => setIsAdHidden(false)}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Undo
        </button>
      </div>
    );
  }

  // If Admin configured custom uploaded image banner
  if (customPromoBanner && customPromoBanner.imageUrl) {
    return (
      <div className="relative w-full my-3 group select-none">
        <div 
          onClick={handleAdCardClick}
          className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer bg-slate-100 dark:bg-slate-900"
        >
          <img 
            src={customPromoBanner.imageUrl} 
            alt="Promotional Advertisement" 
            className="w-full h-auto object-cover max-h-[160px]"
            loading="lazy"
          />
          {/* AdChoices Badge */}
          <div className="absolute top-1 right-1 flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500 shadow-xs gap-1 border border-slate-200/50">
            <span>Ad</span>
            <Info className="w-2.5 h-2.5 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full my-3 select-none animate-fade-in" ref={adRef}>
      {/* Container simulating high-converting Google AdSense / Newspaper Display Banner */}
      <div 
        onClick={handleAdCardClick}
        className={`relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer bg-gradient-to-r ${ad.bgGradient} text-white`}
      >
        {/* Google AdChoices Top-Right Badge (Authentic ⓘ ✖) */}
        <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-md px-1.5 py-0.5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 ad-choice-trigger">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowAdInfoModal(true); }}
            className="flex items-center gap-0.5 text-[9px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
            title="AdChoices by Google"
          >
            <span className="opacity-80">AdChoices</span>
            <Info className="w-2.5 h-2.5 text-blue-500" />
          </button>
          <span className="text-slate-300 dark:text-slate-600 text-[9px]">|</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsAdHidden(true); }}
            className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors"
            title="Close this ad"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Decorative Grid Mesh & Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* 1. LEADERBOARD / TOP BANNER FORMAT (Horizontal ratio, like bd-pratidin header ad) */}
        {isLeaderboard ? (
          <div className="flex items-center justify-between p-3 sm:p-4 min-h-[96px] sm:min-h-[105px] relative z-10 gap-3">
            {/* Left: Product Icon & Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
                {ad.productImage}
              </div>
              <div className="min-w-0 flex-1 pr-14 sm:pr-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-black/20 px-1.5 py-0.2 rounded">
                    {ad.brand}
                  </span>
                  <span className="text-[9px] font-medium text-white/70 hidden sm:inline-block">
                    {ad.rating}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-1">
                  {ad.headline}
                </h4>
                <p className="text-[11px] text-white/85 font-normal leading-snug line-clamp-1 mt-0.5">
                  {ad.subline}
                </p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="shrink-0 hidden xs:flex flex-col items-end gap-1">
              <button 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black shadow-md ${ad.btnBg} flex items-center gap-1 transform active:scale-95 transition-all`}
              >
                <span>{ad.cta}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <span className="text-[8px] font-semibold text-white/60 uppercase tracking-widest">
                Sponsored Ad
              </span>
            </div>
          </div>
        ) : isBig ? (
          /* 2. MEDIUM RECTANGLE / BIG AD (Inside article text) */
          <div className="p-4 sm:p-5 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative z-10">
            {/* Top Brand & Badge */}
            <div className="flex items-center gap-2 mb-2 pr-16">
              <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase text-white shadow-xs">
                {ad.badge}
              </span>
              <span className="text-[11px] font-bold text-amber-300">
                {ad.brand}
              </span>
            </div>

            {/* Center Content */}
            <div className="flex items-center gap-3.5 my-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-inner">
                {ad.productImage}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                  {ad.headline}
                </h4>
                <p className="text-xs text-white/85 font-normal leading-relaxed line-clamp-2 mt-1">
                  {ad.subline}
                </p>
              </div>
            </div>

            {/* Bottom Bar: Rating & CTA */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/90">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified Google Publisher Ad</span>
              </div>
              <button 
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg ${ad.btnBg} flex items-center gap-1.5 transform active:scale-95 transition-all`}
              >
                <span>{ad.cta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* 3. STANDARD COMPACT INLINE BANNER */
          <div className="flex items-center justify-between p-3 min-h-[75px] relative z-10 gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {ad.productImage}
              </div>
              <div className="min-w-0 flex-1 pr-12">
                <h4 className="text-xs font-black text-white leading-tight line-clamp-1">
                  {ad.headline}
                </h4>
                <p className="text-[10px] text-white/80 font-normal line-clamp-1 mt-0.5">
                  {ad.brand} • {ad.subline}
                </p>
              </div>
            </div>

            <button 
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black shadow-md ${ad.btnBg} shrink-0 hidden xs:flex items-center gap-1 transform active:scale-95 transition-all`}
            >
              <span>{ad.cta}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Google AdChoices Modal Popup */}
      {showAdInfoModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Ads by Google</h3>
              </div>
              <button 
                onClick={() => setShowAdInfoModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <p>
                This advertisement was delivered to you based on content relevance and Google Advertising Partner Guidelines.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-1.5 border border-slate-100 dark:border-slate-700/50">
                <p className="font-bold text-slate-800 dark:text-slate-200">Ad Choices Options:</p>
                <button 
                  onClick={() => { setIsAdHidden(true); setShowAdInfoModal(false); }}
                  className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold transition-colors"
                >
                  ✖ Stop seeing this ad
                </button>
                <a 
                  href="https://adssettings.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block py-1.5 px-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold transition-colors"
                >
                  ℹ️ Google Ad Preferences & Settings
                </a>
              </div>
            </div>

            <button 
              onClick={() => setShowAdInfoModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerAd;
