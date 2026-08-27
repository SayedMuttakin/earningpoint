import React from 'react';
import { ArrowLeft, CheckCircle2, Play, Star, Coins } from 'lucide-react';
import { AdMobService } from '../utils/admob';
import { API_BASE } from '../config';

/**
 * MultiAdViewPage
 * Props:
 *   config     = { key, name, logo, color, coins, adType }
 *   onClose    = () => void   — called after back + interstitial
 *   onCoinsEarned = (amount, label) => void  — refresh parent balance/coins
 */
const MultiAdViewPage = ({ config, onClose, onCoinsEarned }) => {
  const AD_COUNT = 5;
  const storageKey = `multi_ad_slots_${config.key}_${new Date().toDateString()}`;

  // ── State ──────────────────────────────────────────────────
  const [watchedSlots, setWatchedSlots] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved) && saved.length === AD_COUNT) return saved;
    } catch (_) {}
    return Array(AD_COUNT).fill(false);
  });

  const [isPlaying, setIsPlaying]         = React.useState(false);
  const [activeSlot, setActiveSlot]       = React.useState(null);
  const [loadingSlot, setLoadingSlot]     = React.useState(null);
  const [congrats, setCongrats]           = React.useState(null); // { slotIndex, coins }
  const [isReturning, setIsReturning]     = React.useState(false);
  const isAdLoading = React.useRef(false);

  const [videoAdState, setVideoAdState]   = React.useState(null); // { slotIdx, timeLeft, brand, progress }
  const videoAdTimerRef                  = React.useRef(null);

  // Sponsored brands for instant failover video ads
  const SPONSORS = [
    {
      name: "Samsung Galaxy AI",
      tagline: "Experience the Future of Mobile AI",
      badge: "Flagship Smartphone",
      icon: "https://img.icons8.com/color/96/samsung.png",
      cta: "Explore Galaxy AI",
      link: "https://www.samsung.com",
      bgGradient: "from-blue-900 via-indigo-950 to-slate-950",
      accent: "#3b82f6"
    },
    {
      name: "Daraz Mega Super Sale",
      tagline: "Up to 75% Off + Free Nationwide Delivery",
      badge: "Top eCommerce Deal",
      icon: "https://img.icons8.com/color/96/shopping-bag.png",
      cta: "Shop Deals Now",
      link: "https://www.daraz.com.bd",
      bgGradient: "from-orange-900 via-rose-950 to-slate-950",
      accent: "#f97316"
    },
    {
      name: "Nagad Digital Banking",
      tagline: "Fastest Money Transfer & Cash Out Rebates",
      badge: "Mobile Finance",
      icon: "https://img.icons8.com/color/96/bank-cards.png",
      cta: "Get Started Free",
      link: "https://nagad.com.bd",
      bgGradient: "from-amber-900 via-red-950 to-slate-950",
      accent: "#ef4444"
    },
    {
      name: "Walton Smart Inverter",
      tagline: "Save 70% Electricity • 10 Years Warranty",
      badge: "Home Appliance",
      icon: "https://img.icons8.com/color/96/tv.png",
      cta: "Learn More",
      link: "https://waltonbd.com",
      bgGradient: "from-emerald-900 via-teal-950 to-slate-950",
      accent: "#10b981"
    }
  ];

  // Persist watched slots to localStorage
  const markSlotWatched = (idx) => {
    setWatchedSlots(prev => {
      const next = [...prev];
      next[idx] = true;
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  // Credit coins to backend
  const creditCoins = async (slotIdx) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/earning/task-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ points: config.coins, name: `${config.name} Ad #${slotIdx + 1}` }),
      });
      const data = await res.json();
      if (res.ok) {
        if (onCoinsEarned) onCoinsEarned(config.coins, config.name, data);
      }
    } catch (_) {}
  };

  // Start built-in sponsored interactive video ad
  const startInAppVideoAd = (slotIdx) => {
    const sponsor = SPONSORS[slotIdx % SPONSORS.length];
    const totalDuration = 12; // 12-second rewarding interactive ad
    setVideoAdState({
      slotIdx,
      timeLeft: totalDuration,
      totalDuration,
      sponsor,
      canClose: false,
      completed: false
    });

    if (videoAdTimerRef.current) clearInterval(videoAdTimerRef.current);

    videoAdTimerRef.current = setInterval(() => {
      setVideoAdState(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(videoAdTimerRef.current);
          return {
            ...prev,
            timeLeft: 0,
            canClose: true,
            completed: true
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);
  };

  // Finish in-app video ad and claim coins
  const handleCompleteInAppVideoAd = async () => {
    if (!videoAdState || !videoAdState.completed) return;
    const slotIdx = videoAdState.slotIdx;
    setVideoAdState(null);
    isAdLoading.current = false;
    setLoadingSlot(null);
    setIsPlaying(false);

    markSlotWatched(slotIdx);
    await creditCoins(slotIdx);
    setCongrats({ slotIndex: slotIdx, coins: config.coins });
    setTimeout(() => setCongrats(null), 3500);
  };

  // Watch an ad slot
  const watchAd = async (idx) => {
    if (watchedSlots[idx] || loadingSlot !== null || isAdLoading.current) return;
    isAdLoading.current = true;
    setLoadingSlot(idx);
    setActiveSlot(idx);

    const adType = config.adType || 'rewarded';

    const onSuccess = async () => {
      isAdLoading.current = false;
      setLoadingSlot(null);
      setIsPlaying(false);
      markSlotWatched(idx);
      await creditCoins(idx);
      // Show congrats banner
      setCongrats({ slotIndex: idx, coins: config.coins });
      setTimeout(() => setCongrats(null), 3500);
    };

    const onError = () => {
      // If AdMob failed to fill, seamlessly launch the in-app sponsored video player
      startInAppVideoAd(idx);
    };

    const onDismiss = () => {
      isAdLoading.current = false;
      setLoadingSlot(null);
      setIsPlaying(false);
    };

    try {
      if (adType === 'rewarded' || adType === 'native') {
        await AdMobService.showRewarded(onSuccess, 'rewarded', onError, onDismiss);
      } else if (adType === 'interstitial') {
        await AdMobService.showInterstitial(onSuccess, onError, onDismiss);
      } else {
        await AdMobService.showRewarded(onSuccess, 'rewarded', onError, onDismiss);
      }
    } catch (_) {
      startInAppVideoAd(idx);
    }
  };

  // Back button — navigate directly without showing an ad
  const handleBack = () => {
    if (isReturning) return;
    if (onClose) onClose();
  };

  const watchedCount = watchedSlots.filter(Boolean).length;
  const totalCoinsEarnable = AD_COUNT * config.coins;
  const totalEarned = watchedCount * config.coins;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 overflow-hidden">

      {/* ── Congratulations Banner (top slide-in) ── */}
      {congrats && (
        <div
          className="absolute top-0 left-0 right-0 z-[10001] flex items-center justify-center px-4 pt-safe pointer-events-none"
          style={{ animation: 'slideDown 0.35s ease' }}
        >
          <div className="mt-2 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold max-w-sm w-full">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-black text-base">+{congrats.coins} Coins Earned!</div>
              <div className="text-emerald-100 text-xs font-medium">Added to your wallet • {config.name} Ad #{congrats.slotIndex + 1}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Video Ad Overlay ── */}
      {videoAdState && (
        <div className="fixed inset-0 z-[10005] bg-slate-950 flex flex-col justify-between text-white animate-fade-in select-none">
          {/* Top Bar */}
          <div className="pt-safe px-5 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-black tracking-wider uppercase flex items-center gap-1">
                <span>Ad</span>
                <span className="text-white/40">•</span>
                <span>{videoAdState.sponsor.badge}</span>
              </div>
              <span className="text-[10px] text-white/50 hidden sm:inline">Google AdChoices ⓘ</span>
            </div>

            {/* Countdown / Claim Pill */}
            {videoAdState.completed ? (
              <button
                onClick={handleCompleteInAppVideoAd}
                className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/30 animate-bounce flex items-center gap-1.5 cursor-pointer"
              >
                <span>✓ Close & Claim Reward</span>
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Reward in {videoAdState.timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Center Interactive Commercial Experience */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className={`w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b ${videoAdState.sponsor.bgGradient} border border-white/15 shadow-2xl relative overflow-hidden flex flex-col items-center gap-5`}>
              
              {/* Decorative background glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {/* Sponsor Logo */}
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 p-3.5 shadow-xl flex items-center justify-center backdrop-blur-sm">
                <img src={videoAdState.sponsor.icon} alt={videoAdState.sponsor.name} className="w-full h-full object-contain" />
              </div>

              {/* Headline & Details */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">
                  {videoAdState.sponsor.name}
                </h2>
                <p className="text-xs text-white/80 font-medium">
                  {videoAdState.sponsor.tagline}
                </p>
              </div>

              {/* Video Player Visual Simulation */}
              <div className="w-full aspect-video bg-black/60 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-sm animate-pulse z-10">
                  <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white/70 z-10">
                  <span>HD 1080p Commercial</span>
                  <span>+{config.coins} Coins</span>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={videoAdState.sponsor.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: videoAdState.sponsor.accent }}
              >
                <span>{videoAdState.sponsor.cta}</span>
                <span className="text-base">↗</span>
              </a>
            </div>
          </div>

          {/* Bottom Progress & Reward Bar */}
          <div className="pb-safe px-6 py-4 bg-black/40 backdrop-blur-md border-t border-white/10 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white/70">
              <span>{videoAdState.completed ? '🎉 Video Ad Complete!' : 'Watching Sponsored Video...'}</span>
              <span className="text-amber-400 font-black">+{config.coins} Coins</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min(100, ((videoAdState.totalDuration - videoAdState.timeLeft) / videoAdState.totalDuration) * 100)}%` }}
              />
            </div>

            {videoAdState.completed && (
              <button
                onClick={handleCompleteInAppVideoAd}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
              >
                <Coins className="w-5 h-5 text-amber-300" />
                <span>Claim +{config.coins} Coins & Close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div
        className={`relative shrink-0 pt-safe bg-gradient-to-r ${config.color || 'from-red-500 to-rose-600'} px-4 pb-4`}
      >
        {/* Top row: back + title */}
        <div className="flex items-center gap-3 pt-3 pb-2">
          <button
            onClick={handleBack}
            disabled={isReturning}
            className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-white active:scale-95 transition-transform shrink-0"
          >
            {isReturning
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <ArrowLeft className="w-5 h-5" />}
          </button>
          {config.logo
            ? <img src={config.logo} alt={config.name} className="w-8 h-8 rounded-xl object-contain" />
            : <div className={`w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center`}><Play className="w-4 h-4 text-white" /></div>
          }
          <div>
            <h1 className="text-white font-black text-lg leading-none">{config.name}</h1>
            <p className="text-white/70 text-xs font-medium">Watch ads · Earn coins</p>
          </div>
        </div>

        {/* Progress bar + stats */}
        <div className="bg-black/20 rounded-2xl px-4 py-3 mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-xs font-bold">{watchedCount}/{AD_COUNT} ads watched today</span>
            <span className="text-amber-300 font-black text-sm">+{totalEarned}/{totalCoinsEarnable} Coins</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(watchedCount / AD_COUNT) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Ad Slots List ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">

        {/* Info chip */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-700">
          <Star className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-slate-300 text-xs font-medium">
            Tap each card to watch a rewarded video and earn <span className="text-amber-400 font-bold">{config.coins} coins</span> per ad.
          </p>
        </div>

        {Array.from({ length: AD_COUNT }).map((_, idx) => {
          const done = watchedSlots[idx];
          const loading = loadingSlot === idx;
          return (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden border transition-all ${
                done
                  ? 'bg-emerald-900/30 border-emerald-700/40'
                  : 'bg-slate-800/80 border-slate-700 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-4 px-4 py-4">
                {/* Slot number / icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    done
                      ? 'bg-emerald-500/20'
                      : `bg-gradient-to-br ${config.color || 'from-red-500 to-rose-600'} opacity-80`
                  }`}
                >
                  {done
                    ? <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    : config.logo
                      ? <img src={config.logo} alt="" className="w-8 h-8 object-contain rounded-lg" />
                      : <Play className="w-6 h-6 text-white fill-white" />
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm ${done ? 'text-emerald-400' : 'text-white'}`}>
                      {config.name} — Ad #{idx + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-amber-400 font-bold">+{config.coins} Coins</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-400">{done ? 'Claimed ✓' : 'Rewarded Video'}</span>
                  </div>
                </div>

                {/* CTA */}
                {done ? (
                  <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </div>
                ) : (
                  <button
                    onClick={() => watchAd(idx)}
                    disabled={loading || loadingSlot !== null}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm transition-all active:scale-95 ${
                      loadingSlot !== null && loadingSlot !== idx
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : `bg-gradient-to-r ${config.color || 'from-red-500 to-rose-600'} text-white shadow-lg`
                    }`}
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Play className="w-4 h-4 fill-white" />
                    }
                    {loading ? 'Loading…' : 'Watch'}
                  </button>
                )}
              </div>

              {/* Done shimmer line */}
              {done && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0" />
              )}
            </div>
          );
        })}

        {/* All done card */}
        {watchedCount === AD_COUNT && (
          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-700/40 rounded-2xl px-5 py-6 text-center mt-2">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-emerald-400 font-black text-lg">All Ads Complete!</h3>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              You earned <span className="text-amber-400 font-bold">{totalCoinsEarnable} Coins</span> today from {config.name}.
            </p>
            <p className="text-slate-500 text-xs mt-2">Come back tomorrow for more!</p>
          </div>
        )}

        <div className="h-6" />
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MultiAdViewPage;
