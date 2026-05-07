import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const screens = [
  {
    id: 'intro',
    image: '/zenivio-logo.png',
    title: 'All you need,',
    highlight: 'All in one',
    suffix: ' place.',
    type: 'intro'
  },
  {
    id: 'earn',
    image: '/onboarding-wallet.png',
    badge: '01',
    title: 'Earn',
    highlight: 'More',
    subtitle: 'Explore multiple ways to earn and grow every day.',
    type: 'feature'
  },
  {
    id: 'inform',
    image: '/onboarding-news.png',
    badge: '02',
    title: 'Stay',
    highlight: 'Informed',
    subtitle: 'Read trending news and updates from your world.',
    type: 'feature'
  },
  {
    id: 'create',
    image: '/onboarding-palette.png',
    badge: '03',
    title: 'Create',
    highlight: 'Freely',
    subtitle: 'Unleash your creativity with our powerful canvas.',
    type: 'feature'
  },
  {
    id: 'outro',
    image: '/zenivio-logo.png',
    title: 'One App.',
    highlight: 'Endless Possibilities.',
    type: 'outro'
  }
];

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentScreen = screens[currentIndex];

  useEffect(() => {
    if (currentScreen.type === 'outro') return; // Do not auto-advance the final screen
    
    const timer = setTimeout(() => {
      handleNext();
    }, 4000); // Auto-advance every 4 seconds
    
    return () => clearTimeout(timer);
  }, [currentIndex, currentScreen.type]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden selection:bg-blue-100">
      {/* Decorative Wavy Background for Intro/Outro */}
      {(currentScreen.type === 'intro' || currentScreen.type === 'outro') && (
        <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none opacity-40">
           <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
             <path fill="url(#grad)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,138.7C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             <defs>
               <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style={{stopColor: '#c4b5fd', stopOpacity: 1}} />
                 <stop offset="100%" style={{stopColor: '#93c5fd', stopOpacity: 1}} />
               </linearGradient>
             </defs>
           </svg>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center w-full max-w-sm text-center"
          >


            {/* Illustration/Logo */}
            <div className={`mb-10 flex items-center justify-center ${currentScreen.type === 'intro' || currentScreen.type === 'outro' ? 'h-48' : 'h-64'}`}>
              <motion.img 
                src={currentScreen.image} 
                alt="Onboarding Illustration" 
                animate={currentScreen.type === 'feature' ? { y: [0, -15, 0] } : {}}
                transition={currentScreen.type === 'feature' ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                className={`max-w-full max-h-full object-contain mix-blend-multiply contrast-125 brightness-110 ${currentScreen.type === 'intro' || currentScreen.type === 'outro' ? 'w-40' : 'w-64'}`}
              />
            </div>

            {/* Typography */}
            {currentScreen.type === 'intro' && (
              <div className="mt-8">
                <h1 className="text-2xl font-medium text-slate-800 leading-snug">
                  {currentScreen.title} <br/>
                  <span className="text-blue-600 font-bold">{currentScreen.highlight}</span>
                  {currentScreen.suffix}
                </h1>
              </div>
            )}

            {currentScreen.type === 'feature' && (
              <>
                <h1 className="text-2xl font-bold text-slate-800 mb-4">
                  {currentScreen.title} <span className="text-blue-600">{currentScreen.highlight}</span>
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  {currentScreen.subtitle}
                </p>
              </>
            )}

            {currentScreen.type === 'outro' && (
              <div className="mt-8">
                <h1 className="text-2xl font-medium text-slate-800 leading-snug">
                  {currentScreen.title} <br/>
                  <span className="text-blue-600 font-bold">{currentScreen.highlight}</span>
                </h1>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="h-24 px-6 flex items-center justify-between z-10 w-full max-w-md mx-auto relative">
        {currentScreen.type !== 'outro' ? (
          <>
            {/* Skip Button */}
            <button 
              onClick={handleSkip}
              className="text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors py-2 px-4 -ml-4"
            >
              Skip
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              {screens.slice(0, 4).map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all -mr-2"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          /* Get Started Button for final screen */
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center justify-center shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
