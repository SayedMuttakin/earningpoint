import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Shield, Lock, X } from 'lucide-react';
import verifiedBadgeImg from '../assets/user_verified_badge.jpeg';

const resolveBadgeSize = (sz) => {
  if (!sz) return "w-[18px] h-[18px]";
  if (sz === 'xs') return "w-3 h-3";
  if (sz === 'sm') return "w-3.5 h-3.5";
  if (sz === 'md') return "w-4.5 h-4.5";
  if (sz === 'lg') return "w-5 h-5";
  if (sz === 'xl') return "w-6 h-6";
  return sz;
};

const VerifiedBadge = ({ className = "", size, iconClassName, type = "purple" }) => {
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = (e) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
  };

  const isSvgBadge = type !== 'user';
  const isGolden = type === 'golden';
  // Project brand purple (#7c3aed) replaces blue tick
  const badgeColor = isGolden ? '#EAB308' : '#7c3aed';
  const resolvedSize = resolveBadgeSize(size);
  const userBadgeSize = resolvedSize;
  const companyBadgeSize = iconClassName || `${resolvedSize} flex-shrink-0`;

  return (
    <>
      <button
        onClick={togglePopup}
        className={`inline-flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 cursor-pointer ${className}`}
        aria-label="Verified Account Information"
        type="button"
      >
        {isSvgBadge ? (
          <svg viewBox="0 0 24 24" aria-label="Verified account" className={companyBadgeSize} fill="currentColor">
            <g>
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill={badgeColor}/>
              <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
            </g>
          </svg>
        ) : (
          <img
            src={verifiedBadgeImg}
            alt="Verified"
            className={`${userBadgeSize} object-contain rounded-full`}
          />
        )}
      </button>

      {showPopup && createPortal(
        <AnimatePresence>
          {showPopup && (
            <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPopup(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col items-center z-10 mx-auto border border-purple-100/80 dark:border-purple-900/30 overflow-hidden"
              >
                {/* Mobile drag handle */}
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mb-2 sm:hidden" />

                {/* Top Close Button */}
                <div className="w-full flex justify-end">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Glowing Shield Icon Header */}
                <div className="relative flex items-center justify-center my-2">
                  <div 
                    className="absolute w-24 h-24 rounded-full blur-xl opacity-60 animate-pulse pointer-events-none"
                    style={{ backgroundColor: `${badgeColor}33` }}
                  />
                  <div 
                    className="absolute w-20 h-20 rounded-full border border-dashed opacity-40 animate-spin pointer-events-none"
                    style={{ borderColor: badgeColor, animationDuration: '16s' }}
                  />
                  <div 
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-white"
                    style={{ 
                      background: isGolden ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #7C3AED, #A855F7)',
                      boxShadow: isGolden ? '0 8px 25px rgba(245,158,11,0.35)' : '0 8px 25px rgba(124,58,237,0.35)'
                    }}
                  >
                    <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mt-2 tracking-tight">
                  {isGolden ? 'Verified Organization' : 'Verified Account'}
                </h3>
                
                {/* Decorative underline bar */}
                <div 
                  className="w-10 h-1 rounded-full my-2" 
                  style={{ background: isGolden ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' : 'linear-gradient(90deg, #7C3AED, #A855F7)' }}
                />

                {/* Subtitle */}
                <p className="text-slate-500 dark:text-slate-400 text-xs text-center leading-relaxed px-1 mb-5 font-medium">
                  Verification helps protect this account from unauthorized access and makes account recovery easier.
                </p>

                {/* 3 Feature Boxes */}
                <div className="w-full space-y-2.5 mb-5 text-left">
                  {/* Card 1 */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: isGolden ? 'rgba(245,158,11,0.12)' : 'rgba(124,58,237,0.12)',
                        color: badgeColor
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verified & Authentic</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        This account is verified by Zenivio's advanced system.
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: isGolden ? 'rgba(245,158,11,0.12)' : 'rgba(124,58,237,0.12)',
                        color: badgeColor
                      }}
                    >
                      <Shield className="w-4 h-4 stroke-[2.3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reliable & Safe</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        We verify accounts to ensure a safe and trusted environment.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: isGolden ? 'rgba(245,158,11,0.12)' : 'rgba(124,58,237,0.12)',
                        color: badgeColor
                      }}
                    >
                      <Lock className="w-4 h-4 stroke-[2.3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Stronger Protection</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Verification helps keep the account secure and protected.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Branding */}
                <div className="flex items-center justify-center gap-1.5 pt-1 select-none">
                  <img 
                    src="/zenivio-logo.png" 
                    alt="Zenivio" 
                    className="w-4 h-4 object-contain rounded-md shadow-xs" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <span className="text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Verified by Zenivio
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default VerifiedBadge;


