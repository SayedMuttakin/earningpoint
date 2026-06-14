import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── 3D-style SVG Icons ────────────────────────────────────────────────────────

const NewsIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Glow platform */}
    <ellipse cx="100" cy="168" rx="65" ry="14" fill="url(#newsGlow)" opacity="0.5"/>
    {/* Shadow beneath */}
    <ellipse cx="100" cy="172" rx="50" ry="8" fill="#7C3AED" opacity="0.15"/>
    {/* Main newspaper body */}
    <rect x="30" y="55" width="120" height="100" rx="10" fill="url(#newsPaper)"/>
    {/* Fold / top highlight */}
    <rect x="30" y="55" width="120" height="28" rx="10" fill="url(#newsHeader)"/>
    {/* "NEWS" text bar */}
    <rect x="40" y="62" width="56" height="14" rx="4" fill="white" opacity="0.9"/>
    <text x="46" y="73" fontFamily="Arial" fontSize="9" fontWeight="900" fill="#7C3AED">NEWS</text>
    {/* Lines */}
    <rect x="40" y="94" width="80" height="5" rx="2.5" fill="white" opacity="0.7"/>
    <rect x="40" y="106" width="60" height="4" rx="2" fill="white" opacity="0.5"/>
    <rect x="40" y="116" width="70" height="4" rx="2" fill="white" opacity="0.5"/>
    <rect x="40" y="126" width="50" height="4" rx="2" fill="white" opacity="0.4"/>
    <rect x="40" y="136" width="65" height="4" rx="2" fill="white" opacity="0.4"/>
    {/* Floating sparkles */}
    <circle cx="162" cy="70" r="6" fill="#C4B5FD" opacity="0.8"/>
    <circle cx="152" cy="52" r="4" fill="#A78BFA" opacity="0.6"/>
    <circle cx="38" cy="50" r="5" fill="#DDD6FE" opacity="0.7"/>
    {/* Star accent */}
    <path d="M170 110 L172 104 L174 110 L180 110 L175 114 L177 120 L172 116 L167 120 L169 114 L164 110 Z" fill="#C4B5FD" opacity="0.7"/>
    <defs>
      <linearGradient id="newsPaper" x1="30" y1="55" x2="150" y2="155" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#6D28D9"/>
      </linearGradient>
      <linearGradient id="newsHeader" x1="30" y1="55" x2="150" y2="83" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
      <radialGradient id="newsGlow" cx="50%" cy="50%" r="50%">
        <stop stopColor="#A855F7" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="100" cy="168" rx="65" ry="14" fill="url(#chatGlow)" opacity="0.5"/>
    <ellipse cx="100" cy="172" rx="50" ry="8" fill="#7C3AED" opacity="0.15"/>
    {/* Main chat bubble */}
    <rect x="28" y="50" width="110" height="80" rx="18" fill="url(#chatBubble)"/>
    {/* Bubble tail */}
    <path d="M45 130 L35 148 L65 132 Z" fill="url(#chatBubble)"/>
    {/* Lines in chat */}
    <rect x="44" y="72" width="78" height="7" rx="3.5" fill="white" opacity="0.8"/>
    <rect x="44" y="86" width="55" height="6" rx="3" fill="white" opacity="0.6"/>
    <rect x="44" y="98" width="68" height="6" rx="3" fill="white" opacity="0.6"/>
    {/* Pencil */}
    <rect x="118" y="80" width="18" height="60" rx="5" fill="url(#pencilBody)" transform="rotate(-35 118 80)"/>
    <polygon points="125,138 135,138 130,155" fill="#FCD34D"/>
    <rect x="118" y="78" width="18" height="12" rx="3" fill="#E5E7EB" transform="rotate(-35 118 78)"/>
    {/* Sparkles */}
    <circle cx="35" cy="55" r="6" fill="#C4B5FD" opacity="0.8"/>
    <circle cx="165" cy="65" r="4" fill="#DDD6FE" opacity="0.7"/>
    <circle cx="158" cy="145" r="5" fill="#A78BFA" opacity="0.5"/>
    <defs>
      <linearGradient id="chatBubble" x1="28" y1="50" x2="138" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#6D28D9"/>
      </linearGradient>
      <linearGradient id="pencilBody" x1="0" y1="0" x2="18" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B"/>
        <stop offset="1" stopColor="#D97706"/>
      </linearGradient>
      <radialGradient id="chatGlow" cx="50%" cy="50%" r="50%">
        <stop stopColor="#A855F7" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="100" cy="168" rx="65" ry="14" fill="url(#walletGlow)" opacity="0.5"/>
    <ellipse cx="100" cy="172" rx="50" ry="8" fill="#7C3AED" opacity="0.15"/>
    {/* Wallet body */}
    <rect x="30" y="80" width="130" height="80" rx="14" fill="url(#walletBody)"/>
    {/* Wallet top flap */}
    <rect x="30" y="80" width="130" height="30" rx="14" fill="url(#walletFlap)"/>
    {/* Coin slot area */}
    <rect x="115" y="92" width="35" height="22" rx="11" fill="url(#coinSlot)"/>
    <circle cx="132" cy="103" r="6" fill="#FCD34D"/>
    {/* Dollar sign */}
    <text x="129" y="107" fontFamily="Arial" fontSize="9" fontWeight="900" fill="#D97706">$</text>
    {/* Coins floating */}
    <circle cx="80" cy="48" r="18" fill="url(#coin1)"/>
    <text x="72" y="53" fontFamily="Arial" fontSize="14" fontWeight="900" fill="#92400E">$</text>
    <circle cx="115" cy="38" r="14" fill="url(#coin2)"/>
    <text x="108" y="43" fontFamily="Arial" fontSize="11" fontWeight="900" fill="#92400E">$</text>
    <circle cx="55" cy="62" r="11" fill="url(#coin3)"/>
    <text x="49" y="67" fontFamily="Arial" fontSize="9" fontWeight="900" fill="#92400E">$</text>
    {/* Sparkles */}
    <circle cx="155" cy="70" r="5" fill="#C4B5FD" opacity="0.8"/>
    <circle cx="165" cy="110" r="4" fill="#DDD6FE" opacity="0.6"/>
    <defs>
      <linearGradient id="walletBody" x1="30" y1="80" x2="160" y2="160" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED"/>
        <stop offset="1" stopColor="#5B21B6"/>
      </linearGradient>
      <linearGradient id="walletFlap" x1="30" y1="80" x2="160" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
      <linearGradient id="coinSlot" x1="115" y1="92" x2="150" y2="114" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4C1D95"/>
        <stop offset="1" stopColor="#3B1580"/>
      </linearGradient>
      <linearGradient id="coin1" x1="62" y1="30" x2="98" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
      <linearGradient id="coin2" x1="101" y1="24" x2="129" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
      <linearGradient id="coin3" x1="44" y1="51" x2="66" y2="73" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
      <radialGradient id="walletGlow" cx="50%" cy="50%" r="50%">
        <stop stopColor="#A855F7" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="100" cy="168" rx="65" ry="14" fill="url(#cartGlow)" opacity="0.5"/>
    <ellipse cx="100" cy="172" rx="50" ry="8" fill="#7C3AED" opacity="0.15"/>
    {/* Cart body */}
    <path d="M35 65 L55 65 L72 135 L155 135 L168 85 L55 85" stroke="url(#cartStroke)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M55 85 L168 85 L155 135 L72 135 Z" fill="url(#cartBody)"/>
    {/* Shopping bags on top */}
    <rect x="90" y="28" width="28" height="40" rx="5" fill="url(#bag1)"/>
    <path d="M96 28 Q96 20 104 20 Q112 20 112 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <rect x="120" y="35" width="24" height="34" rx="4" fill="url(#bag2)"/>
    <path d="M125 35 Q125 28 132 28 Q139 28 139 35" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Wheels */}
    <circle cx="88" cy="148" r="10" fill="url(#wheel)"/>
    <circle cx="88" cy="148" r="4" fill="white" opacity="0.8"/>
    <circle cx="140" cy="148" r="10" fill="url(#wheel)"/>
    <circle cx="140" cy="148" r="4" fill="white" opacity="0.8"/>
    {/* Sparkles */}
    <circle cx="38" cy="52" r="5" fill="#C4B5FD" opacity="0.8"/>
    <circle cx="170" cy="55" r="4" fill="#DDD6FE" opacity="0.7"/>
    <defs>
      <linearGradient id="cartBody" x1="55" y1="85" x2="168" y2="135" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#6D28D9"/>
      </linearGradient>
      <linearGradient id="cartStroke" x1="35" y1="65" x2="168" y2="135" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED"/>
        <stop offset="1" stopColor="#5B21B6"/>
      </linearGradient>
      <linearGradient id="bag1" x1="90" y1="28" x2="118" y2="68" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
      <linearGradient id="bag2" x1="120" y1="35" x2="144" y2="69" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4B5FD"/>
        <stop offset="1" stopColor="#8B5CF6"/>
      </linearGradient>
      <linearGradient id="wheel" x1="78" y1="138" x2="98" y2="158" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED"/>
        <stop offset="1" stopColor="#4C1D95"/>
      </linearGradient>
      <radialGradient id="cartGlow" cx="50%" cy="50%" r="50%">
        <stop stopColor="#A855F7" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="100" cy="168" rx="65" ry="14" fill="url(#msgGlow)" opacity="0.5"/>
    <ellipse cx="100" cy="172" rx="50" ry="8" fill="#7C3AED" opacity="0.15"/>
    {/* Large bubble */}
    <rect x="28" y="48" width="100" height="70" rx="20" fill="url(#bubble1)"/>
    <path d="M48 118 L35 138 L70 120 Z" fill="url(#bubble1)"/>
    {/* Dots in large bubble */}
    <circle cx="58" cy="83" r="7" fill="white" opacity="0.9"/>
    <circle cx="78" cy="83" r="7" fill="white" opacity="0.9"/>
    <circle cx="98" cy="83" r="7" fill="white" opacity="0.9"/>
    {/* Small bubble */}
    <rect x="90" y="90" width="80" height="54" rx="16" fill="url(#bubble2)"/>
    <path d="M160 144 L170 158 L148 146 Z" fill="url(#bubble2)"/>
    {/* Dots in small bubble */}
    <circle cx="110" cy="117" r="5.5" fill="white" opacity="0.9"/>
    <circle cx="126" cy="117" r="5.5" fill="white" opacity="0.9"/>
    <circle cx="142" cy="117" r="5.5" fill="white" opacity="0.9"/>
    {/* Sparkles */}
    <circle cx="35" cy="44" r="6" fill="#C4B5FD" opacity="0.8"/>
    <circle cx="165" cy="50" r="4" fill="#DDD6FE" opacity="0.7"/>
    <circle cx="170" cy="80" r="5" fill="#A78BFA" opacity="0.5"/>
    <defs>
      <linearGradient id="bubble1" x1="28" y1="48" x2="128" y2="138" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#6D28D9"/>
      </linearGradient>
      <linearGradient id="bubble2" x1="90" y1="90" x2="170" y2="158" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
      <radialGradient id="msgGlow" cx="50%" cy="50%" r="50%">
        <stop stopColor="#A855F7" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

// ── Small bottom icon for each screen ──────────────────────────────────────

const NewsSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="2" y="3" width="20" height="18" rx="3" fill="#8B5CF6" opacity="0.15"/>
    <rect x="5" y="6" width="8" height="2" rx="1" fill="#7C3AED"/>
    <rect x="5" y="10" width="14" height="1.5" rx="0.75" fill="#8B5CF6" opacity="0.7"/>
    <rect x="5" y="13" width="10" height="1.5" rx="0.75" fill="#8B5CF6" opacity="0.7"/>
    <rect x="5" y="16" width="12" height="1.5" rx="0.75" fill="#8B5CF6" opacity="0.7"/>
  </svg>
);

const ChatSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#8B5CF6" opacity="0.15" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10h8M8 14h5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const WalletSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="2" y="7" width="20" height="14" rx="3" fill="#8B5CF6" opacity="0.15" stroke="#7C3AED" strokeWidth="1.5"/>
    <path d="M16 3H8a2 2 0 0 0-2 2v2" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="17" cy="14" r="2" fill="#7C3AED"/>
  </svg>
);

const CartSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M6 2 L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#8B5CF6" opacity="0.15" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MsgSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#8B5CF6" opacity="0.15" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="11" r="1" fill="#7C3AED"/>
    <circle cx="12" cy="11" r="1" fill="#7C3AED"/>
    <circle cx="15" cy="11" r="1" fill="#7C3AED"/>
  </svg>
);

// ── Slide data ────────────────────────────────────────────────────────────────
const slides = [
  {
    id: 'news',
    Icon: NewsIcon,
    SmallIcon: NewsSmallIcon,
    title: 'Stay Updated',
    subtitle: 'Get the latest news and updates from around the world.',
  },
  {
    id: 'chat',
    Icon: ChatIcon,
    SmallIcon: ChatSmallIcon,
    title: 'Share Your Thoughts',
    subtitle: 'Post your ideas, share stories and connect with real people.',
  },
  {
    id: 'wallet',
    Icon: WalletIcon,
    SmallIcon: WalletSmallIcon,
    title: 'Earn Rewards',
    subtitle: 'Complete tasks, invite friends and earn exciting rewards.',
  },
  {
    id: 'shop',
    Icon: CartIcon,
    SmallIcon: CartSmallIcon,
    title: 'Shop with Ease',
    subtitle: 'Explore products and shop your favorites in one place.',
  },
  {
    id: 'message',
    Icon: MessageIcon,
    SmallIcon: MsgSmallIcon,
    title: 'Chat Anytime',
    subtitle: 'Message, share and stay connected anytime, anywhere.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const OnboardingScreen = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const goTo = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const { Icon, SmallIcon, title, subtitle } = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #F5F0FF 0%, #FFFFFF 60%, #EDE9FE 100%)' }}
    >
      {/* ── Decorative blobs ── */}
      <div
        className="absolute top-[-60px] left-[-60px] w-[220px] h-[220px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[100px] right-[-40px] w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] left-[-80px] w-[160px] h-[160px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%)' }}
      />

      {/* ── Skip button ── */}
      <div className="flex justify-end px-6 pt-14 pb-2 z-10">
        {!isLast && (
          <button
            onClick={onComplete}
            className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95"
            style={{ color: '#7C3AED', background: 'rgba(124,58,237,0.08)' }}
          >
            Skip
          </button>
        )}
      </div>

      {/* ── Illustration area ── */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center w-full"
          >
            {/* Glowing circle platform */}
            <div className="relative flex items-center justify-center mb-6">
              {/* Outer glow ring */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute rounded-full"
                style={{
                  width: 240,
                  height: 240,
                  background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
                }}
              />
              {/* Inner glow */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute rounded-full"
                style={{
                  width: 190,
                  height: 190,
                  background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
                }}
              />
              {/* Icon container with float animation */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 170, height: 170 }}
              >
                <Icon />
              </motion.div>
            </div>

            {/* Small icon in circle */}
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full mb-6 shadow-sm"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1.5px solid rgba(139,92,246,0.2)' }}
            >
              <SmallIcon />
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#1E1B4B' }}>
              {title}
            </h2>
            <p className="text-sm text-center leading-relaxed px-4 max-w-xs" style={{ color: '#6B7280' }}>
              {subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="z-10 px-6 pb-10">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: idx === current ? 24 : 8,
                height: 8,
                background: idx === current
                  ? 'linear-gradient(90deg, #7C3AED, #A855F7)'
                  : 'rgba(167,139,250,0.3)',
              }}
            />
          ))}
        </div>

        {/* Button */}
        {isLast ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="w-full py-4 rounded-full font-bold text-white text-base shadow-lg active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
          >
            Get Started
          </motion.button>
        ) : (
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full font-bold text-base transition-all active:scale-[0.97] border-2"
            style={{
              color: '#7C3AED',
              borderColor: 'rgba(124,58,237,0.4)',
              background: 'transparent',
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
