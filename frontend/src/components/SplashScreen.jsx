import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Preload the splash icon for instant display
const preloadImg = new Image();
preloadImg.src = '/splash-icon.png';

// Floating particle
const Particle = ({ cx, cy, r, delay, dur }) => (
  <motion.circle
    cx={cx} cy={cy} r={r}
    fill="rgba(167,139,250,0.5)"
    animate={{ y: [0, -14, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 800; // 0.8s progress fill + 0.2s finish = exactly 1.0 second total splash duration
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const raw = currentStep / steps;
      const eased = 1 - Math.pow(1 - raw, 2);
      const newProgress = Math.min(eased * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => onFinish(), 150);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-white select-none"
    >
      {/* ── Decorative subtle background glows ── */}
      <div
        className="absolute top-[-80px] left-[-80px] w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)' }}
      />

      {/* ── Center Text Content (No Logo Image) ── */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center text-center"
        >
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight mb-2 uppercase"
            style={{ color: '#7C3AED', letterSpacing: '0.08em' }}
          >
            ZENIVIO
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-wide text-slate-500">
            More Than a Social Network
          </p>
        </motion.div>
      </div>

      {/* ── Bottom Progress Bar (1 second duration) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute bottom-[14%] w-full flex flex-col items-center z-10 px-12"
      >
        <div
          className="w-full max-w-[200px] h-1.5 rounded-full overflow-hidden mb-2.5 bg-slate-100"
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7C3AED, #9333EA)',
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(124, 58, 237, 0.4)',
            }}
            transition={{ ease: 'linear', duration: 0.02 }}
          />
        </div>
        <p className="text-[11px] font-bold text-slate-400">
          Loading...
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
