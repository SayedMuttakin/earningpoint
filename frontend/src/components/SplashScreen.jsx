import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2500; // 2.5 seconds total loading time
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onFinish();
        }, 300); // small delay after reaching 100%
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden sm:rounded-[2.5rem] rounded-3xl shadow-2xl">
      {/* Top Left Wave */}
      <motion.div 
        initial={{ opacity: 0, x: -50, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 left-0 w-full h-auto pointer-events-none"
      >
        <svg viewBox="0 0 375 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[80%] max-w-[300px]">
          <path d="M0 0H375C375 0 350.5 40.5 288.5 61C226.5 81.5 186.5 42.5 125 56C63.5 69.5 0 162 0 162V0Z" fill="url(#paint0_linear)"/>
          <path d="M0 0H285C285 0 248.5 20.5 185 36.5C121.5 52.5 91 16 41 42.5C-9 69 0 137 0 137V0Z" fill="url(#paint1_linear)" fillOpacity="0.6"/>
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="375" y2="162" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6E72FC" stopOpacity="0.4"/>
              <stop offset="1" stopColor="#AD1DEB" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="0" y1="0" x2="285" y2="137" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4184FF"/>
              <stop offset="1" stopColor="#A067FF"/>
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Floating Circles */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute top-[15%] right-[25%] w-6 h-6 rounded-full bg-purple-200 opacity-40 blur-[1px]"
      />
      <motion.div 
        animate={{ y: [0, 15, 0] }} 
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[30%] left-[15%] w-10 h-10 rounded-full bg-blue-100 opacity-60 blur-[1px]"
      />

      {/* Bottom Right Wave */}
      <motion.div 
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-0 right-0 w-full h-auto flex justify-end pointer-events-none"
      >
        <svg viewBox="0 0 375 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[85%] max-w-[320px]">
          <path d="M375 250H0C0 250 31.5 200.5 96.5 186.5C161.5 172.5 187 218.5 251.5 204C316 189.5 375 92 375 92V250Z" fill="url(#paint2_linear)" fillOpacity="0.5"/>
          <path d="M375 250H112C112 250 148 221.5 207 207.5C266 193.5 289.5 235 344.5 210.5C399.5 186 375 125 375 125V250Z" fill="url(#paint3_linear)"/>
          <defs>
            <linearGradient id="paint2_linear" x1="375" y1="250" x2="0" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#AD1DEB" stopOpacity="0.3"/>
              <stop offset="1" stopColor="#6E72FC" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="paint3_linear" x1="375" y1="250" x2="112" y2="125" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A067FF"/>
              <stop offset="1" stopColor="#4184FF" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Main Content (Centered Logo) */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <img 
            src="/zenivio-logo.png" 
            alt="Zenivio Logo" 
            className="w-56 h-auto object-contain drop-shadow-md"
          />
        </motion.div>
      </div>

      {/* Loader (Anchored to bottom) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-[15%] w-full flex flex-col items-center z-10"
      >
        <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
        <p className="text-gray-500 text-sm font-medium">Loading...</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
