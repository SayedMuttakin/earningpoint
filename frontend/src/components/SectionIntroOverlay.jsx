import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SectionIntroOverlay = ({ isOpen, onClose, section }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !section) return null;

  const {
    title,
    icon: IconComponent,
    color = 'from-blue-500 to-purple-600',
    description,
    reward,
    rewardLabel,
  } = section;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Main Content */}
        <div className="p-8 pt-12 pb-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer Ring Animation */}
            <div className="absolute w-48 h-48 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 animate-spin"
              style={{ animationDuration: '8s' }} />
            
            {/* Middle Ring Animation */}
            <div className="absolute w-40 h-40 rounded-full border-2 border-transparent bg-gradient-to-l from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-spin"
              style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
            
            {/* Inner Glow */}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/40 to-purple-500/40 blur-2xl animate-pulse" />
          </div>

          {/* Icon Container with Gradient Background */}
          <div className="relative z-10 mb-8 flex justify-center">
            <div
              className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${color} p-6 shadow-2xl flex items-center justify-center relative transform hover:scale-105 transition-transform duration-300 animate-bounce`}
              style={{ animationDelay: '0s', animationDuration: '2s' }}
            >
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-white/10 blur-xl" />
              
              {/* Icon */}
              <div className="relative z-10">
                {IconComponent && (
                  <IconComponent className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative z-10 text-center space-y-4">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {title}
            </h2>

            {/* Description */}
            {description && (
              <p className="text-base text-slate-300 leading-relaxed max-w-xs mx-auto">
                {description}
              </p>
            )}

            {/* Reward Section */}
            {reward && (
              <div className="pt-4 space-y-2">
                <div className="inline-block px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-black text-amber-400">
                      {reward}
                    </span>
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                      {rewardLabel || 'Coins'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Available for this activity
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          <div className="relative z-10 mt-10 w-full max-w-xs">
            <button
              onClick={() => {
                onClose();
                if (section?.onEnter) {
                  setTimeout(() => section.onEnter(), 300);
                }
              }}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-lg"
            >
              Let's Get Started
            </button>
          </div>

          {/* Decorative Bottom Line */}
          <div className="relative z-10 mt-8 w-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SectionIntroOverlay;
