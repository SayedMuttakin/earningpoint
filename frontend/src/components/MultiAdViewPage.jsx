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
      isAdLoading.current = false;
      setLoadingSlot(null);
      setIsPlaying(false);
      // Fallback: show simulated ad
      setIsPlaying(true);
      setTimeout(async () => {
        setIsPlaying(false);
        markSlotWatched(idx);
        await creditCoins(idx);
        setCongrats({ slotIndex: idx, coins: config.coins });
        setTimeout(() => setCongrats(null), 3500);
      }, 5000);
    };

    try {
      if (adType === 'rewarded') {
        setIsPlaying(true);
        await AdMobService.showRewarded(onSuccess, 'rewarded');
      } else if (adType === 'interstitial') {
        setIsPlaying(true);
        await AdMobService.showInterstitial(onSuccess);
      } else {
        // Simulated fallback
        setIsPlaying(true);
        setTimeout(onSuccess, 5000);
      }
    } catch (_) {
      onError();
    }
  };

  // Back button — plays interstitial first
  const handleBack = () => {
    if (isReturning || isAdLoading.current) return;
    setIsReturning(true);
    isAdLoading.current = true;
    AdMobService.showInterstitial(() => {
      isAdLoading.current = false;
      setIsReturning(false);
      if (onClose) onClose();
    });
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

      {/* ── Simulated Ad Overlay ── */}
      {isPlaying && (
        <div className="absolute inset-0 z-[10000] bg-black flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center animate-pulse">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
          <p className="text-white font-bold text-lg">Playing Ad…</p>
          <p className="text-white/50 text-sm">Please wait for the ad to complete</p>
          <div className="absolute bottom-10 w-full flex justify-center">
            <div className="text-white/30 text-xs">AdMob Test Ad</div>
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
