import React from 'react';

// Custom Helper for unique gradients to prevent ID collisions
const GradientDef = ({ id, colors }) => (
  <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      {colors.map((color, index) => (
        <stop
          key={index}
          offset={`${(index / (colors.length - 1)) * 100}%`}
          stopColor={color}
        />
      ))}
    </linearGradient>
  </defs>
);

// 1. Daily Checkin Icon
export const DailyCheckinIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="dailyCheckinGrad" colors={["#34d399", "#059669"]} />
    <rect x="3" y="4" width="18" height="17" rx="4" fill="url(#dailyCheckinGrad)" />
    <path d="M3 9H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7" cy="6.5" r="1" fill="white" />
    <circle cx="17" cy="6.5" r="1" fill="white" />
    <rect x="7" y="12" width="10" height="6" rx="1" fill="white" fillOpacity="0.2" />
    <path d="M9.5 15L11 16.5L14.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 2. Mystery Box Icon
export const MysteryBoxIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="mysteryBoxGrad" colors={["#f43f5e", "#be123c"]} />
    <GradientDef id="mysteryRibbon" colors={["#fcd34d", "#f59e0b"]} />
    <rect x="4" y="8" width="16" height="12" rx="2" fill="url(#mysteryBoxGrad)" />
    <rect x="3" y="6" width="18" height="3" rx="1" fill="url(#mysteryBoxGrad)" />
    {/* Ribbon */}
    <rect x="10.5" y="6" width="3" height="14" fill="url(#mysteryRibbon)" />
    <path d="M12 6C10 3.5 7 4 7 4C7 4 8 7 12 6Z" fill="url(#mysteryRibbon)" />
    <path d="M12 6C14 3.5 17 4 17 4C17 4 16 7 12 6Z" fill="url(#mysteryRibbon)" />
    {/* Question mark details */}
    <path d="M10.5 12.5C10.5 11 12 11 12 12C12 13 10.5 13.5 10.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10.5" cy="16" r="0.75" fill="white" />
  </svg>
);

// 3. Weekly Missions Icon
export const WeeklyMissionsIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="weeklyMissionsGrad" colors={["#60a5fa", "#2563eb"]} />
    <rect x="4" y="3" width="16" height="18" rx="3" fill="url(#weeklyMissionsGrad)" />
    {/* Clipboard clip */}
    <path d="M9 3H15V5C15 5.5 14.5 6 14 6H10C9.5 6 9 5.5 9 5V3Z" fill="white" fillOpacity="0.8" />
    {/* Tasks */}
    <path d="M8 10H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 14H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 18H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="14" r="1.5" fill="#34d399" />
    <circle cx="14" cy="18" r="1.5" fill="#34d399" />
  </svg>
);

// 4. Refer & Earn Icon
export const ReferEarnIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="referGrad" colors={["#fbbf24", "#d97706"]} />
    {/* Background Glow Ring */}
    <circle cx="12" cy="12" r="10" stroke="url(#referGrad)" strokeWidth="1" strokeDasharray="3 3" />
    {/* Center User */}
    <circle cx="12" cy="9" r="3" fill="url(#referGrad)" />
    <path d="M6 18C6 15.5 8.5 14 12 14C15.5 14 18 15.5 18 18" stroke="url(#referGrad)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Mini Users */}
    <circle cx="5" cy="13" r="1.5" fill="url(#referGrad)" fillOpacity="0.7" />
    <circle cx="19" cy="13" r="1.5" fill="url(#referGrad)" fillOpacity="0.7" />
    <path d="M17 19.5C17 18.5 18 17.5 19.5 17.5" stroke="url(#referGrad)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 19.5C7 18.5 6 17.5 4.5 17.5" stroke="url(#referGrad)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 5. Wallet Icon
export const WalletIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="walletGrad" colors={["#3b82f6", "#1d4ed8"]} />
    <rect x="3" y="6" width="18" height="13" rx="3" fill="url(#walletGrad)" />
    <path d="M3 9.5H21" stroke="white" strokeWidth="1.5" />
    {/* Clasp */}
    <rect x="15" y="11" width="6" height="4" rx="1.5" fill="#f59e0b" />
    <circle cx="17.5" cy="13" r="0.75" fill="white" />
    {/* Floating Coin */}
    <circle cx="12" cy="5" r="2" fill="#fbbf24" />
    <path d="M12 4V6" stroke="white" strokeWidth="0.75" />
  </svg>
);

// 6. History Icon
export const HistoryIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="historyGrad" colors={["#8b5cf6", "#6d28d9"]} />
    <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12" stroke="url(#historyGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 7V12L15 14" stroke="url(#historyGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Arrowhead */}
    <path d="M2 12.5L3.5 10L6 12" stroke="url(#historyGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Tutorial Icon
export const TutorialIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="tutorialGrad" colors={["#10b981", "#047857"]} />
    <rect x="4" y="3" width="16" height="18" rx="2" fill="url(#tutorialGrad)" />
    {/* Pages detail */}
    <line x1="7" y1="7" x2="17" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="11" x2="14" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" />
    {/* Play symbol on the book */}
    <polygon points="10,14 15,16.5 10,19" fill="#fbbf24" />
  </svg>
);

// 8. Articles Icon
export const ArticlesIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="articlesGrad" colors={["#60a5fa", "#3b82f6"]} />
    <rect x="3" y="3" width="18" height="18" rx="2" fill="white" stroke="url(#articlesGrad)" strokeWidth="2" />
    <rect x="6" y="6" width="12" height="4" fill="url(#articlesGrad)" rx="1" />
    {/* Newspaper columns */}
    <line x1="6" y1="13" x2="12" y2="13" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="6" y1="16" x2="10" y2="16" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="14" y1="13" x2="18" y2="13" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="14" y1="16" x2="17" y2="16" stroke="#94a3b8" strokeWidth="1.5" />
  </svg>
);

// 9. Videos Icon
export const VideosIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="videosGrad" colors={["#ec4899", "#d946ef"]} />
    <rect x="3" y="4" width="18" height="13" rx="3" fill="url(#videosGrad)" />
    {/* Video stand */}
    <path d="M8 20H16" stroke="url(#videosGrad)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 17V20" stroke="url(#videosGrad)" strokeWidth="2" />
    {/* Play Button inside screen */}
    <polygon points="10,8 15,10.5 10,13" fill="white" />
  </svg>
);

// 10. Games Icon
export const GamesIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="gamesGrad" colors={["#34d399", "#047857"]} />
    <rect x="2" y="6" width="20" height="12" rx="4" fill="url(#gamesGrad)" />
    {/* D-Pad */}
    <path d="M6 12H10M8 10V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    {/* Action buttons */}
    <circle cx="15" cy="11" r="1" fill="white" />
    <circle cx="17" cy="13" r="1" fill="white" />
    <circle cx="15" cy="13" r="0.75" fill="white" fillOpacity="0.5" />
    <circle cx="17" cy="11" r="0.75" fill="white" fillOpacity="0.5" />
  </svg>
);

// 11. Fortune Wheel Icon
export const FortuneWheelIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="wheelGrad" colors={["#f59e0b", "#d97706"]} />
    <circle cx="12" cy="12" r="9" fill="url(#wheelGrad)" stroke="white" strokeWidth="1.5" />
    {/* Wheel spokes */}
    <line x1="12" y1="3" x2="12" y2="21" stroke="white" strokeWidth="1.5" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.5" />
    <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" stroke="white" strokeWidth="1" />
    <line x1="5.64" y1="18.36" x2="18.36" y2="5.64" stroke="white" strokeWidth="1" />
    <circle cx="12" cy="12" r="2.5" fill="white" />
    {/* Pointer */}
    <path d="M12 2L14 5H10L12 2Z" fill="#ef4444" />
  </svg>
);

// 12. View Ads Icon
export const ViewAdsIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="viewAdsGrad" colors={["#38bdf8", "#0369a1"]} />
    <rect x="3" y="4" width="18" height="12" rx="2" fill="url(#viewAdsGrad)" />
    <path d="M7 20H17" stroke="url(#viewAdsGrad)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 16V20" stroke="url(#viewAdsGrad)" strokeWidth="2" />
    {/* Megaphone or Promo graphic */}
    <path d="M8 9.5H11L14 7.5V12.5L11 10.5H8V9.5Z" fill="white" />
    <path d="M16 8.5C16.5 9.1 16.5 9.9 16 10.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// 13. Scratch Card Icon
export const ScratchCardIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="scratchGrad" colors={["#ec4899", "#be185d"]} />
    <rect x="3" y="4" width="18" height="16" rx="2" fill="url(#scratchGrad)" />
    {/* Scratched area pattern */}
    <path d="M5 8C8 8 9 6 12 6C15 6 16 8 19 8" stroke="white" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
    <path d="M5 12C8 12 9 10 12 10C15 10 16 12 19 12" stroke="white" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
    {/* Golden star */}
    <polygon points="12,11 13.5,14 16.5,14 14,16 15,19 12,17 9,19 10,16 7.5,14 10.5,14" fill="#fbbf24" />
  </svg>
);

// 14. Quizzes Icon
export const QuizzesIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="quizGrad" colors={["#a78bfa", "#7c3aed"]} />
    {/* Lightbulb shape */}
    <path d="M9 18H15V19C15 20.1 14.1 21 13 21H11C9.9 21 9 20.1 9 19V18Z" fill="url(#quizGrad)" />
    <path d="M12 3C7.58172 3 4 6.58172 4 11C4 13.5 5.5 15.5 7.5 16.5L8.5 18H15.5L16.5 16.5C18.5 15.5 20 13.5 20 11C20 6.58172 16.4183 3 12 3Z" fill="url(#quizGrad)" />
    {/* Question mark detail */}
    <path d="M11 8.5C11 7.5 12 7 12.5 7C13 7 13.5 7.5 13.5 8C13.5 9 12 9.5 12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12.5" r="0.75" fill="white" />
  </svg>
);

// 15. Daily Quiz Icon
export const DailyQuizIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="dailyQuizGrad" colors={["#f59e0b", "#ea580c"]} />
    <rect x="3" y="4" width="18" height="17" rx="3" fill="url(#dailyQuizGrad)" />
    <path d="M3 9H21" stroke="white" strokeWidth="1.5" />
    {/* Question mark inside calendar */}
    <path d="M11.5 12.5C11.5 11.5 12.5 11 13 11C13.5 11 14 11.5 14 12C14 13 12.5 13.5 12.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12.5" cy="16.5" r="0.75" fill="white" />
    <circle cx="7" cy="6.5" r="0.75" fill="white" />
    <circle cx="17" cy="6.5" r="0.75" fill="white" />
  </svg>
);

// 16. Math Quiz Icon
export const MathQuizIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="mathQuizGrad" colors={["#3b82f6", "#1e3a8a"]} />
    <rect x="3" y="4" width="18" height="16" rx="2" fill="url(#mathQuizGrad)" />
    {/* Math symbols */}
    <path d="M6 10H10M8 8V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 10H18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    {/* Multiplication cross */}
    <path d="M6 15L9 18M9 15L6 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    {/* Equals sign */}
    <path d="M14 15H18M14 17H18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 17. Binary Quiz Icon
export const BinaryQuizIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="binaryGrad" colors={["#8b5cf6", "#ec4899"]} />
    <rect x="3" y="4" width="18" height="16" rx="3" fill="url(#binaryGrad)" />
    {/* 0 and 1 typography */}
    <path d="M6 8C6 7 7 6 8 6C9 6 10 7 10 8V11C10 12 9 13 8 13C7 13 6 12 6 11V8Z" stroke="white" strokeWidth="1.5" />
    <path d="M15 6.5V13M13 8.5L15 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 15.5V20" stroke="white" strokeWidth="1.5" />
    <path d="M14 17C14 16 15 15 16 15C17 15 18 16 18 17V19C18 20 17 21 16 21C15 21 14 20 14 19V17Z" stroke="white" strokeWidth="1.5" />
  </svg>
);

// 18. Word Quiz Icon
export const WordQuizIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="wordQuizGrad" colors={["#10b981", "#064e3b"]} />
    <rect x="3" y="4" width="18" height="16" rx="2" fill="url(#wordQuizGrad)" />
    {/* A B C blocks */}
    <rect x="6" y="8" width="5" height="7" rx="1" stroke="white" strokeWidth="1" />
    <path d="M8.5 9.5L7.5 13.5M8.5 9.5L9.5 13.5M8.5 9.5V11H7.5" stroke="white" strokeWidth="1" />
    <rect x="13" y="8" width="5" height="7" rx="1" stroke="white" strokeWidth="1" />
    <path d="M14.5 9.5V13.5H16.5C16.5 13.5 17 13 17 12C17 11 16 11.5 15.5 11.5M14.5 9.5H16.5C16.5 9.5 17 10 17 10.5C17 11 16.5 11.5 15.5 11.5" stroke="white" strokeWidth="1" />
  </svg>
);

// 19. General Knowledge Icon
export const GkQuizIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="gkGrad" colors={["#f59e0b", "#ea580c"]} />
    <circle cx="12" cy="12" r="8" fill="none" stroke="url(#gkGrad)" strokeWidth="2" />
    {/* Latitude & Longitude lines */}
    <ellipse cx="12" cy="12" rx="4" ry="8" fill="none" stroke="url(#gkGrad)" strokeWidth="1.5" />
    <line x1="4" y1="12" x2="20" y2="12" stroke="url(#gkGrad)" strokeWidth="1.5" />
    {/* Small Magnifying Glass */}
    <circle cx="17" cy="17" r="2.5" fill="white" stroke="url(#gkGrad)" strokeWidth="1.5" />
    <line x1="19" y1="19" x2="21" y2="21" stroke="url(#gkGrad)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 20. YouTube Icon
export const YouTubeIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="ytGrad" colors={["#ff0000", "#cc0000"]} />
    <rect x="2" y="5" width="20" height="14" rx="4" fill="url(#ytGrad)" />
    <polygon points="10,9 16,12 10,15" fill="white" />
  </svg>
);

// 21. TikTok Icon
export const TikTokIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="tiktokGrad" colors={["#010101", "#121212"]} />
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#tiktokGrad)" />
    {/* Music Note with offset Cyan and Red shadows */}
    <path d="M16 8C14.5 8 13.5 7 13.5 5.5H11V14.5C11 16 9.8 17.2 8.3 17.2C6.8 17.2 5.5 16 5.5 14.5C5.5 13 6.8 11.8 8.3 11.8V9.5C5.5 9.5 3.2 11.7 3.2 14.5C3.2 17.3 5.5 19.5 8.3 19.5C11.1 19.5 13.3 17.3 13.3 14.5V9.8C14.5 10.7 16 11.2 17.5 11.2V9C16.7 9 16 8.5 16 8Z" fill="#25f4ee" />
    <path d="M15.8 7.8C14.3 7.8 13.3 6.8 13.3 5.3H10.8V14.3C10.8 15.8 9.6 17 8.1 17C6.6 17 5.3 15.8 5.3 14.3C5.3 12.8 6.6 11.6 8.1 11.6V9.3C5.3 9.3 3 11.5 3 14.3C3 17.1 5.3 19.3 8.1 19.3C10.9 19.3 13.1 17.1 13.1 14.3V9.6C14.3 10.5 15.8 11 17.3 11V8.8C16.5 8.8 15.8 8.3 15.8 7.8Z" fill="#fe2c55" />
  </svg>
);

// 22. Facebook Icon
export const FacebookIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="fbGrad" colors={["#1877f2", "#0f52ba"]} />
    <rect x="2" y="2" width="20" height="20" rx="4" fill="url(#fbGrad)" />
    <path d="M16 11.5H13.5V20H10V11.5H8.5V8.5H10V6.7C10 4.6 11.3 3.5 13.2 3.5C14.1 3.5 14.9 3.6 15.1 3.6V5.9H13.8C12.8 5.9 12.6 6.4 12.6 7.1V8.5H15.6L16 11.5Z" fill="white" />
  </svg>
);

// 23. Reward Video Icon
export const RewardVideoIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="rewardVidGrad" colors={["#ec4899", "#9d174d"]} />
    <rect x="3" y="4" width="18" height="13" rx="3" fill="url(#rewardVidGrad)" />
    <polygon points="10,8 15,10.5 10,13" fill="white" />
    {/* Floating Coin overlay */}
    <circle cx="18" cy="15" r="3" fill="#fbbf24" stroke="white" strokeWidth="1" />
    <path d="M18 13.5V16.5" stroke="white" strokeWidth="0.75" />
  </svg>
);

// 24. Interstitial Ad Icon
export const InterstitialAdIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="interGrad" colors={["#3b82f6", "#1d4ed8"]} />
    <rect x="4" y="5" width="16" height="14" rx="2" fill="url(#interGrad)" stroke="white" strokeWidth="1.5" />
    {/* Close button indicator */}
    <circle cx="17" cy="8" r="1.5" fill="#ef4444" />
    {/* Lightning Bolt */}
    <path d="M11 7L7 12H11L10 16L14 11H10L11 7Z" fill="#fbbf24" />
  </svg>
);

// 25. Native Ad Click Icon
export const NativeAdClickIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="nativeGrad" colors={["#6366f1", "#4f46e5"]} />
    <rect x="3" y="4" width="18" height="12" rx="2" fill="url(#nativeGrad)" />
    <rect x="5" y="6" width="7" height="4" fill="white" fillOpacity="0.2" rx="0.5" />
    <line x1="5" y1="12" x2="14" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    {/* Cursor hand clicking */}
    <path d="M15 12L17.5 14.5L16.2 16.2L13.8 13.8M15 12V16.5" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 26. Bonus Ad Icon
export const BonusAdIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="bonusGrad" colors={["#fbbf24", "#ea580c"]} />
    <rect x="4" y="8" width="16" height="12" rx="2" fill="url(#bonusGrad)" />
    <rect x="3" y="6" width="18" height="3" rx="1" fill="url(#bonusGrad)" />
    {/* Star ribbon */}
    <polygon points="12,10 13.5,13 16.5,13 14,15 15,18 12,16 9,18 10,15 7.5,13 10.5,13" fill="white" />
  </svg>
);

// 27. Hourly Ad Icon
export const HourlyAdIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="hourlyGrad" colors={["#0d9488", "#115e59"]} />
    <path d="M6 4H18M7 4L11 9.5V14.5L7 20M17 4L13 9.5V14.5L17 20M6 20H18" stroke="url(#hourlyGrad)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Falling Sand */}
    <circle cx="12" cy="7" r="1" fill="#fbbf24" />
    <circle cx="12" cy="12" r="1.5" fill="#fbbf24" />
    <circle cx="12" cy="17" r="2.5" fill="#fbbf24" />
  </svg>
);

// 28. Meta Icon
export const MetaIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="metaGrad" colors={["#a855f7", "#6366f1"]} />
    {/* Infinity logo */}
    <path d="M7.8 8.5C5.8 8.5 4 10.1 4 12C4 13.9 5.8 15.5 7.8 15.5C9.5 15.5 10.8 14.5 12 13C13.2 14.5 14.5 15.5 16.2 15.5C18.2 15.5 20 13.9 20 12C20 10.1 18.2 8.5 16.2 8.5C14.5 8.5 13.2 9.5 12 11C10.8 9.5 9.5 8.5 7.8 8.5Z" stroke="url(#metaGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 29. Surprise Bonus Icon
export const SurpriseBonusIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="surpriseGrad" colors={["#f43f5e", "#db2777"]} />
    {/* Exploding party popper */}
    <path d="M4 19L11 12L12 13L5 20L4 19Z" fill="url(#surpriseGrad)" />
    <path d="M8 15L13 10L14 11L9 16L8 15Z" fill="url(#surpriseGrad)" />
    {/* Sparkles */}
    <path d="M15 6L16 4L17 6L19 7L17 8L16 10L15 8L13 7L15 6Z" fill="#fbbf24" />
    <circle cx="11" cy="6" r="1.5" fill="#38bdf8" />
    <circle cx="18" cy="13" r="1" fill="#34d399" />
  </svg>
);

// 30. Rik Survey Icon
export const RikSurveyIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="rikGrad" colors={["#38bdf8", "#2563eb"]} />
    <rect x="4" y="3" width="16" height="18" rx="2" fill="url(#rikGrad)" />
    <rect x="8" y="2" width="8" height="3" rx="1" fill="white" fillOpacity="0.8" />
    {/* Checked survey lists */}
    <circle cx="8" cy="9" r="1.5" fill="white" />
    <path d="M12 9H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="14" r="1.5" fill="white" />
    <path d="M12 14H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 31. Web Reg Icon
export const WebRegIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="webRegGrad" colors={["#8b5cf6", "#4c1d95"]} />
    <rect x="3" y="4" width="18" height="15" rx="3" fill="url(#webRegGrad)" />
    <circle cx="6" cy="7" r="0.75" fill="white" />
    <circle cx="8" cy="7" r="0.75" fill="white" />
    {/* Layout box */}
    <rect x="6" y="10" width="12" height="6" fill="white" fillOpacity="0.2" rx="1" />
    {/* Check mark inside layout */}
    <path d="M9.5 13L11 14.5L14.5 11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 32. Email Submit Icon
export const EmailSubmitIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="emailGrad" colors={["#fb923c", "#ea580c"]} />
    <rect x="3" y="5" width="18" height="14" rx="2" fill="url(#emailGrad)" />
    {/* Sealed line */}
    <path d="M3 6.5L12 12.5L21 6.5" stroke="white" strokeWidth="1.5" />
    {/* Outgoing arrow plane */}
    <path d="M18 13.5L22 10.5L15 11L18 13.5Z" fill="#fbbf24" />
  </svg>
);

// 33. App Install Icon
export const AppInstallIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="appGrad" colors={["#34d399", "#059669"]} />
    <rect x="6" y="3" width="12" height="18" rx="3" fill="url(#appGrad)" stroke="white" strokeWidth="1.5" />
    <circle cx="12" cy="18" r="1" fill="white" />
    {/* Download Arrow */}
    <path d="M12 7V13M12 13L9.5 10.5M12 13L14.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 34. Affiliate Market Icon
export const AffiliateMarketIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="affGrad" colors={["#fbbf24", "#d97706"]} />
    <path d="M6 9H18L19 20H5L6 9Z" fill="url(#affGrad)" />
    {/* Bag handles */}
    <path d="M9 9C9 6.5 10 4.5 12 4.5C14 4.5 15 6.5 15 9" stroke="url(#affGrad)" strokeWidth="2" />
    {/* Dollar symbol detail */}
    <path d="M12 12V17M10.5 13.5H13C13.5 13.5 14 14 14 14.5C14 15 13.5 15.5 13 15.5H11C10.5 15.5 10 15 10 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 35. Trial Signup Icon
export const TrialSignupIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDef id="trialGrad" colors={["#f43f5e", "#db2777"]} />
    {/* Key unlocking something */}
    <circle cx="9" cy="12" r="3.5" stroke="url(#trialGrad)" strokeWidth="2.5" />
    <path d="M12.5 12H19.5V15.5M16.5 12V14.5" stroke="url(#trialGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
