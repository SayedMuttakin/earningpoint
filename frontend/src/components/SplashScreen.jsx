import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Preload the app icon for instant display
const preloadImg = new Image();
preloadImg.src = '/logo.png';

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
    const duration = 1800;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const raw = currentStep / steps;
      // Ease-out curve for more natural feel
      const eased = 1 - Math.pow(1 - raw, 2);
      const newProgress = Math.min(eased * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => onFinish(), 200);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F5F0FF 0%, #FFFFFF 55%, #EDE9FE 100%)' }}
    >
      {/* ── Decorative blobs ── */}
      <div
        className="absolute top-[-80px] left-[-80px] w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[45%] right-[-40px] w-[160px] h-[160px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%)' }}
      />

      {/* ── Floating SVG particles ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <Particle cx="15%" cy="20%" r={8} delay={0} dur={3.2} />
        <Particle cx="80%" cy="15%" r={6} delay={0.8} dur={2.8} />
        <Particle cx="88%" cy="55%" r={5} delay={1.4} dur={3.5} />
        <Particle cx="10%" cy="65%" r={10} delay={0.4} dur={4} />
        <Particle cx="50%" cy="88%" r={7} delay={1.0} dur={3} />
        <Particle cx="25%" cy="80%" r={4} delay={1.8} dur={2.5} />
        <Particle cx="70%" cy="78%" r={9} delay={0.2} dur={3.8} />
      </svg>

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Outer glow ring around logo */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 160,
            height: 160,
            background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)',
          }}
        />

        {/* App icon — actual project icon, preloaded for zero-delay display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-4"
        >
          <img
            src="/logo.png"
            alt="Zenivio"
            width={96}
            height={96}
            fetchpriority="high"
            decoding="sync"
            style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 22, display: 'block' }}
          />
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col items-center"
        >
          <h1
            className="text-3xl font-bold tracking-tight mb-1"
            style={{ color: '#1E1B4B' }}
          >
            Zenivio
          </h1>
          <p className="text-sm font-medium" style={{ color: '#8B5CF6' }}>
            Earn · Connect · Grow
          </p>
        </motion.div>
      </div>

      {/* ── Progress bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-[14%] w-full flex flex-col items-center z-10 px-12"
      >
        <div
          className="w-full max-w-[220px] h-1.5 rounded-full overflow-hidden mb-3"
          style={{ background: 'rgba(167,139,250,0.2)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(167,139,250,0.6)',
            }}
            transition={{ ease: 'linear', duration: 0.03 }}
          />
        </div>
        <p className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
          Loading…
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
