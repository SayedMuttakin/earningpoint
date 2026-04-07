import React from 'react';
import { ArrowLeft, Menu, Clock, Award, BookOpen } from 'lucide-react';

const SectionIntroOverlay = ({ item, balance, onClose, onContinue }) => {
  if (!item) return null;

  const bgClass = item.color || 'from-blue-500 to-indigo-600';
  const iconElement = React.isValidElement(item.icon)
    ? React.cloneElement(item.icon, { className: 'w-14 h-14 text-slate-900' })
    : <span className="text-4xl">✨</span>;

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-900/95 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-95" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-slate-900 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.category || 'Earning'}</p>
            <h2 className="text-base font-black text-white tracking-tight sm:text-lg">{item.name}</h2>
          </div>

          <div className="rounded-full bg-white/95 px-3 py-2 text-sm font-bold text-slate-900 shadow-lg">
            {balance != null ? `৳${balance.toFixed(2)}` : 'Balance'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="mx-auto max-w-md overflow-hidden rounded-[40px] bg-white shadow-2xl">
            <div className={`relative overflow-hidden bg-gradient-to-br ${bgClass} px-6 pb-8 pt-8`}> 
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_35%)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-white/10 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-xl animate-bounce">
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="h-14 w-14 object-contain" />
                  ) : (
                    iconElement
                  )}
                </div>
                <div className="space-y-2 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] opacity-80">{item.subtitle || item.category || 'Quiz Screen'}</p>
                  <h3 className="text-3xl font-black leading-tight">{item.name}</h3>
                </div>
              </div>

              {item.entryFee != null && (
                <div className="mt-5 inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">
                  Entry fee: {item.entryFee}
                </div>
              )}

              <div className="mt-7 rounded-[32px] bg-white/10 p-5 shadow-inner shadow-slate-900/10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-3xl bg-white/15 p-3 text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-200/80">Duration</p>
                    <p className="text-lg font-black text-white">{item.duration || 'Instant'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="rounded-3xl bg-white/15 p-3 text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-200/80">Prize</p>
                    <p className="text-lg font-black text-white">{item.prizeText || `+${item.coins ?? 0} Coins`}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-white px-6 py-6">
              {item.description && (
                <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-3xl bg-slate-900/10 p-3 text-slate-900">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Instructions</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Sponsored Ad</p>
                    <p className="text-sm font-black text-slate-900">Google AdMob Test</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">320x250</span>
                </div>
                <div className="mx-auto w-[320px] max-w-full h-[250px] overflow-hidden rounded-[28px] bg-white shadow-inner border border-slate-200">
                  <div className="relative h-full w-full bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900">
                    <div className="absolute inset-x-0 top-4 flex items-center justify-center gap-3 px-4">
                      <div className="h-12 w-12 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black">G</div>
                      <div className="text-left">
                        <p className="text-sm font-black">Ads by Google</p>
                        <p className="text-[11px] text-slate-500">Medium Rectangle</p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-4 px-4 text-center">
                      <p className="text-base font-black text-slate-900">Play {item.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        320x250 test ad placeholder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-base font-black text-white shadow-2xl shadow-slate-900/20 transition hover:-translate-y-0.5"
              >
                Play {item.name}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Close Intro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionIntroOverlay;
