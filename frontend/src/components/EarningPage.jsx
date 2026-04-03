import React, { useState, useEffect, useRef } from 'react';
import { AdMobService } from '../utils/admob';
import { API_BASE } from '../config';
import { 
  Medal, Globe, Film, Gamepad2, 
  LifeBuoy, Gift, MonitorPlay, Users,
  Calculator, Binary, Type, HelpCircle,
  Wallet, History as HistoryIcon, BookOpen, ArrowLeft,
  Crown, Shield, Check, CalendarCheck, Newspaper, Video, Aperture, Search,
  TrendingUp, Star, ChevronRight, ChevronDown, Menu, Home, Bell, User, Settings, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gkQuizDB = [
  { id: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg', answer: 'Lionel Messi', options: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Angel Di Maria'] },
  { id: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg', answer: 'Cristiano Ronaldo', options: ['Lionel Messi', 'Cristiano Ronaldo', 'Gareth Bale', 'Karim Benzema'] },
  { id: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Virat_Kohli.jpg', answer: 'Virat Kohli', options: ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Steve Smith'] },
  { id: 4, image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/MS_Dhoni_%281%29.jpg', answer: 'MS Dhoni', options: ['Virat Kohli', 'MS Dhoni', 'Sachin Tendulkar', 'Gautam Gambhir'] },
  { id: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg', answer: 'Neymar Jr', options: ['Lionel Messi', 'Neymar Jr', 'Vinicius Jr', 'Rodrygo'] },
  { id: 6, image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Rohit_Sharma_with_the_T20_World_Cup.jpg', answer: 'Rohit Sharma', options: ['Shikhar Dhawan', 'KL Rahul', 'Rohit Sharma', 'Hardik Pandya'] },
  { id: 7, image: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Shakib_Al_Hasan_2018.jpg', answer: 'Shakib Al Hasan', options: ['Mashrafe Mortaza', 'Tamim Iqbal', 'Shakib Al Hasan', 'Mushfiqur Rahim'] },
  { id: 8, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Sachin-Tendulkar_%28cropped%29.jpg', answer: 'Sachin Tendulkar', options: ['Virender Sehwag', 'Sachin Tendulkar', 'Rahul Dravid', 'VVS Laxman'] },
  { id: 9, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Luka_Modri%C4%87_2022_%28cropped%29.jpg', answer: 'Luka Modric', options: ['Toni Kroos', 'Casemiro', 'Luka Modric', 'Federico Valverde'] },
  { id: 10, image: 'https://upload.wikimedia.org/wikipedia/commons/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg', answer: 'Kylian Mbappe', options: ['Ousmane Dembele', 'Kylian Mbappe', 'Antoine Griezmann', 'Olivier Giroud'] },
  { id: 11, image: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Babar_Azam.jpg', answer: 'Babar Azam', options: ['Babar Azam', 'Mohammad Rizwan', 'Shaheen Afridi', 'Fakhar Zaman'] },
  { id: 12, image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Kevin_De_Bruyne_201807092.jpg', answer: 'Kevin De Bruyne', options: ['Erling Haaland', 'Phil Foden', 'Bernardo Silva', 'Kevin De Bruyne'] }
];


import { countries } from '../utils/countries';

const ipPackages = [
  { id: 'month-1', name: '1 Month', price: 600, freeInfo: '7 Days free', label: '1 Month (+7 Days free)' },
  { id: 'month-3', name: '3 Month', price: 1300, freeInfo: '15 Days free', label: '3 Months (+15 Days free)' },
  { id: 'month-6', name: '6 Month', price: 2200, freeInfo: '1 Month free', label: '6 Months (+1 Month free)' },
  { id: 'year-1', name: '1 Year', price: 4200, freeInfo: '2 Month free', bestValue: true, label: '1 Year (+2 Months free)' },
];


const BigAdBanner = () => {
  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-[320px] h-[250px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 relative rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-sm">
        {/* AdMob Branding/UI mimic */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-slate-100 dark:bg-slate-800 flex items-center px-4 justify-between border-b border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Sponsored
          </span>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
             <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
             </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center p-6 pt-10 space-y-4">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-md flex items-center justify-center ring-4 ring-blue-500/10 transition-transform">
             <img src="https://img.icons8.com/fluency/96/google-logo.png" alt="Ad Mascot" className="w-12 h-12" />
          </div>
          
          <div className="space-y-1">
            <h4 className="text-base font-black text-blue-600 dark:text-blue-400 leading-none">Google AdMob Test</h4>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-bold leading-tight px-4 opacity-80">
              320x250 Medium Rectangle Ad Ready for Production Implementation.
            </p>
          </div>

          <button className="px-8 py-2.5 rounded-full bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
            AD UNIT ACTIVE
          </button>
        </div>

        {/* Ad Attribution */}
        <div className="absolute bottom-2 right-4 flex items-center gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
           <span className="text-[9px] font-black text-slate-400 tracking-tighter">Ads by Google</span>
           <img src="https://img.icons8.com/color/48/google-logo.png" className="w-3.5 h-3.5 grayscale" />
        </div>
      </div>
    </div>
  );
};

const EarningPage = ({ onReferralsClick, setActiveTab, onSuccess }) => {
  const [balance, setBalance] = React.useState(0);
  const [coins, setCoins] = React.useState(0);
  const [lifetimeCoins, setLifetimeCoins] = React.useState(0);
  const [showCoinsDetails, setShowCoinsDetails] = React.useState(false);
  const [showLevelView, setShowLevelView] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [activeEarningTab, setActiveEarningTab] = React.useState('rewards');
  const isAdLoading = useRef(false);

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [withdrawPhone, setWithdrawPhone] = React.useState('');
  const [withdrawMethod, setWithdrawMethod] = React.useState('');
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = React.useState(false);
  
  // Daily Checkin States
  const [showCheckinView, setShowCheckinView] = React.useState(false);
  const [showAdOverlay, setShowAdOverlay] = React.useState(false);
  const [adCountdown, setAdCountdown] = React.useState(40);
  const [canCloseAd, setCanCloseAd] = React.useState(false);
  const [checkinStatus, setCheckinStatus] = React.useState({ lastCheckin: null, count: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [adType, setAdType] = React.useState('daily'); // 'daily' or 'video'

  // Video Ads States
  const [showVideoView, setShowVideoView] = React.useState(false);
  const [videoStatus, setVideoStatus] = React.useState({ lastVideoDate: null, count: 0 });
  const [viewAdsStatus, setViewAdsStatus] = React.useState({ lastAdDate: null, count: 0 });
  const [videoType, setVideoType] = React.useState('video'); // 'video' or 'view_ads'

  // Fortune Wheel States
  const [showWheelView, setShowWheelView] = React.useState(false);
  const [wheelStatus, setWheelStatus] = React.useState({ lastSpinDate: null, count: 0 });
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [spinReward, setSpinReward] = React.useState(null);

  // Scratch Card States
  const [showScratchView, setShowScratchView] = React.useState(false);
  const [scratchStatus, setScratchStatus] = React.useState({ lastScratchDate: null, count: 0 });
  const [activeScratchCard, setActiveScratchCard] = React.useState(null); // { i, cardNum, hiddenMessage, isRevealed }

  // Games State
  const [showGamesView, setShowGamesView] = React.useState(false);

  // Quiz States
  const [showQuizSelection, setShowQuizSelection] = React.useState(false);
  const [showQuizView, setShowQuizView] = React.useState(false);
  const [quizType, setQuizType] = React.useState('math');
  const [quizStatus, setQuizStatus] = React.useState({ lastQuizDate: null, count: 0 });
  const [quizQuestion, setQuizQuestion] = React.useState(null);
  const [quizSelected, setQuizSelected] = React.useState(null);
  const [quizAnswered, setQuizAnswered] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState(0);
  const [quizTimer, setQuizTimer] = React.useState(30);
  const [quizTimerActive, setQuizTimerActive] = React.useState(false);

  // GK Quiz States
  const [showGkQuizView, setShowGkQuizView] = React.useState(false);
  const [gkQuizQuestions, setGkQuizQuestions] = React.useState([]);
  const [currentGkIndex, setCurrentGkIndex] = React.useState(0);
  const [gkQuizScore, setGkQuizScore] = React.useState(0);
  const [gkSelected, setGkSelected] = React.useState(null);
  const [gkAnswered, setGkAnswered] = React.useState(false);

  // Article States
  const [showArticleView, setShowArticleView] = React.useState(false);
  const [articleStep, setArticleStep] = React.useState(1);

  // Custom Ad Simulators (Level 3-5)
  const [showInterstitialAd, setShowInterstitialAd] = React.useState(false);
  const [showNativeAd, setShowNativeAd] = React.useState(false);
  const [showOfferwallAd, setShowOfferwallAd] = React.useState(false);
  const [currentAdInfo, setCurrentAdInfo] = React.useState({ name: '', type: '', coins: 0, time: 0 });

  // Multi-Ad Sub-View State (Level 3 & Level 4 options — 5 ads each)
  const [showMultiAdView, setShowMultiAdView] = React.useState(false);
  const [multiAdConfig, setMultiAdConfig] = React.useState(null); // { key, name, adType, coins, logo, color, ads[] }

  // Helper: get today's count for a multi-ad option key from localStorage
  const getMultiAdCount = (key) => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(`multi_ad_${key}`) || '{"date":"","count":0}');
    if (stored.date !== today) return 0;
    return stored.count;
  };

  // Helper: increment today's count for a multi-ad option key
  const incrementMultiAdCount = (key) => {
    const today = new Date().toDateString();
    const newCount = getMultiAdCount(key) + 1;
    localStorage.setItem(`multi_ad_${key}`, JSON.stringify({ date: today, count: newCount }));
    return newCount;
  };

  // Open the multi-ad sub-view
  const openMultiAdView = (config) => {
    setMultiAdConfig(config);
    setShowMultiAdView(true);
  };

  // Premium IP States
  const [showPremiumIPView, setShowPremiumIPView] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(true); // Default to true for testing as requested
  const [selectedPackage, setSelectedPackage] = React.useState('month-1');
  const [ipStep, setIpStep] = React.useState(1);
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [transactionId, setTransactionId] = React.useState('');
  const [countrySearchQuery, setCountrySearchQuery] = React.useState('');
  // Address fields
  const [division, setDivision] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [thana, setThana] = React.useState('');
  const [village, setVillage] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');
  const [ipSubmitting, setIpSubmitting] = React.useState(false);

  // Option Intro Screen State
  const [showIntroScreen, setShowIntroScreen] = React.useState(false);
  const [introItem, setIntroItem] = React.useState(null);

  // EarningPage definition

  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()));

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', color: 'bg-white', textColor: 'text-white', logo: 'https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png' },
    { id: 'nagad', name: 'Nagad', color: 'bg-white', textColor: 'text-white', logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png' },
    { id: 'rocket', name: 'Rocket', color: 'bg-white', textColor: 'text-white', logo: 'https://freelogopng.com/images/all_img/1656234841rocket-logo-png.png' },
    { id: 'card', name: 'Card', color: 'bg-slate-700', textColor: 'text-slate-400', disabled: true },
  ];

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
        setCoins(data.coins || 0);
        setLifetimeCoins(data.lifetimeCoins || 0);
        setIsPremium(data.isPremium || false);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const fetchCheckinStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/daily-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCheckinStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch checkin status:', err);
    }
  };

  const fetchVideoStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      // Fetch Video Status
      const videoResp = await fetch(`${API_BASE}/api/earning/video-status?type=video`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const videoData = await videoResp.json();
      if (videoResp.ok) setVideoStatus({ lastVideoDate: videoData.lastAd, count: videoData.count });

      // Fetch View Ads Status
      const viewAdsResp = await fetch(`${API_BASE}/api/earning/video-status?type=view_ads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const viewAdsData = await viewAdsResp.json();
      if (viewAdsResp.ok) setViewAdsStatus({ lastAdDate: viewAdsData.lastAd, count: viewAdsData.count });
    } catch (err) {
      console.error('Failed to fetch video status:', err);
    }
  };

  const fetchWheelStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/spin-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWheelStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch spin status:', err);
    }
  };

  const fetchScratchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/scratch-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setScratchStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch scratch status:', err);
    }
  };

  React.useEffect(() => {
    fetchBalance();
    fetchCheckinStatus();
    fetchVideoStatus();
    fetchWheelStatus();
    fetchScratchStatus();
    fetchQuizStatus();

    // Show banner on enter
    AdMobService.showBanner();

    // Hide banner on leave
    return () => {
      AdMobService.hideBanner();
    };
  }, []);

  // Legacy Mock Ad Timer Removed

  const handleDailyCheckinClick = () => {
    const now = new Date();
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    
    if (checkinStatus.lastCheckin && (now - new Date(checkinStatus.lastCheckin) < TWO_HOURS) && checkinStatus.count >= 2) {
      alert("Please wait 2 hours between checkin sessions!");
      return;
    }
    
    setShowCheckinView(true);
  };

  // Show interstitial ad before closing a section (back button)
  const goBackWithAd = (closeFn) => {
    if (isAdLoading.current) return;
    
    isAdLoading.current = true;
    AdMobService.showInterstitial(() => {
      isAdLoading.current = false;
      if (closeFn) closeFn();
    });
  };

  const startAd = (type) => {
    // If called from onClick={startAd}, type is an event, so default to 'daily'
    const activeType = typeof type === 'string' ? type : 'daily';
    setAdType(activeType);

    // Map internal type to AdMob placement key
    let placement = 'rewarded';
    if (activeType === 'daily') placement = 'rewarded_daily';
    if (activeType === 'video') placement = 'rewarded_videos';
    if (activeType === 'view_ads') placement = 'rewarded_view_ads';

    console.log(`[EarningPage] Starting ad for ${activeType} using placement ${placement}`);
    AdMobService.showRewarded(() => claimReward(activeType), placement);
  };

  const claimReward = async (typeOverride) => {
    const activeType = typeOverride || adType;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeType === 'daily' 
        ? `${API_BASE}/api/earning/daily-checkin`
        : `${API_BASE}/api/earning/video-claim`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: activeType })
      });
      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.balance);
        if (data.coins !== undefined) setCoins(data.coins);
        if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
        
        if (activeType === 'view_ads') {
          setViewAdsStatus({ lastAdDate: data.lastAd, count: data.count });
        } else if (activeType === 'video') {
          setVideoStatus({ lastVideoDate: data.lastAd, count: data.count });
        } else if (activeType === 'daily') {
          setCheckinStatus({ lastCheckin: data.lastCheckin, count: data.count });
          if (data.count === 2) {
            alert(data.message + "\nCheckin complete! Come back in 2 hours.");
            setShowCheckinView(false);
          } else {
            alert(data.message);
          }
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to claim reward.");
    } finally {
      setIsLoading(false);
    }
  };

  // Article Content Data
  const articleData = [
    {
      title: "গফুর মিয়ার গল্প",
      content: "গফুর মিয়ার গল্প তো আগেই শুনছো—কিন্তু আসল কাহিনি তখনই শুরু, যখন তার “স্মার্ট মুরগি” প্রজেক্ট ভাইরাল হয়ে গেল পুরো গ্রামে! গ্রামের নাম ছিল কাশিমপুর। আগে এই গ্রাম ছিল শান্ত—মানুষ কাজ করত, বিকালে চা খেত, রাতে ঘুমাত। কিন্তু গফুর মিয়ার “টেকনোলজি” আসার পর থেকে গ্রামের অবস্থা একদম বদলে গেল!"
    },
    {
      title: "📱 স্মার্ট মুরগির আপগ্রেড ভার্সন",
      content: "গফুর মিয়া এবার নতুন ঘোষণা দিল—\n—“Version 2.0 আসতেছে!”\nসবাই অবাক!\n—“এইটা আবার কী?”\nগফুর মিয়া বলল,\n—“এবার মুরগি শুধু অ্যালার্ম দিবে না, ‘ভয়েস কমান্ড’ও বুঝবে!”\n গ্রামের লোকজন চোখ বড় বড় করে তাকিয়ে রইল।\nএকজন জিজ্ঞেস করল,\n—“মানে?”\nগফুর মিয়া গম্ভীর হয়ে বলল,\n—“আপনি বলবেন—‘ডিম দাও’, মুরগি ডিম দিবে!”\nসবাই আবার হেসে উঠল। কিন্তু আগের ঘটনার পর কেউ আর পুরোপুরি সন্দেহও করতে পারছে না!"
    },
    {
      title: "🐔 পরীক্ষার দিন",
      content: "একদিন সবাইকে ডেকে গফুর মিয়া লাইভ ডেমো দিল।\nসে মুরগির সামনে দাঁড়িয়ে বলল,\n—“ডিম দাও!”\nমুরগি চুপচাপ দাঁড়িয়ে রইল… কিছুই করল না।\nসবাই হাসতে শুরু করল—\n—“এইটাই তোমার ভয়েস কমান্ড?”\nগফুর মিয়া একটু লজ্জা পেয়ে বলল,\n—“এইটা এখনো Beta Version… আপডেট লাগবে!” 😅"
    },
    {
      title: "💡 নতুন আইডিয়া—“মুরগি ব্যাংক”",
      content: "কিন্তু গফুর মিয়া হাল ছাড়ার লোক না।\nসে আবার নতুন প্ল্যান করল—\n—“মুরগি ব্যাংক খুলবো!”\nগ্রামের লোকজন বলল,\n—“এটা আবার কী জিনিস?”\nগফুর মিয়া বলল,\n—“আপনারা টাকা না রেখে মুরগি জমা রাখবেন। মাস শেষে সুদ হিসেবে ডিম পাবেন!”\nএই আইডিয়া শুনে গ্রামের মানুষ একটু সিরিয়াস হয়ে গেল।\nকারণ—ডিম তো প্রতিদিন দরকার!\nতাই অনেকেই তার “মুরগি ব্যাংক”-এ মুরগি জমা রাখতে শুরু করল।"
    },
    {
      title: "🥚 বিপদ শুরু",
      content: "প্রথম কিছুদিন সব ঠিকঠাক ছিল।\nকিন্তু একদিন দেখা গেল—গফুর মিয়ার ঘরে এত মুরগি হয়ে গেছে যে হাঁটাচলা করা যায় না!\nমুরগির ডাক, ডিমের গন্ধ, আর ফোনের অ্যালার্ম—সব মিলে অবস্থা ভয়াবহ!\nতারপর একদিন বড় বিপদ হলো…\nএকটা মুরগি হঠাৎ “লাইভ” হয়ে পুরো ঘরে দৌড়াদৌড়ি শুরু করল, আর তার গলার ফোনে অ্যালার্ম বাজতে লাগল।\nএকটার পর একটা মুরগি ভয় পেয়ে দৌড়াতে লাগল…\nপুরো ঘর হয়ে গেল “মুরগি স্ট্যাম্পেড”! 🐔🐔🐔\nগফুর মিয়া চিৎকার করল,\n—“ওই! এইটা Bug! এইটা Bug!”"
    },
    {
      title: "🚨 গ্রামবাসী বিদ্রোহ",
      content: "পরদিন গ্রামবাসী একসাথে এসে বলল,\n—“আমাদের মুরগি ফেরত দেন! এই ব্যাংক আমরা চাই না!”\nগofur মিয়া একটু চিন্তা করে বলল,\n—“ঠিক আছে… কিন্তু আপনারা কি জানেন, এইটা দেশের প্রথম ‘ডিজিটাল মুরগি ব্যাংক’?”\nএকজন রাগ করে বলল,\n—“আমরা ডিজিটাল না, আমরা ডিম চাই!”\nসবাই হাসতে হাসতে লুটোপুটি!"
    },
    {
      title: "🤯 শেষ টুইস্ট",
      content: "শেষে গফুর মিয়া সব মুরগি ফেরত দিল।\nকিন্তু কিছুদিন পর দেখা গেল—সে আবার নতুন কিছু নিয়ে কাজ করছে。\nগ্রামের এক ছেলে জিজ্ঞেস করল,\n—“এবার কী বানাচ্ছেন?”\nগফুর মিয়া চোখ টিপে বলল,\n—\n“এবার বানাবো ‘স্মার্ট ছাগল’…\nযে নিজে নিজে ঘাস খুঁজে খাবে, আর মালিককে রিপোর্ট পাঠাবে!”\nছেলেটা বলল,\n—“এইটা কি সত্যি কাজ করবে?”\nগফুর মিয়া হেসে বলল,\n—\n“কাজ করুক বা না করুক…\nআইডিয়া থাকলে ইনকাম ঠিকই হবে!” 😎"
    },
    {
      title: "😄 গল্পের শিক্ষা (হালকা মজার)",
      content: "👉 আইডিয়া যতই পাগলামি হোক, বিশ্বাস আর মার্কেটিং থাকলে সেটাও ব্যবসা হয়ে যেতে পারে!\n👉 আর গ্রামের মানুষও কম না—একবার ঠকলে দ্বিতীয়বার সাবধান 😄"
    }
  ];

  const handleArticlesClick = () => {
    setArticleStep(1);
    setShowArticleView(true);
  };

  const handleVideosClick = () => {
    if (videoStatus.count >= 5) {
      alert("You have already watched all 5 video ads for today. Come back tomorrow!");
      return;
    }
    setShowVideoView(true);
  };

  const handleGamesClick = () => {
    setShowGamesView(true);
  };

  const handleWheelClick = () => {
    setShowWheelView(true);
  };

  const handleScratchClick = () => {
    setShowScratchView(true);
  };

  const handleIPClick = () => {
    setShowPremiumIPView(true);
  };

  const fetchQuizStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/quiz-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setQuizStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch quiz status:', err);
    }
  };

  const generateMathQuestion = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === '+') {
      a = Math.floor(Math.random() * 500) + 10;
      b = Math.floor(Math.random() * 500) + 10;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 500) + 10;
      b = Math.floor(Math.random() * 500) + 10;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 30) + 2;
      b = Math.floor(Math.random() * 30) + 2;
      answer = a * b;
    }
    const wrongSet = new Set();
    while (wrongSet.size < 3) {
      const offset = Math.floor(Math.random() * 10) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const wrong = answer + (offset * sign);
      if (wrong !== answer) wrongSet.add(wrong);
    }
    const options = [...wrongSet, answer].sort(() => Math.random() - 0.5);
    return { question: `${a} ${op} ${b} = ?`, answer, options };
  };

  const generateBinaryQuestion = () => {
    const dec = Math.floor(Math.random() * 256);
    const binary = dec.toString(2);
    const answer = dec;
    const wrongSet = new Set();
    while (wrongSet.size < 3) {
      const wrong = dec + (Math.floor(Math.random() * 20) - 10);
      if (wrong !== dec && wrong >= 0) wrongSet.add(wrong);
    }
    const options = [...wrongSet, answer].sort(() => Math.random() - 0.5);
    return { question: `Binary ${binary} = ?`, answer, options };
  };

  const generateWordQuestion = () => {
    const wordPairs = [
      { word: 'Happy', answer: 'Sad', wrong: ['Angry', 'Joyful', 'Excited'] },
      { word: 'Hot', answer: 'Cold', wrong: ['Warm', 'Cool', 'Mild'] },
      { word: 'Big', answer: 'Small', wrong: ['Large', 'Huge', 'Tall'] },
      { word: 'Fast', answer: 'Slow', wrong: ['Quick', 'Rapid', 'Swift'] },
      { word: 'Light', answer: 'Dark', wrong: ['Bright', 'Dim', 'Heavy'] },
      { word: 'Strong', answer: 'Weak', wrong: ['Tough', 'Firm', 'Bold'] },
      { word: 'Young', answer: 'Old', wrong: ['New', 'Fresh', 'Youthful'] },
      { word: 'Rich', answer: 'Poor', wrong: ['Wealthy', 'Luxury', 'Lavish'] },
      { word: 'Easy', answer: 'Hard', wrong: ['Simple', 'Plain', 'Clear'] },
      { word: 'Love', answer: 'Hate', wrong: ['Like', 'Adore', 'Care'] },
      { word: 'Peace', answer: 'War', wrong: ['Calm', 'Rest', 'Quiet'] },
      { word: 'Day', answer: 'Night', wrong: ['Morning', 'Noon', 'Dawn'] },
      { word: 'Win', answer: 'Lose', wrong: ['Gain', 'Earn', 'Score'] },
      { word: 'Begin', answer: 'End', wrong: ['Start', 'Open', 'Launch'] },
      { word: 'Smile', answer: 'Frown', wrong: ['Grin', 'Laugh', 'Beam'] },
    ];
    const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    const options = [...pair.wrong.slice(0, 3), pair.answer].sort(() => Math.random() - 0.5);
    return { question: `Opposite of "${pair.word}"?`, answer: pair.answer, options };
  };

  const generateTriviaQuestion = () => {
    const triviaPool = [
      { q: 'Capital of France?', a: 'Paris', w: ['London', 'Berlin', 'Madrid'] },
      { q: 'Largest planet?', a: 'Jupiter', w: ['Saturn', 'Mars', 'Earth'] },
      { q: 'H2O is?', a: 'Water', w: ['Oxygen', 'Hydrogen', 'Carbon'] },
      { q: 'Fastest land animal?', a: 'Cheetah', w: ['Lion', 'Horse', 'Tiger'] },
      { q: 'How many continents?', a: '7', w: ['5', '6', '8'] },
      { q: 'Smallest country?', a: 'Vatican City', w: ['Monaco', 'Malta', 'Nauru'] },
      { q: 'Sun is a?', a: 'Star', w: ['Planet', 'Moon', 'Comet'] },
      { q: 'Largest ocean?', a: 'Pacific', w: ['Atlantic', 'Indian', 'Arctic'] },
      { q: 'Speed of light?', a: '300,000 km/s', w: ['150,000 km/s', '500,000 km/s', '1,000 km/s'] },
      { q: 'Hardest natural substance?', a: 'Diamond', w: ['Gold', 'Iron', 'Steel'] },
      { q: 'How many bones in human body?', a: '206', w: ['208', '204', '210'] },
      { q: 'Largest desert?', a: 'Sahara', w: ['Gobi', 'Arctic', 'Kalahari'] },
      { q: 'First president of USA?', a: 'Washington', w: ['Lincoln', 'Jefferson', 'Adams'] },
      { q: 'Currency of Japan?', a: 'Yen', w: ['Won', 'Yuan', 'Rupee'] },
      { q: 'Boiling point of water?', a: '100°C', w: ['90°C', '110°C', '80°C'] },
    ];
    const t = triviaPool[Math.floor(Math.random() * triviaPool.length)];
    const options = [...t.w, t.a].sort(() => Math.random() - 0.5);
    return { question: t.q, answer: t.a, options };
  };

  const generateQuizQuestion = (type) => {
    switch (type) {
      case 'binary': return generateBinaryQuestion();
      case 'word': return generateWordQuestion();
      case 'trivia': return generateTriviaQuestion();
      default: return generateMathQuestion();
    }
  };

  const startNewQuiz = (type) => {
    const q = generateQuizQuestion(type || quizType);
    setQuizQuestion(q);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizTimer(30);
    setQuizTimerActive(true);
  };

  const handleQuizClick = () => {
    if (quizStatus.count >= 10) {
      alert('You have completed all 10 quizzes for today. Come back tomorrow!');
      return;
    }
    setShowQuizSelection(true);
  };

  const startGkQuiz = () => {
    const lastPlayed = localStorage.getItem('gk_last_played');
    const today = new Date().toDateString();
    if (lastPlayed === today) {
      alert("You have already played the General Knowledge quiz today. Come back tomorrow!");
      return;
    }
    
    const shuffled = [...gkQuizDB].sort(() => Math.random() - 0.5).slice(0, 10);
    setGkQuizQuestions(shuffled);
    setCurrentGkIndex(0);
    setGkQuizScore(0);
    setGkSelected(null);
    setGkAnswered(false);
    setShowQuizSelection(false);
    setShowGkQuizView(true);
  };

  const handleGkAnswer = (option) => {
    if (gkAnswered) return;
    setGkSelected(option);
    setGkAnswered(true);
    
    const correct = option === gkQuizQuestions[currentGkIndex].answer;
    if (correct) {
      setGkQuizScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentGkIndex < 9) {
        setCurrentGkIndex(prev => prev + 1);
        setGkSelected(null);
        setGkAnswered(false);
      } else {
        const finalScore = correct ? gkQuizScore + 1 : gkQuizScore;
        alert(`Quiz finished! You scored ${finalScore}/10.`);
        if (finalScore >= 5) {
          alert('Congratulations! +40 Coins added to your account.');
        } else {
          alert('You need at least 5 correct answers to win Coins!');
        }
        localStorage.setItem('gk_last_played', new Date().toDateString());
        setShowGkQuizView(false);
      }
    }, 1200);
  };

  const launchQuiz = (type) => {
    if (type === 'gk') {
      startGkQuiz();
      return;
    }
    setQuizType(type);
    setQuizScore(0);
    setShowQuizSelection(false);
    startNewQuiz(type);
    setShowQuizView(true);
  };

  // Quiz Timer
  React.useEffect(() => {
    let timer;
    if (quizTimerActive && quizTimer > 0 && !quizAnswered) {
      timer = setInterval(() => {
        setQuizTimer(prev => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && !quizAnswered) {
      setQuizAnswered(true);
      setQuizTimerActive(false);
      alert("Time is up!");
      setShowQuizView(false);
    }
    return () => clearInterval(timer);
  }, [quizTimer, quizTimerActive, quizAnswered]);

  // ==========================================
  // Custom Ad Handlers for Levels 3, 4, 5
  // ==========================================
  const handleAdOptionClick = async (adName, adType, coins) => {
    setCurrentAdInfo({ name: adName, type: adType, coins, time: 0 }); // time not needed for real ads
    
    if (adType === 'Rewarded Video' || adType === 'Rewarded Interstitial') {
      await AdMobService.showRewarded(() => handleCustomAdReward(coins, adName));
    } else if (adType === 'App Open Ad') {
      await AdMobService.showAppOpenAd(() => handleCustomAdReward(coins, adName));
    } else if (adType === 'Interstitial') {
      await AdMobService.showInterstitial(() => handleCustomAdReward(coins, adName));
    } else if (adType === 'Native Ad') {
      // Simulate Native Ad by showing a large banner for 5 seconds
      setShowNativeAd(true);
      setCurrentAdInfo({ name: adName, type: adType, coins, time: 5 });
      await AdMobService.showNativeSimulatedAd();
    } else {
      setShowOfferwallAd(true); // default fallback for 'Offerwall' or Reg tasks
    }
  };

  const handleConvertCoins = async () => {
    if (coins < 1000) {
      alert('You need at least 1000 coins to convert to balance.');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/earning/convert-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
        setCoins(data.coins);
        alert(data.message);
        setShowCoinsDetails(false);
      } else {
        alert(data.message || 'Conversion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Server Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAdReward = async (pts, adName) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/earning/spin-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coins: pts }) 
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
        if (data.coins !== undefined) setCoins(data.coins);
        if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
        alert(`🎉 You earned ${pts} Coins from ${adName}!`);
      } else {
        alert(data.message || 'Failed to claim coins.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Timer for Native Ad simulation
  React.useEffect(() => {
    let adTmr;
    if (showNativeAd && currentAdInfo.time > 0) {
      adTmr = setInterval(() => {
        setCurrentAdInfo(prev => {
          if (prev.time - 1 === 0) {
            // Native Ad finished
            AdMobService.hideNativeSimulatedAd();
            setShowNativeAd(false);
            handleCustomAdReward(prev.coins, prev.name);
          }
          return {...prev, time: prev.time - 1};
        });
      }, 1000);
    }
    return () => clearInterval(adTmr);
  }, [showNativeAd, currentAdInfo.time]);


  // ==========================================
  // Main Earning View Component
  // ==========================================

  // OptionCard sub-component — shows intro screen first
  const OptionCard = ({ item, isLarge, skipIntro, count, maxCount }) => {
    // Determine if this item should skip the intro screen
    const itemsToSkipIntro = ['Premium IP', 'Refer & Earn', 'Wallet', 'History', 'Tutorial', 'Invite Friends', 'Daily Quiz', 'Math Quiz', 'Binary Quiz', 'Word Quiz', 'Gen. Knowledge'];
    const shouldSkip = skipIntro || itemsToSkipIntro.includes(item?.name);

    return (
      <motion.button
        whileHover={{ scale: 1.07, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (shouldSkip || !item.action) {
            if (item.action) item.action();
            return;
          }
          setIntroItem(item);
          setShowIntroScreen(true);
        }}
        className="flex flex-col items-center gap-2 group focus:outline-none relative"
    >
      <div className={`w-14 h-14 md:w-${isLarge ? '20' : '16'} md:h-${isLarge ? '20' : '16'} rounded-2xl bg-gradient-to-br ${item.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
        {typeof item.logo === 'string' && item.logo.startsWith('http') ? (
          <img src={item.logo} alt={item.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" onError={(e) => { e.target.style.display='none'; }} />
        ) : (
          <span className="text-white">{item.icon}</span>
        )}
      </div>
      <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight w-full">{item.name}</span>
      {item.coins != null && <span className="text-[9px] md:text-[11px] text-amber-600 dark:text-amber-400 font-black">+{item.coins} Coins</span>}
      
      {/* Progress Dots */}
      {maxCount > 0 && (
        <div className="flex gap-0.5 mt-1">
          {[...Array(maxCount)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full ${i < count ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            ></div>
          ))}
        </div>
      )}
    </motion.button>
  );
};

  // ==========================================
  // Option Intro Screen (animated detail page)
  // ==========================================
  const OptionIntroScreen = () => {
    const [moreOpen, setMoreOpen] = React.useState(false);
    const item = introItem;
    if (!item) return null;

    // Determine which animation to use based on option type
    const getAnimationType = (name) => {
      const n = (name || '').toLowerCase();
      if (n.includes('quiz') || n.includes('math') || n.includes('binary') || n.includes('word') || n.includes('knowledge')) return 'quiz';
      if (n.includes('spin') || n.includes('wheel')) return 'spin';
      if (n.includes('video') || n.includes('film')) return 'video';
      if (n.includes('scratch')) return 'scratch';
      if (n.includes('checkin') || n.includes('daily')) return 'checkin';
      if (n.includes('refer') || n.includes('invite') || n.includes('friend')) return 'refer';
      if (n.includes('article') || n.includes('read')) return 'article';
      if (n.includes('premium') || n.includes('ip')) return 'premium';
      if (n.includes('game') || n.includes('play')) return 'game';
      return 'generic';
    };

    const animType = getAnimationType(item.name);

    // Floating particles
    const FloatingDots = () => (
      <>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: Math.random() * 8 + 3,
              height: Math.random() * 8 + 3,
              background: 'white',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </>
    );

    // Central animation based on type
    const CenterAnimation = () => {
      // Helper to render the actual option's icon/logo very large
      const renderBigIcon = () => (
        <div className={`w-36 h-36 rounded-3xl bg-gradient-to-br ${bgClass} shadow-2xl backdrop-blur-sm flex items-center justify-center relative z-10 border border-white/20`}>
          {typeof item.logo === 'string' && item.logo.startsWith('http') ? (
             <img src={item.logo} alt={item.name} className="w-20 h-20 object-contain drop-shadow-xl" />
          ) : (
             <div className="w-20 h-20 text-white flex items-center justify-center drop-shadow-xl">
               {item.icon ? React.cloneElement(item.icon, { className: "w-full h-full text-white drop-shadow-md" }) : <span className="text-6xl text-white">🎯</span>}
             </div>
          )}
        </div>
      );

      const bigIcon = renderBigIcon();

      if (animType === 'quiz') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-scale-pulse"  >
            {bigIcon}
          </motion.div>
          {/* orbiting dots */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-white/60 animate-float"
              style={{ transformOrigin: `${70 + i * 10}px center`, originX: `${70 + i * 10}px` }}
            />
          ))}
          {/* question marks floating */}
          {['?', '!', '?'].map((sym, i) => (
            <motion.div
              key={i}
              className="absolute text-white/60 font-black text-2xl z-20 animate-float"
              style={{ top: `${[5, 75, 25][i]}%`, left: `${[0, 85, 95][i]}%` }}
            >{sym}</motion.div>
          ))}
        </div>
      );

      if (animType === 'spin') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-spin-slow"  >
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-white/20 absolute -inset-6" />
            {bigIcon}
          </motion.div>
        </div>
      );

      if (animType === 'video') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-scale-pulse"  >
            {bigIcon}
          </motion.div>
          {/* pulse rings */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-white/20 animate-float"
              style={{ width: 36 * i * 1.5, height: 36 * i * 1.5 }}
            />
          ))}
        </div>
      );

      if (animType === 'checkin') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-scale-pulse"  >
            {bigIcon}
          </motion.div>
          <motion.div
            className="absolute -top-4 -right-4 text-4xl z-20 bg-emerald-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white/20 animate-scale-pulse"
          ><span className="text-white drop-shadow-md pb-1">✓</span></motion.div>
        </div>
      );

      if (animType === 'scratch') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-scale-pulse"  >
            {bigIcon}
          </motion.div>
          {/* scratch sparkles */}
          {['✨', '⭐', '💫'].map((s, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl z-20 animate-float"
              style={{ top: ['10%', '60%', '20%'][i], left: ['90%', '-10%', '80%'][i] }}
            >{s}</motion.div>
          ))}
        </div>
      );

      if (animType === 'refer') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-scale-pulse"  >
            {bigIcon}
          </motion.div>
          {/* connection lines pulse */}
          {[-1, 0, 1].map(i => (
            <motion.div
              key={i}
              className="absolute w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl z-20 shadow-lg border border-white/20 animate-float"
              style={{ left: `${30 + i * 40}%`, top: i === 0 ? '-20%' : '100%' }}
            ><span className="text-white pb-1">👤</span></motion.div>
          ))}
        </div>
      );

      if (animType === 'premium') return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-float"  >
            {bigIcon}
          </motion.div>
          {/* sparkles */}
          {['✨', '⭐', '💎'].map((s, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl z-20 animate-float"
              style={{ top: ['5%', '85%', '15%'][i], left: ['-5%', '80%', '95%'][i] }}
            >{s}</motion.div>
          ))}
        </div>
      );

      // Generic / article / game
      return (
        <div className="relative flex items-center justify-center">
          <motion.div className="animate-scale-pulse"  >
            {bigIcon}
          </motion.div>
        </div>
      );
    };

    // Extract gradient colors from item.color for background
    const bgClass = item.color || 'from-blue-500 to-indigo-600';

    const handlePlay = () => {
      setShowIntroScreen(false);
      setTimeout(() => {
        if (item.action) item.action();
      }, 100);
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)' }}
        >
          {/* Gradient overlay based on item color */}
          <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-20`} />
          <FloatingDots />

          {/* Header */}
          <div className="relative z-50 flex items-center justify-between px-4 py-4 pt-safe">
            <button
              onClick={() => goBackWithAd(() => setShowIntroScreen(false))}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-black text-base tracking-tight"
            >
              {item.name}
            </motion.h1>

            {/* Menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-11 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 w-44 z-50 overflow-hidden"
                >
                  {[
                    { name: 'Home', icon: <Home className="w-4 h-4" />, action: () => { setShowIntroScreen(false); setActiveTab('Home'); } },
                    { name: 'Notification', icon: <Bell className="w-4 h-4" />, action: () => { setShowIntroScreen(false); setActiveTab('Notification'); } },
                    { name: 'Wallet', icon: <Wallet className="w-4 h-4" />, action: () => { setShowIntroScreen(false); setActiveEarningTab('wallet'); } },
                    { name: 'History', icon: <HistoryIcon className="w-4 h-4" />, action: () => { setShowIntroScreen(false); setActiveEarningTab('history'); } },
                    { name: 'Profile', icon: <User className="w-4 h-4" />, action: () => { setShowIntroScreen(false); setActiveTab('Profile'); } },
                  ].map((link, i) => (
                    <button
                      key={i}
                      onClick={() => { setMoreOpen(false); link.action(); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                    >
                      {link.icon}
                      {link.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Balance chip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10 flex justify-center mt-1 mb-3"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5">
              <span className="text-amber-400">💰</span>
              <span className="text-white font-black text-sm">৳{balance.toFixed(2)}</span>
              <span className="text-white/40 text-xs font-medium">|</span>
              <span className="text-amber-300 text-xs font-bold">{coins} Coins</span>
            </div>
          </motion.div>

          {/* Option logo + name block */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative z-10 flex items-center gap-3 mx-4 mb-6 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bgClass} flex items-center justify-center shadow-lg flex-shrink-0`}>
              {typeof item.logo === 'string' && item.logo.startsWith('http') ? (
                <img src={item.logo} alt={item.name} className="w-7 h-7 object-contain" />
              ) : (
                <span className="text-white">{item.icon}</span>
              )}
            </div>
            <div>
              <div className="text-white font-black text-base leading-none">{item.name}</div>
              <div className="text-white/50 text-xs font-medium mt-0.5">Earning Activity</div>
            </div>
          </motion.div>

          {/* Central Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 flex items-center justify-center mb-8"
            style={{ minHeight: 180 }}
          >
            <CenterAnimation />
          </motion.div>

          {/* Duration & Prize info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative z-10 mx-4 space-y-3 mb-8"
          >
            {/* Duration info - Show for time-based items */}
            {['quiz', 'video', 'game', 'scratch'].includes(animType) && (
              <div className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-2xl px-5 py-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <div className="text-white font-black text-base leading-none">
                    Duration: <span className="text-blue-400">30 seconds</span>
                  </div>
                  <div className="text-white/50 text-xs font-medium mt-0.5">
                    {animType === 'quiz' ? '(per question)' : animType === 'video' ? '(per video)' : '(per complete)'}
                  </div>
                </div>
              </div>
            )}

            {/* Prize info */}
            {item.coins != null && (
              <div className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-2xl px-5 py-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🪙</span>
                </div>
                <div>
                  <div className="text-white font-black text-base leading-none">
                    Prize: <span className="text-amber-400">{item.coins} coins</span>
                  </div>
                  <div className="text-white/50 text-xs font-medium mt-0.5">
                    {animType === 'quiz' ? '(per answer)' : animType === 'video' ? '(per video)' : animType === 'refer' ? '(per invite)' : '(upon completion)'}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Play Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative z-10 px-4"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r ${bgClass} text-white font-black text-lg shadow-2xl relative overflow-hidden`}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-float"
              />
              <span className="relative z-10">
                {animType === 'premium' ? 'Get' : animType === 'refer' ? 'Invite' : animType === 'article' ? 'Read' : '▶ Play'} {item.name}
              </span>
            </motion.button>
            <BigAdBanner />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Earning Options Data
  const mainOptions = [
    { id: 1, name: 'Daily Checkin', icon: <CalendarCheck className="w-8 h-8 md:w-10 md:h-10" />, coins: 20, color: 'from-orange-400 to-red-500', action: () => setShowCheckinView(true) },
    { id: 10, name: 'Refer & Earn', icon: <Users className="w-8 h-8 md:w-10 md:h-10" />, coins: 500, color: 'from-indigo-400 to-purple-500', action: onReferralsClick },
  ];

  const popularOptions = [
    { id: 1, name: 'Super Spin', icon: <Aperture className="w-8 h-8 md:w-10 md:h-10" />, coins: 100, color: 'from-purple-500 to-indigo-600', action: () => setShowWheelView(true) },
    { id: 2, name: 'Daily Quiz', icon: <HelpCircle className="w-8 h-8 md:w-10 md:h-10" />, coins: 50, color: 'from-amber-500 to-orange-600', action: () => setShowQuizSelection(true) },
    { id: 3, name: 'Mega Video', icon: <Film className="w-8 h-8 md:w-10 md:h-10" />, coins: 75, color: 'from-rose-500 to-red-600', action: () => setShowVideoView(true) },
    { id: 4, name: 'Invite Friends', icon: <Users className="w-8 h-8 md:w-10 md:h-10" />, coins: 1000, color: 'from-emerald-500 to-teal-600', action: onReferralsClick },
  ];

  const quizOptions = [
    { id: 1, name: 'Math Quiz', icon: <Calculator className="w-7 h-7" />, coins: 20, color: 'from-blue-500 to-indigo-600', action: () => launchQuiz('math') },
    { id: 2, name: 'Binary Guess', icon: <Binary className="w-7 h-7" />, coins: 30, color: 'from-purple-500 to-pink-600', action: () => launchQuiz('binary') },
    { id: 3, name: 'Word Master', icon: <Type className="w-7 h-7" />, coins: 25, color: 'from-emerald-500 to-teal-600', action: () => launchQuiz('word') },
    { id: 4, name: 'Gen. Knowledge', icon: <HelpCircle className="w-7 h-7" />, coins: 40, color: 'from-amber-500 to-orange-600', action: () => launchQuiz('gk') },
  ];

  const rewardOptions = [
    { id: 1, name: 'Wallet', icon: <Wallet className="w-7 h-7" />, color: 'from-blue-500 to-indigo-600', action: () => setActiveEarningTab('wallet') },
    { id: 2, name: 'History', icon: <HistoryIcon className="w-7 h-7" />, color: 'from-purple-500 to-pink-600', action: () => setActiveEarningTab('history') },
    { id: 3, name: 'Tutorial', icon: <BookOpen className="w-7 h-7" />, color: 'from-emerald-500 to-teal-600', action: () => setActiveEarningTab('tutorial') },
  ];

  // Demo withdrawal history data
  const demoWithdrawHistory = [
    { id: 1, name: 'Rahim Uddin', phone: '01712345678', amount: 2000, method: 'bKash', date: '2025-03-25', status: 'completed' },
    { id: 2, name: 'Karim Ahmed', phone: '01819876543', amount: 1500, method: 'Nagad', date: '2025-03-24', status: 'completed' },
    { id: 3, name: 'Sumaiya Begum', phone: '01611223344', amount: 3000, method: 'Rocket', date: '2025-03-23', status: 'pending' },
    { id: 4, name: 'Farhan Hossain', phone: '01755667788', amount: 1000, method: 'bKash', date: '2025-03-22', status: 'completed' },
    { id: 5, name: 'Nasrin Akter', phone: '01833445566', amount: 2500, method: 'Nagad', date: '2025-03-21', status: 'completed' },
    { id: 6, name: 'Mizanur Rahman', phone: '01977889900', amount: 1000, method: 'bKash', date: '2025-03-20', status: 'pending' },
  ];

  const blurPhone = (phone) => {
    if (!phone || phone.length < 6) return phone;
    const visible = phone.slice(0, Math.ceil(phone.length / 2));
    const hidden = phone.slice(Math.ceil(phone.length / 2));
    return visible + hidden.replace(/./g, '●');
  };

  const withdrawMethods = [
    { id: 'bkash', name: 'bKash', logo: 'https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png', available: true },
    { id: 'nagad', name: 'Nagad', logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png', available: true },
    { id: 'rocket', name: 'Rocket', logo: 'https://freelogopng.com/images/all_img/1656234841rocket-logo-png.png', available: true },
    { id: 'bank', name: 'Bank Card', logo: null, available: true },
  ];

  const handleWithdraw = async () => {
    if (!withdrawMethod) { alert('Please select a payment method.'); return; }
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 1000) { alert('Minimum withdrawal is 1000 ৳'); return; }
    if (amt > balance) { alert('Insufficient balance.'); return; }
    if (!withdrawPhone || withdrawPhone.length < 10) { alert('Please enter a valid phone number.'); return; }
    setWithdrawLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setWithdrawLoading(false);
    // Call the premium success screen instead of showing the inline success message
    onSuccess();
    setWithdrawAmount('');
    setWithdrawPhone('');
    setWithdrawMethod('');
  };

  const getLevelInfo = (pts) => {
    if (pts < 1500) return { level: 1, current: pts, target: 1500, label: 'Level 1' };
    if (pts < 3500) return { level: 2, prev: 1500, current: pts, target: 3500, label: 'Level 2' };
    if (pts < 6000) return { level: 3, prev: 3500, current: pts, target: 6000, label: 'Level 3' };
    if (pts < 10000) return { level: 4, prev: 6000, current: pts, target: 10000, label: 'Level 4' };
    return { level: 5, prev: 10000, current: pts, target: 10000, label: 'Max Level', isMax: true };
  };

  const levelInfo = getLevelInfo(lifetimeCoins);
  const progressPercent = levelInfo.isMax ? 100 : Math.min(100, Math.max(0, ((levelInfo.current - (levelInfo.prev || 0)) / (levelInfo.target - (levelInfo.prev || 0))) * 100));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-24 md:pb-8">
      {/* Option Intro Screen — full screen overlay */}
      <AnimatePresence>
        {showIntroScreen && introItem && <OptionIntroScreen />}
      </AnimatePresence>

      {/* ═══════ Multi-Ad Sub-View Overlay (5 ads per option) ═══════ */}
      <AnimatePresence>
        {showMultiAdView && multiAdConfig && (() => {
          const currentCount = getMultiAdCount(multiAdConfig.key);
          const adSlots = [
            { id: 1, label: `${multiAdConfig.name} Ad 1`, icon: '🎬' },
            { id: 2, label: `${multiAdConfig.name} Ad 2`, icon: '📺' },
            { id: 3, label: `${multiAdConfig.name} Ad 3`, icon: '🎥' },
            { id: 4, label: `${multiAdConfig.name} Ad 4`, icon: '📡' },
            { id: 5, label: `${multiAdConfig.name} Ad 5`, icon: '🎯' },
          ];

          const handleMultiAdSlotClick = async (slotId) => {
            const cnt = getMultiAdCount(multiAdConfig.key);
            if (cnt >= slotId) return;
            if (cnt + 1 !== slotId) return;

            const triggerReward = async () => {
              setIsLoading(true);
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE}/api/earning/spin-claim`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ coins: multiAdConfig.coins })
                });
                const data = await response.json();
                if (response.ok) {
                  setBalance(data.balance);
                  if (data.coins !== undefined) setCoins(data.coins);
                  if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                  incrementMultiAdCount(multiAdConfig.key);
                  setMultiAdConfig(prev => ({...prev}));
                  alert(`🎉 You earned ${multiAdConfig.coins} Coins from ${multiAdConfig.name}!`);
                } else {
                  alert(data.message || 'Failed to claim coins.');
                }
              } catch (err) {
                alert('Network error.');
              } finally {
                setIsLoading(false);
              }
            };

            if (multiAdConfig.adType === 'rewarded') {
              AdMobService.showRewarded(triggerReward);
            } else if (multiAdConfig.adType === 'interstitial') {
              AdMobService.showInterstitial(triggerReward);
            } else {
              AdMobService.showRewarded(triggerReward);
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[95] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-900 px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="flex items-center gap-3">
                    <img src={multiAdConfig.logo} alt={multiAdConfig.name} className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-sm" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{multiAdConfig.name}</h3>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">+{multiAdConfig.coins} Coins per ad</p>
                    </div>
                  </div>
                  <button onClick={() => goBackWithAd(() => setShowMultiAdView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                  <div className="text-center space-y-2 mb-4">
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                      Watch 5 ads daily to earn <span className="text-amber-600 dark:text-amber-400 font-bold">{multiAdConfig.coins * 5} Coins</span>!
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${currentCount > i ? `bg-gradient-to-br ${multiAdConfig.color}` : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">{currentCount}/5 ads watched today</p>
                  </div>

                  {/* Ad Slots */}
                  <div className="space-y-3">
                    {adSlots.map((slot) => {
                      const cnt = getMultiAdCount(multiAdConfig.key);
                      const isCompleted = cnt >= slot.id;
                      const isNext = cnt + 1 === slot.id;
                      const isLocked = !isCompleted && !isNext;

                      return (
                        <motion.button
                          key={slot.id}
                          whileHover={isLocked || isCompleted ? {} : { scale: 1.02 }}
                          whileTap={isLocked || isCompleted ? {} : { scale: 0.98 }}
                          onClick={() => handleMultiAdSlotClick(slot.id)}
                          disabled={isLocked || isCompleted || isLoading}
                          className={`flex items-center justify-between w-full p-4 border-2 rounded-2xl transition-all group ${
                            isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                            isNext ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg cursor-pointer hover:border-amber-400 dark:hover:border-amber-500' :
                            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                              isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                              isNext ? `bg-gradient-to-br ${multiAdConfig.color} shadow-lg` :
                              'bg-slate-100 dark:bg-slate-700'
                            }`}>
                              {isCompleted ? <Check className="w-6 h-6 text-emerald-500" /> : (
                                <span className={isNext ? '' : 'grayscale opacity-50'}>{slot.icon}</span>
                              )}
                            </div>
                            <div>
                              <h4 className={`font-bold text-sm ${
                                isCompleted ? 'text-emerald-700 dark:text-emerald-400' :
                                isNext ? 'text-slate-800 dark:text-slate-200' :
                                'text-slate-400 dark:text-slate-500'
                              }`}>{slot.label}</h4>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                {isCompleted ? '✓ Claimed' : isNext ? 'Tap to watch & earn' : 'Locked — watch previous ad first'}
                              </p>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-full font-bold text-sm shrink-0 ${
                            isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                            isNext ? `bg-gradient-to-r ${multiAdConfig.color} text-white shadow-sm` :
                            'bg-slate-100 dark:bg-slate-700 text-slate-400'
                          }`}>
                            {isCompleted ? '✓' : `+${multiAdConfig.coins}`}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* All done message */}
                  {currentCount >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center"
                    >
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">🎉 All 5 ads completed!</p>
                      <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">Come back tomorrow for more!</p>
                    </motion.div>
                  )}

                  {/* Ad placeholder */}
                  <div className="w-full border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden mt-4">
                    <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-500 font-bold text-sm">Nice job!</span>
                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">This is a 468x60 test ad.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showCoinsDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#050B14]/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0F172A] w-full max-w-[360px] rounded-[2rem] shadow-2xl border border-slate-800 flex flex-col items-center relative overflow-hidden p-8"
            >
              {/* Back Button */}
              <button 
                onClick={() => setShowCoinsDetails(false)}
                className="absolute top-5 left-5 text-slate-400 hover:text-white transition-colors z-20"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-amber-500/20 flex items-center justify-center rounded-full mb-4 mt-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Medal className="w-8 h-8 text-amber-400" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-1">Your Coins</h2>
              <p className="text-amber-400 text-3xl font-black mb-6 drop-shadow-md">
                {coins.toLocaleString()}
              </p>

              <div className="w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-6">
                 <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-3">
                    <span className="text-sm font-medium text-slate-300">Conversion Rate</span>
                    <span className="text-sm font-bold text-white bg-slate-700 px-2 py-1 rounded-md">1000 Coins = 50 ৳</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Minimum Convert</span>
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                       1000 Coins
                    </div>
                 </div>
              </div>

              <p className="text-xs text-slate-400 text-center leading-relaxed mb-6">
                Earn coins through various tasks and convert them manually to your balance whenever you reach 1000 coins!
              </p>

              <button 
                disabled={isLoading || coins < 1000}
                onClick={handleConvertCoins}
                className={`w-full py-4 rounded-full font-black transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${
                  coins >= 1000 
                  ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:shadow-lg hover:shadow-amber-500/25 cursor-pointer" 
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? 'Processing...' : coins >= 1000 ? 'Convert to Balance' : 'Need 1000 Coins'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showLevelView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#050B14]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0F172A] w-full max-w-[400px] rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col items-center relative overflow-hidden p-6 pb-8 my-auto"
            >
              {/* Back Button */}
              <button 
                onClick={() => setShowLevelView(false)}
                className="absolute top-5 left-5 text-slate-400 hover:text-white transition-colors z-20"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {/* Level Badge */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-xl shadow-orange-500/30 flex items-center justify-center border-4 border-amber-300/30 mt-6 mb-3 animate-float"
              >
                <span className="font-black text-white text-3xl">{levelInfo.level}</span>
              </motion.div>
              <h2 className="text-2xl font-black text-white">{levelInfo.label}</h2>
              <p className="text-sm text-slate-400 font-medium mb-6">
                {lifetimeCoins.toLocaleString()} lifetime coins collected
              </p>
              
              {/* Current Level Progress */}
              <div className="w-full bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    {levelInfo.isMax ? 'Max Level Reached!' : `Progress to Level ${levelInfo.level + 1}`}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {levelInfo.isMax ? '✓' : `${Math.round(progressPercent)}%`}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  />
                </div>
                {!levelInfo.isMax && (
                  <p className="text-[11px] text-slate-500 mt-2 text-center">
                    {(levelInfo.target - levelInfo.current).toLocaleString()} coins to level up
                  </p>
                )}
              </div>

              {/* All Levels */}
              <div className="w-full space-y-2">
                {[
                  { lv: 1, from: 0, to: 1500 },
                  { lv: 2, from: 1500, to: 3500 },
                  { lv: 3, from: 3500, to: 6000 },
                  { lv: 4, from: 6000, to: 10000 },
                  { lv: 5, from: 10000, to: null },
                ].map((tier) => {
                  const isActive = levelInfo.level === tier.lv;
                  const isCompleted = levelInfo.level > tier.lv;
                  return (
                    <div key={tier.lv} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive ? 'bg-amber-500/10 border border-amber-500/30' 
                      : isCompleted ? 'bg-slate-800/40 border border-slate-700/30' 
                      : 'bg-slate-800/20 border border-slate-800/50'}
                    `}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                        isActive ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20'
                        : isCompleted ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700/50 text-slate-500'}
                      `}>
                        {isCompleted ? <Check className="w-4 h-4" /> : tier.lv}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          Level {tier.lv} {tier.to === null && '(Max)'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {tier.to !== null ? `${tier.from.toLocaleString()} — ${tier.to.toLocaleString()} Coins` : `${tier.from.toLocaleString()}+ Coins`}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">CURRENT</span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-black text-emerald-400">DONE</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => goBackWithAd(() => setShowLevelView(false))}
                className="mt-8 w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm uppercase tracking-wide"
              >
                Continue Earning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showPremiumIPView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#050B14]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0F172A] w-full max-w-[400px] sm:max-w-[420px] rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col relative overflow-hidden min-h-[600px] my-auto pb-6"
            >
              {/* Back Button */}
              <button 
                onClick={() => {
                  if (ipStep > 1 && ipStep < 5) setIpStep(ipStep - 1);
                  else {
                    goBackWithAd(() => setShowPremiumIPView(false));
                    setIpStep(1);
                  }
                }}
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors z-20 p-2 rounded-full"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="flex-1 overflow-y-auto px-6 pt-16 custom-scrollbar flex flex-col items-center w-full">
                <AnimatePresence mode="wait">
                  {ipStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="w-full flex flex-col items-center"
                    >
                      {/* Crown Icon */}
                      <motion.div
                        className="mb-4 text-yellow-400 mt-2 animate-float"
                      >
                         <Crown className="w-16 h-16 fill-current" strokeWidth={1} />
                      </motion.div>

                      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Get IP</h2>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px] text-center mb-8">
                        Upgrade to Premium IP to enjoy more features
                      </p>

                      {/* Features List */}
                      <div className="w-full max-w-[260px] space-y-4 mb-8">
                        {[
                          { icon: Globe, text: "All Global Services" },
                          { icon: Shield, text: "Super fast Connections" },
                          { icon: Globe, text: "All 30+ country Server for VIP" },
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-4 text-slate-300">
                            <feat.icon className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] font-bold tracking-wide">{feat.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Free Trial Section */}
                      <div className="text-center mb-6">
                        <h3 className="text-white font-black text-lg tracking-tight">30 days <span className="text-blue-500">Free Trial</span></h3>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          No commitment & Cancel Anytime
                        </p>
                      </div>

                      {/* Pricing Cards */}
                      <div className="w-full space-y-3 mb-8">
                        {ipPackages.map((pkg) => (
                          <motion.button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all relative overflow-hidden ${
                              selectedPackage === pkg.id 
                                ? 'bg-slate-800/80 border-blue-500 shadow-lg shadow-blue-500/10' 
                                : 'bg-[#161F36] border-slate-700/50 hover:bg-[#1A2542]'
                            }`}
                          >
                            {pkg.bestValue && (
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-100 mt-0 z-10">
                                <span className="bg-[#10B981] text-white text-[10px] font-black px-2 mt-4 ml-2 py-1.5 rounded uppercase tracking-tighter shrink-0 flex items-center justify-center transform -rotate-0 shadow-lg">
                                  % OFF
                                </span>
                              </div>
                            )}

                            <div className={`flex flex-wrap items-baseline gap-2 ${pkg.bestValue ? 'ml-12' : 'ml-2'} z-0`}>
                              <span className="font-bold text-[16px] text-white tracking-wide">
                                ৳ {pkg.price}/-
                              </span>
                              <span className="text-[14px] text-slate-300 font-medium">
                                {pkg.name}
                              </span>
                              {pkg.freeInfo && (
                                <span className="text-[12px] font-bold text-emerald-400">
                                  (+{pkg.freeInfo})
                                </span>
                              )}
                            </div>

                            {/* Radio Button */}
                            <div className="mr-2 shrink-0 z-10">
                               <div className={`w-5 h-5 rounded-full border-[2.5px] items-center justify-center flex transition-all ${
                                 selectedPackage === pkg.id ? 'border-blue-500 bg-transparent' : 'border-slate-500 bg-transparent'
                               }`}>
                                 {selectedPackage === pkg.id && <div className="w-[10px] h-[10px] bg-blue-500 rounded-full" />}
                               </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Upgrade Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIpStep(2)}
                        className="w-full py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-bold text-[16px] shadow-lg shadow-blue-500/20 mb-6"
                      >
                        Get IP
                      </motion.button>

                      {/* Terms & Privacy */}
                      <div className="flex w-full items-center justify-between px-4 pb-2">
                        <button className="text-[12px] font-medium text-blue-500 hover:text-blue-400 underline underline-offset-4 transition-colors">Terms of Conditions</button>
                        <button className="text-[12px] font-medium text-blue-500 hover:text-blue-400 underline underline-offset-4 transition-colors">Privacy Policy</button>
                      </div>
                    </motion.div>
                  )}

                  {ipStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="w-full flex flex-col items-center"
                    >
                      <h3 className="text-white font-black text-2xl mb-2 text-center mt-4 tracking-tight">Select Country</h3>
                      <p className="text-slate-400 text-sm mb-6 text-center max-w-[240px]">Choose the server location for your IP</p>
                      
                      {/* Country Custom Dropdown */}
                      <div className="w-full mb-6 relative">
                        <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block ml-1 mb-2 text-center">Choose Server Location</label>
                        <div className="relative">
                          <button
                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            className="w-full bg-[#161F36] border-2 border-slate-700/50 hover:border-slate-600 rounded-2xl py-4 px-5 text-white flex items-center justify-between transition-all group shadow-inner"
                          >
                            <div className="flex items-center gap-3">
                                {selectedCountry ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-6 rounded-md overflow-hidden border border-slate-700/50 shadow-sm flex-shrink-0">
                                      <img 
                                        src={`https://flagcdn.com/w80/${countries.find(c => c.id === selectedCountry)?.iso}.png`} 
                                        alt={countries.find(c => c.id === selectedCountry)?.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="font-bold text-sm tracking-wide">{countries.find(c => c.id === selectedCountry)?.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 font-bold text-sm">Select Server Country...</span>
                                )}
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isCountryDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 5, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1A2542] border-2 border-slate-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden py-2"
                              >
                                <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                  {countries.map((country) => (
                                    <button
                                      key={country.id}
                                      onClick={() => {
                                        setSelectedCountry(country.id);
                                        setIsCountryDropdownOpen(false);
                                      }}
                                      className={`w-full px-5 py-3 flex items-center gap-4 transition-colors hover:bg-white/5 ${
                                        selectedCountry === country.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300'
                                      }`}
                                    >
                                      <div className="w-7 h-5 rounded-sm overflow-hidden border border-slate-600/50 shadow-sm flex-shrink-0">
                                        <img 
                                          src={`https://flagcdn.com/w40/${country.iso}.png`} 
                                          alt={country.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="font-bold text-sm">{country.name}</span>
                                      {selectedCountry === country.id && <Check className="w-4 h-4 ml-auto text-blue-400" />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Address Fields */}
                      <div className="w-full space-y-3 mb-6">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-3">Your Address Details</p>
                        {[
                          { label: 'Division', value: division, set: setDivision, placeholder: 'e.g. Dhaka' },
                          { label: 'District', value: district, set: setDistrict, placeholder: 'e.g. Gazipur' },
                          { label: 'Thana', value: thana, set: setThana, placeholder: 'e.g. Tongi' },
                          { label: 'Village', value: village, set: setVillage, placeholder: 'e.g. Nayapara' },
                          { label: 'Postal Code', value: postalCode, set: setPostalCode, placeholder: 'e.g. 1710' },
                        ].map((field) => (
                          <div key={field.label}>
                            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block ml-1 mb-1">{field.label}</label>
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              value={field.value}
                              onChange={(e) => field.set(e.target.value)}
                              className="w-full bg-[#161F36] border-2 border-slate-700/50 focus:border-blue-500 rounded-xl py-3 px-4 text-white placeholder-slate-600 transition-all font-medium text-sm outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!selectedCountry || !division || !district || !thana || !village || !postalCode}
                        onClick={() => setIpStep(3)}
                        className={`w-full py-4 rounded-full font-bold text-[16px] shadow-lg transition-all ${
                          selectedCountry && division && district && thana && village && postalCode
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-blue-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </motion.button>
                    </motion.div>
                  )}

                  {ipStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="w-full flex flex-col items-center"
                    >
                      <h3 className="text-white font-black text-2xl mb-2 text-center mt-4 tracking-tight">Payment Method</h3>
                      <p className="text-slate-400 text-sm mb-8 text-center max-w-[240px]">Choose how you want to pay</p>

                      <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            disabled={method.disabled}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex flex-col items-center justify-center p-6 rounded-[1.5rem] border-2 transition-all relative ${
                              method.disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''
                            } ${
                              paymentMethod === method.id 
                                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                                : 'bg-[#161F36] border-slate-700/50 hover:bg-[#1A2542] hover:border-slate-600'
                            }`}
                          >
                            <div className={`w-14 h-14 rounded-2xl ${method.color} mb-3 flex items-center justify-center font-black ${method.textColor} text-[10px] shadow-sm bg-white overflow-hidden p-1.5`}>
                              {method.logo ? (
                                <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                              ) : (
                                method.name.substring(0,2).toUpperCase()
                              )}
                            </div>
                            <span className="text-white font-bold text-sm tracking-wide">{method.name}</span>
                            {method.disabled && (
                              <span className="absolute top-3 right-3 bg-slate-800 border border-slate-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter text-slate-400 drop-shadow-sm">N/A</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <motion.button
                        disabled={!paymentMethod}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIpStep(4)}
                        className={`w-full py-4 rounded-full font-bold text-[16px] transition-all ${
                          paymentMethod ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Proceed to Pay
                      </motion.button>
                    </motion.div>
                  )}

                  {ipStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="w-full flex flex-col items-center"
                    >
                      <h3 className="text-white font-black text-2xl mb-2 text-center mt-4 tracking-tight capitalize">{paymentMethod} Payment</h3>
                      <p className="text-slate-400 text-sm mb-8 text-center max-w-[260px]">
                        Send ৳ {ipPackages.find(p => p.id === selectedPackage)?.price}/- to the number below and submit the transaction ID.
                      </p>

                      <div className="bg-[#161F36] p-6 rounded-[1.5rem] border border-slate-700/50 mb-6 text-center w-full shadow-inner">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Our {paymentMethod} Number</p>
                        <p className="text-white text-3xl font-black tracking-tight tracking-wider select-all">01700-000000</p>
                        <p className="text-blue-400 text-[10px] font-bold mt-2 tracking-widest uppercase">(Personal)</p>
                      </div>

                      <div className="space-y-4 mb-8 w-full">
                        <div>
                          <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-2">Transaction ID</label>
                          <input 
                            type="text"
                            placeholder="Enter Tran-ID here"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full bg-[#161F36] border-2 border-slate-700/50 focus:border-blue-500 rounded-2xl p-4 text-white font-bold placeholder:text-slate-600 transition-all outline-none tracking-widest"
                          />
                        </div>
                      </div>

                      <motion.button
                        disabled={!transactionId || ipSubmitting}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          if (!transactionId || ipSubmitting) return;
                          setIpSubmitting(true);
                          try {
                            const token = localStorage.getItem('token');
                            const pkg = ipPackages.find(p => p.id === selectedPackage);
                            const res = await fetch(`${API_BASE}/api/earning/premium-order`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({
                                packageId: selectedPackage,
                                packageName: pkg?.label || selectedPackage,
                                amount: pkg?.price,
                                country: selectedCountry,
                                division, district, thana, village, postalCode,
                                paymentMethod,
                                transactionId,
                              }),
                            });
                            if (res.ok) {
                              setIpStep(5);
                            } else {
                              const data = await res.json();
                              alert(data.message || 'Submission failed. Try again.');
                            }
                          } catch (e) {
                            alert('Network error. Please try again.');
                          } finally {
                            setIpSubmitting(false);
                          }
                        }}
                        className={`w-full py-4 rounded-full font-bold text-[16px] transition-all ${
                          transactionId && !ipSubmitting ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {ipSubmitting ? 'Submitting...' : 'Submit Transaction'}
                      </motion.button>
                    </motion.div>
                  )}

                  {ipStep === 5 && (
                    <motion.div 
                      key="step5"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full flex flex-col items-center text-center py-8 mt-12"
                    >
                      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <Check className="w-12 h-12 text-emerald-400" strokeWidth={3} />
                      </div>
                      <h3 className="text-white font-black text-3xl mb-4 tracking-tight">Success!</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mb-12">
                        Your payment is under review. Please wait <b>1 hour</b>. Our admin will provide your IP soon.
                      </p>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowPremiumIPView(false);
                          setIpStep(1);
                        }}
                        className="px-12 py-4 rounded-full bg-[#161F36] text-white font-bold text-[16px] border border-slate-700 hover:bg-[#1A2542] transition-colors shadow-xl"
                      >
                        Done
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Reading View Overlay */}
      <AnimatePresence>
        {showArticleView && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[110] bg-slate-50 dark:bg-slate-900 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-6 flex items-center justify-between shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate pr-4">গফুর মিয়ার স্মার্ট মুরগি ২.০</h2>
              <button 
                onClick={() => goBackWithAd(() => setShowArticleView(false))}
                className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-300 dark:hover:text-white transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Reading Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
              {articleData.slice(0, articleStep).map((section, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-8 mt-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-brand-500"></div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-6 leading-tight">{section.title}</h3>
                    <div className="space-y-4">
                      {section.content.split('\n').map((para, i) => (
                        <p key={i} className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Banner Ad After Each Section */}
                  <div className="w-full mb-10 flex justify-center">
                    <BigAdBanner />
                  </div>
                </motion.div>
              ))}

              {/* Next/Finish Button */}
              <div className="flex justify-center mt-12 mb-10">
                {articleStep < articleData.length ? (
                  <motion.button
                    whileHover={{ scale: 1.05, translateY: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                       setArticleStep(prev => prev + 1);
                       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }}
                    className="bg-brand-600 hover:bg-brand-500 text-white font-black text-lg py-4 px-10 rounded-full shadow-xl shadow-brand-500/30 transition-all flex items-center gap-2"
                  >
                    READ NEXT PART <BookOpen className="w-5 h-5 ml-2" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goBackWithAd(() => setShowArticleView(false))}
                    className="bg-green-600 hover:bg-green-500 text-white font-black text-lg py-4 px-10 rounded-full shadow-xl shadow-green-500/30 transition-all flex items-center gap-2"
                  >
                    FINISH READING <Medal className="w-5 h-5 ml-2" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Ads Pre-Ad View */}
      <AnimatePresence>
        {showVideoView && !showAdOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
               <div className="bg-slate-50 dark:bg-slate-900 px-8 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{videoType === 'video' ? 'Videos' : 'View Ads'}</h3>
                  <button onClick={() => goBackWithAd(() => setShowVideoView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                     <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                  <div className="text-center space-y-2 mb-6">
                     <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {videoType === 'video' 
                          ? 'Watch 5 videos daily to earn 125 Coins!' 
                          : 'Watch 5 video ads daily to earn 50 Coins!'}
                     </p>
                     <div className="flex items-center justify-center gap-2">
                        {[0, 1, 2, 3, 4].map(i => {
                          const currentStatus = videoType === 'video' ? videoStatus : viewAdsStatus;
                          return <div key={i} className={`w-3 h-3 rounded-full ${currentStatus.count > i ? (videoType === 'video' ? 'bg-purple-500' : 'bg-sky-500') : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        })}
                     </div>
                  </div>

                  <div className="space-y-4">
                     {(videoType === 'video' ? [
                       { id: 1, type: 'Admob Video Ads', pts: 25, logo: 'https://img.icons8.com/color/96/google-ads.png' },
                       { id: 2, type: 'Startapp Video Ads', pts: 25, logo: 'https://img.icons8.com/fluency/96/play-button-circled.png' },
                       { id: 3, type: 'Unity Video Ads', pts: 25, logo: 'https://img.icons8.com/ios-filled/100/unity.png' },
                       { id: 4, type: 'Facebook Video Ads', pts: 25, logo: 'https://img.icons8.com/fluency/96/facebook-new.png' },
                       { id: 5, type: 'Admob Interstitial', pts: 25, logo: 'https://img.icons8.com/color/96/google-ads.png' }
                     ] : [
                       { id: 1, type: 'Sponsored Ad 1', pts: 10, logo: 'https://img.icons8.com/fluency/96/ad-blocker.png' },
                       { id: 2, type: 'Sponsored Ad 2', pts: 10, logo: 'https://img.icons8.com/color/96/marketing.png' },
                       { id: 3, type: 'Partner Ad 1', pts: 10, logo: 'https://img.icons8.com/color/96/popular-topic.png' },
                       { id: 4, type: 'Partner Ad 2', pts: 10, logo: 'https://img.icons8.com/fluency/96/campaign.png' },
                       { id: 5, type: 'Premium Ad', pts: 10, logo: 'https://img.icons8.com/color/96/best-seller.png' }
                     ]).map((adInfo) => {
                        const currentStatus = videoType === 'video' ? videoStatus : viewAdsStatus;
                        const isCompleted = currentStatus.count >= adInfo.id;
                        const isLocked = !isCompleted && currentStatus.count + 1 !== adInfo.id;

                        return (
                          <motion.button
                            key={adInfo.id}
                            whileHover={isLocked || isCompleted ? {} : { scale: 1.02 }}
                            whileTap={isLocked || isCompleted ? {} : { scale: 0.98 }}
                            onClick={() => !isLocked && !isCompleted && startAd(videoType)}
                            disabled={isLocked || isCompleted}
                            className={`flex items-center justify-between w-full p-4 border rounded-2xl transition-all group ${
                              isCompleted ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60' :
                              isLocked ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-40 cursor-not-allowed' :
                              'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-4 text-left">
                               <img src={adInfo.logo} alt={adInfo.type} className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-sm shrink-0" />
                               <div>
                                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{adInfo.type}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Watch the video and earn {adInfo.pts} Coins</p>
                               </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full font-bold text-sm shrink-0 ${
                              isCompleted ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' :
                              'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                            }`}>
                               +{adInfo.pts}
                            </div>
                          </motion.button>
                        );
                     })}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Games View */}
      <AnimatePresence>
        {showGamesView && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-900 px-8 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Games</h3>
                <button onClick={() => goBackWithAd(() => setShowGamesView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-4">Play games and earn bonus Coins!</p>
                {[
                  { name: 'Puzzle Quest', desc: 'Solve puzzles to earn rewards', icon: '🧩', color: 'from-blue-500 to-indigo-600', pts: '5-50' },
                  { name: 'Color Match', desc: 'Match colours and win big', icon: '🎨', color: 'from-pink-500 to-rose-600', pts: '10-30' },
                  { name: 'Word Master', desc: 'Find hidden words for coins', icon: '📝', color: 'from-green-500 to-emerald-600', pts: '5-25' },
                ].map((game, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => alert('Coming soon! This game will be available in a future update.')}
                    className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-14 h-14 bg-gradient-to-br ${game.color} flex items-center justify-center rounded-2xl text-3xl shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                        {game.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{game.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{game.desc}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold shrink-0">
                      {game.pts} Coins
                    </div>
                  </motion.button>
                ))}
                <div className="text-center pt-4">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">More games coming soon! 🎮</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fortune Wheel View */}
      <AnimatePresence>
        {showWheelView && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[95vh] flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Fortune Wheel</h3>
                <button onClick={() => goBackWithAd(() => setShowWheelView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex flex-col items-center space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Spin the wheel to win Coins!</p>
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${wheelStatus.count > i ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{wheelStatus.count}/10 spins used today</p>
                </div>

                {/* Wheel */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  {/* Pointer */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-red-500 drop-shadow-lg"></div>

                  <motion.div
                    animate={isSpinning ? { rotate: [0, spinReward?.totalRotation || 1800] } : {}}
                    transition={{ duration: 4, ease: [0.2, 0.8, 0.3, 1] }}
                    onAnimationComplete={() => {
                      if (isSpinning && spinReward) {
                        setIsSpinning(false);
                        const reward = spinReward.coins;
                        (async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${API_BASE}/api/earning/spin-claim`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ coins: reward }),
                            });
                            const data = await response.json();
                            if (response.ok) {
                              setBalance(data.balance);
                              if (data.coins !== undefined) setCoins(data.coins);
                              if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                              setWheelStatus({ lastSpinDate: data.lastSpinDate, count: data.count });
                              alert(data.message || `🎉 You won ${reward} Coins!`);
                            } else {
                              alert(data.message || 'Failed to claim spin.');
                            }
                          } catch (err) {
                            alert('Network error.');
                          }
                        })();
                      }
                    }}
                    className="w-full h-full rounded-full border-[6px] border-amber-400 dark:border-amber-500 shadow-2xl overflow-hidden relative"
                    style={{ background: `conic-gradient(
                      #ef4444 0deg 36deg, #f97316 36deg 72deg, #eab308 72deg 108deg, #22c55e 108deg 144deg,
                      #06b6d4 144deg 180deg, #3b82f6 180deg 216deg, #8b5cf6 216deg 252deg, #ec4899 252deg 288deg,
                      #f43f5e 288deg 324deg, #14b8a6 324deg 360deg
                    )` }}
                  >
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pts, i) => (
                      <div
                        key={i}
                        className="absolute font-black text-white text-xs sm:text-sm drop-shadow-md"
                        style={{
                          top: '50%', left: '50%',
                          transform: `rotate(${i * 36 + 18}deg) translateY(-80px) rotate(-${i * 36 + 18}deg)`,
                          transformOrigin: '0 0',
                          marginTop: '-8px', marginLeft: '-12px'
                        }}
                      >
                        {pts}
                      </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-4 border-amber-400">
                        <span className="font-black text-amber-500 text-sm">SPIN</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSpinning || wheelStatus.count >= 10}
                  onClick={() => {
                    if (wheelStatus.count >= 10) {
                      alert('You have used all 10 spins today. Come back tomorrow!');
                      return;
                    }
                    // Pick random segment and calculate rotation to land on it
                    const segments = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                    const randomIdx = Math.floor(Math.random() * segments.length);
                    const segmentAngle = randomIdx * 36 + 18; // center of segment
                    // Pointer is at top (0deg). Wheel rotates clockwise.
                    // To land on segment i, final rotation mod 360 should be (360 - segmentAngle)
                    const landAngle = (360 - segmentAngle + 360) % 360;
                    const totalRotation = 1800 + landAngle + Math.random() * 10 - 5; // 5 full rotations + land
                    setSpinReward({ coins: segments[randomIdx], totalRotation });
                    setIsSpinning(true);
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                    isSpinning ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-wait' :
                    wheelStatus.count >= 10 ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' :
                    'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/30'
                  }`}
                >
                  {isSpinning ? 'Spinning...' : wheelStatus.count >= 10 ? 'All Spins Used ✓' : `SPIN NOW (${10 - wheelStatus.count} left)`}
                </motion.button>
                <BigAdBanner />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scratch Card View */}
      <AnimatePresence>
        {showScratchView && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[95vh] flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Scratch Cards</h3>
                <button onClick={() => goBackWithAd(() => setShowScratchView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
                <div className="text-center space-y-1 mb-2">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Scratch to reveal your reward! 20 Coins each.</p>
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${scratchStatus.count > i ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{scratchStatus.count}/10 scratched today</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const cardNum = i + 1;
                      const isScratched = scratchStatus.count >= cardNum;
                      const isNext = scratchStatus.count + 1 === cardNum;
                      const isLocked = !isScratched && !isNext;

                      return (
                        <motion.button
                          key={i}
                          whileHover={isLocked || isScratched ? {} : { scale: 1.04 }}
                          whileTap={isLocked || isScratched ? {} : { scale: 0.96 }}
                          disabled={isLocked || isScratched || isLoading}
                          onClick={() => {
                            if (isLocked || isScratched) return;
                            setActiveScratchCard({ index: i, cardNum, isRevealed: false });
                          }}
                          className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all overflow-hidden min-h-[140px] ${
                            isScratched
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : isNext
                              ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700 shadow-md hover:shadow-xl cursor-pointer group'
                              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {isScratched ? (
                            <>
                              <span className="text-4xl mb-2 grayscale opacity-50">🎁</span>
                              <span className="font-bold text-slate-400 dark:text-slate-500 text-sm">Card {cardNum}</span>
                              <span className="absolute bottom-2 text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full">Claimed!</span>
                            </>
                          ) : isNext ? (
                            <>
                              {/* Scratch cover overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 flex flex-col items-center justify-center gap-2 group-hover:opacity-90 transition-opacity z-10">
                                <motion.div
                                  className="text-4xl animate-spin-slow"
                                >
                                  🎁
                                </motion.div>
                                <span className="font-black text-white text-sm drop-shadow">SCRATCH HERE!</span>
                                <span className="text-[10px] text-white/80 font-bold">Card {cardNum}</span>
                              </div>
                              {/* Hidden text underneath */}
                              <span className="text-3xl">🎁</span>
                              <span className="font-bold text-amber-700 text-sm">Reward!</span>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                                <Gift className="w-6 h-6 text-slate-500" />
                              </div>
                              <span className="font-bold text-slate-400 text-sm">Card {cardNum}</span>
                            </>
                          )}
                        </motion.button>
                      );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Scratch Card Action View */}
      <AnimatePresence>
        {activeScratchCard && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed inset-0 z-[100] bg-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#1a362d] text-white px-4 py-4 flex items-center gap-4 shadow-md shrink-0">
              <button
                onClick={() => goBackWithAd(() => setActiveScratchCard(null))}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-medium">Scratch Card</h3>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-8 flex items-center justify-center flex-col gap-6">

              {/* Scratch Area */}
              <motion.button
                whileHover={activeScratchCard.isRevealed ? {} : { scale: 1.02 }}
                whileTap={activeScratchCard.isRevealed ? {} : { scale: 0.98 }}
                onClick={async () => {
                  if (activeScratchCard.isRevealed || isLoading) return;
                  setIsLoading(true);
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_BASE}/api/earning/scratch-claim`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setBalance(data.balance);
                      if (data.coins !== undefined) setCoins(data.coins);
                      if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                      setScratchStatus({ lastScratchDate: data.lastScratchDate, count: data.count });
                      setActiveScratchCard(prev => ({ ...prev, isRevealed: true, reward: data.reward }));
                    } else {
                      alert(data.message || 'Failed to scratch.');
                    }
                  } catch (err) {
                    alert('Network error.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={activeScratchCard.isRevealed || isLoading}
                className="relative w-full max-w-sm aspect-square max-h-[350px] overflow-hidden rounded-md shadow-sm border border-slate-300 bg-emerald-700"
              >
                {/* The Revealed Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#348756] p-6 text-center text-white">
                  <div className="relative z-20 flex flex-col items-center drop-shadow-lg scale-125 my-4">
                    <span className="text-6xl font-black leading-none">{activeScratchCard.reward || '?'}</span>
                    <span className="text-2xl font-bold leading-none mt-1">Coins</span>
                  </div>
                  {activeScratchCard.isRevealed && (
                    <div className="text-xs font-bold text-white uppercase tracking-widest mt-8 bg-black/30 px-4 py-2 rounded-full">
                      Successfully Claimed!
                    </div>
                  )}
                </div>

                {/* The Cover (animated away when revealed) */}
                <AnimatePresence>
                  {!activeScratchCard.isRevealed && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 z-10 bg-[#c53232] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                    >
                       {/* Text shadow/cut effect in center */}
                       <div className="relative z-20 flex flex-col items-center drop-shadow-lg">
                          <span className="text-4xl font-black text-white/90 leading-none mb-2">SCRATCH</span>
                          <span className="text-4xl font-black text-white/90 leading-none">HERE!</span>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <BigAdBanner />

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz View */}
      <AnimatePresence>
        {showQuizView && quizQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-100 dark:bg-slate-900 w-full max-w-md h-full sm:h-auto sm:max-h-[95vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-[#1a362d] text-white px-4 py-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => goBackWithAd(() => { setShowQuizView(false); setQuizTimerActive(false); })}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-medium">{quizType === 'math' ? 'Math Quiz' : quizType === 'binary' ? 'Binary Quiz' : quizType === 'word' ? 'Word Quiz' : 'Trivia Quiz'}</h3>
              </div>
              {/* Timer Circle */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={`${(quizTimer / 30) * 125.66} 125.66`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{quizTimer}</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center gap-5">

              {/* Question Card */}
              <div className="w-full max-w-lg bg-gradient-to-br from-[#2d8a5e] to-[#1a6b42] rounded-2xl p-8 shadow-lg">
                <p className="text-white text-center text-3xl sm:text-4xl font-black leading-tight">
                  {quizQuestion.question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="w-full max-w-lg space-y-3">
                {quizQuestion.options.map((option, idx) => {
                  const isCorrect = option === quizQuestion.answer;
                  const isSelected = quizSelected === option;
                  let optionStyle = 'bg-white dark:bg-slate-800 border-2 border-[#2d8a5e]/30 text-slate-800 dark:text-white hover:border-[#2d8a5e]';

                  if (quizAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-green-100 dark:bg-green-900/40 border-2 border-green-500 text-green-800 dark:text-green-300';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-red-100 dark:bg-red-900/40 border-2 border-red-500 text-red-800 dark:text-red-300';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-[#2d8a5e]/10 border-2 border-[#2d8a5e] text-[#2d8a5e] dark:text-emerald-300 shadow-md';
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={quizAnswered ? {} : { scale: 1.02 }}
                      whileTap={quizAnswered ? {} : { scale: 0.98 }}
                      disabled={quizAnswered}
                      onClick={() => setQuizSelected(option)}
                      className={`w-full py-4 px-6 rounded-full text-center text-lg font-semibold transition-all ${optionStyle}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!quizAnswered ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={quizSelected === null || isLoading}
                  onClick={async () => {
                    if (quizSelected === null) return;
                    setQuizAnswered(true);
                    setQuizTimerActive(false);
                    const correct = quizSelected === quizQuestion.answer;
                    if (correct) {
                      setQuizScore(prev => prev + 1);
                      // Claim reward from backend
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE}/api/earning/quiz-claim`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await response.json();
                        if (response.ok) {
                          setBalance(data.balance);
                          if (data.coins !== undefined) setCoins(data.coins);
                          if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                          setQuizStatus({ lastQuizDate: data.lastQuizDate, count: data.count });
                        }
                      } catch (err) {
                        console.error('Quiz claim error:', err);
                      }
                    }
                  }}
                  className={`w-full max-w-lg py-4 rounded-full text-lg font-black shadow-lg transition-all ${
                    quizSelected === null
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500'
                  }`}
                >
                  Submit
                </motion.button>
              ) : (
                <div className="w-full max-w-lg text-center space-y-3">
                  <p className={`text-xl font-black ${quizSelected === quizQuestion.answer ? 'text-green-600' : 'text-red-500'}`}>
                    {quizSelected === quizQuestion.answer ? '🎉 Correct! +20 Coins' : `❌ Wrong! Answer: ${quizQuestion.answer}`}
                  </p>
                  {quizStatus.count < 10 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startNewQuiz(quizType)}
                      className="w-full py-4 rounded-full text-lg font-black bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg hover:from-teal-400 hover:to-emerald-400"
                    >
                      Next Question →
                    </motion.button>
                  )}
                </div>
              )}

              {/* Bottom Controls */}
              <div className="w-full max-w-lg flex items-center justify-between mt-4">
                <button
                  onClick={() => { goBackWithAd(() => { setShowQuizView(false); setQuizTimerActive(false); }); }}
                  className="px-6 py-3 rounded-full border-2 border-red-400 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Leave Game
                </button>
                <div className="px-6 py-3 rounded-full bg-[#2d8a5e] text-white font-bold">
                  Score: {quizScore}
                </div>
              </div>

              {/* Progress */}
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-4 text-center pb-8 sm:pb-0">
                {quizStatus.count}/10 quizzes completed today
              </p>
              <div className="w-full flex justify-center">
                <BigAdBanner />
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Checkin Pre-Ad View */}
      <AnimatePresence>
        {showCheckinView && !showAdOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
               <div className="bg-slate-50 dark:bg-slate-900 px-8 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Daily Checkin</h3>
                  <button onClick={() => goBackWithAd(() => setShowCheckinView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                     <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="p-8 space-y-8">
                  <div className="text-center space-y-2">
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Watch 2 ads every 2 hours to earn Coins!</p>
                     <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${checkinStatus.count >= 1 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${checkinStatus.count >= 2 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     {checkinStatus.count < 1 && (
                        <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={startAd}
                           className="flex flex-col items-center gap-4 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl group shadow-sm hover:shadow-md transition-all"
                        >
                           <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                              <Film className="w-8 h-8" />
                           </div>
                           <span className="font-bold text-orange-700 dark:text-orange-400">Ad 1</span>
                        </motion.button>
                     )}

                     {checkinStatus.count < 2 && (
                        <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={startAd}
                           className="flex flex-col items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl group shadow-sm hover:shadow-md transition-all"
                        >
                           <div className="bg-blue-500 text-white p-4 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                              <Film className="w-8 h-8" />
                           </div>
                           <span className="font-bold text-blue-700 dark:text-blue-400">Ad 2</span>
                        </motion.button>
                     )}

                     {checkinStatus.count >= 2 && (
                        <div className="col-span-2 text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                           <p className="text-green-600 dark:text-green-400 font-bold">Both ads completed! 🎉</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Overlay Removed - Using Real AdMob */}

      {/* Gen. Knowledge Quiz Modal */}
      <AnimatePresence>
        {showGkQuizView && gkQuizQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-6 h-6" /> Gen. Knowledge
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-white font-bold bg-black/20 px-3 py-1 rounded-full text-sm">
                    {currentGkIndex + 1} / 10
                  </div>
                  <button onClick={() => goBackWithAd(() => setShowGkQuizView(false))} className="text-white/70 hover:text-white text-xl font-bold">✕</button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-amber-100 dark:bg-amber-900/30">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${((currentGkIndex + 1) / 10) * 100}%` }}
                />
              </div>

              <div className="p-6 flex flex-col gap-5">
                <p className="text-center text-slate-500 dark:text-slate-400 font-semibold text-sm">
                  Who is this athlete? 🏆
                </p>

                {/* Athlete Image */}
                <div className="flex justify-center">
                  <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-600 ring-4 ring-amber-200 dark:ring-amber-800">
                    <img
                      src={gkQuizQuestions[currentGkIndex].image}
                      alt="Athlete"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gkQuizQuestions[currentGkIndex].answer)}&size=200&background=f59e0b&color=fff&bold=true`;
                      }}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                  {gkQuizQuestions[currentGkIndex].options.map((option, idx) => {
                    const isCorrect = gkAnswered && option === gkQuizQuestions[currentGkIndex].answer;
                    const isWrong = gkAnswered && gkSelected === option && option !== gkQuizQuestions[currentGkIndex].answer;

                    let btnClass = "px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 text-center ";
                    if (!gkAnswered) {
                      btnClass += "bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 dark:bg-slate-700/50 dark:border-slate-600 dark:hover:border-amber-500 dark:text-slate-200";
                    } else if (isCorrect) {
                      btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-400 dark:text-green-100 scale-[1.03] shadow-sm";
                    } else if (isWrong) {
                      btnClass += "bg-red-100 border-red-400 text-red-700 dark:bg-red-900/40 dark:border-red-400 dark:text-red-200";
                    } else {
                      btnClass += "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 opacity-60";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleGkAnswer(option)}
                        disabled={gkAnswered}
                        className={btnClass}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Score footer */}
                <div className="text-center text-xs text-slate-400 font-medium">
                  Score: {gkQuizScore} / {currentGkIndex} correct &nbsp;•&nbsp; Need 5+ to earn 40 Coins
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Container */}
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 md:rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">

        {/* Top Header - Points & Balance only */}
        <div className="bg-[#1f2937] dark:bg-slate-950 text-white px-2 py-2 sm:px-6 sm:py-4 flex justify-center items-center border-b border-slate-800 gap-1 sm:gap-3">

            {/* Premium IP Indicator - Added before Coins */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowPremiumIPView(true); setIpStep(1); }}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 border shadow-sm transition-all ${
                isPremium 
                  ? "bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30" 
                  : "bg-slate-800/80 hover:bg-slate-700 border-slate-700"
              }`}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                isPremium ? "bg-amber-400" : "bg-slate-700"
              }`}>
                <Shield className={`w-3 h-3 sm:w-4 sm:h-4 ${isPremium ? "text-amber-900" : "text-slate-400"}`} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start pr-1">
                 <span className={`text-[10px] sm:text-[12px] font-black leading-none ${
                   isPremium ? "text-amber-300" : "text-slate-300"
                 }`}>
                   Premium IP
                 </span>
              </div>
            </motion.button>

            {/* Points Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCoinsDetails(true)}
              className="bg-slate-800/80 hover:bg-slate-700 px-2 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 border border-slate-700 shadow-sm transition-colors"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start pr-1">
                 <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold leading-none mb-0.5">Coins</span>
                 <span className="text-[11px] sm:text-[13px] font-black text-emerald-400 leading-none">{coins.toLocaleString()}</span>
              </div>
            </motion.button>

            {/* Balance Display */}
            <motion.div
              layout
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              onTap={() => setIsHovered(!isHovered)}
              className="bg-white/10 px-2 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center relative overflow-hidden min-w-[90px] sm:min-w-[120px] justify-between border border-white/20 transition-colors hover:bg-white/20 cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {!isHovered ? (
                  <motion.div
                    layout
                    key="balance-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 sm:gap-2 w-full"
                  >
                     <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                       <span className="text-black text-[10px] sm:text-xs font-black">৳</span>
                     </div>
                     <span className="text-xs sm:text-sm font-bold">Balance</span>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    key="balance-value"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center flex-row-reverse justify-between w-full"
                  >
                     <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                       <span className="text-black text-[10px] sm:text-xs font-black">৳</span>
                     </div>
                     <span className="text-xs sm:text-sm font-bold text-yellow-400">
                       ৳{balance.toLocaleString()}
                     </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 bg-white dark:bg-slate-900">

        {/* ─── WALLET TAB ─── */}
        {activeEarningTab === 'wallet' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h2 className="text-xl font-black text-slate-800 dark:text-white">Wallet</h2>
            </div>
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-2xl border border-slate-700/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-purple-600/10" />
              <div className="relative">
                <p className="text-slate-400 text-sm font-medium mb-1">Available Balance</p>
                <p className="text-4xl font-black text-white mb-1">৳ {balance.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">Minimum withdrawal: <span className="text-amber-400 font-bold">1,000 ৳</span></p>
              </div>
              {withdrawSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute bottom-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Check className="w-3 h-3" /> Withdrawal Requested!
                </motion.div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Withdrawal Amount (৳)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">৳</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="Minimum 1,000 ৳"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-lg focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Account Phone Number</label>
              <input
                type="tel"
                value={withdrawPhone}
                onChange={e => setWithdrawPhone(e.target.value)}
                placeholder="01X XXXX XXXX"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {withdrawMethods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => m.available && setWithdrawMethod(m.id)}
                    disabled={!m.available}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                      !m.available
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed'
                        : withdrawMethod === m.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md shadow-brand-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-400'
                    }`}
                  >
                    {!m.available && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">Not Available</span>
                    )}
                    {m.logo ? (
                      <img src={m.logo} alt={m.name} className="h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    <span className={`text-xs ${!m.available ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{m.name}</span>
                    {withdrawMethod === m.id && <Check className="absolute top-2 right-2 w-4 h-4 text-brand-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-black text-base shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {withdrawLoading ? (
                <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Processing...</span>
              ) : 'Request Withdrawal'}
            </motion.button>

            <p className="text-center text-xs text-slate-400">Withdrawals are processed within 1–3 business days. Secure and encrypted.</p>
          </div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {activeEarningTab === 'history' && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="font-black text-slate-800 dark:text-white text-lg">Withdrawal History</h3>
            </div>

            <div className="space-y-3">
              {demoWithdrawHistory.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 text-white font-black text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{blurPhone(item.phone)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.date} • {item.method}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-800 dark:text-white">৳{item.amount.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}>{item.status === 'completed' ? 'Completed' : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 pt-2">Showing demo data. Real transactions will appear here once live.</p>
          </div>
        )}

        {/* ─── TUTORIAL TAB ─── */}
        {activeEarningTab === 'tutorial' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="font-black text-slate-800 dark:text-white text-lg">Tutorial</h3>
            </div>

            {/* Video Ad Placeholder - populated from Admin Panel */}
            <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-purple-900/20" />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="text-white font-bold text-base">Tutorial Video</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
              <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">📹 Official video guide for the Zenvio ecosystem.</p>
            </div>
          </div>
        )}

        {/* ─── MY REWARDS TAB (existing content) ─── */}
        {activeEarningTab === 'rewards' && (
          <>

          {/* Featured Row: Daily Checkin + Refer */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto px-2">
            {mainOptions.map((item) => (
              <OptionCard key={'feat-' + item.id} item={item} />
            ))}
          </div>

          {/* ═══════ LEVEL 1 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay when not Premium - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">1</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 1</h3>
                  <p className="text-[11px] text-slate-400 font-medium">0 — 1,500 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-amber-400/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 md:gap-6 justify-items-center">
                {[
                  { id: 'l1-article', name: 'Articles', icon: <Newspaper className="w-7 h-7" />, coins: 15, color: 'from-blue-400 to-indigo-500', action: () => setShowArticleView(true) },
                  { id: 'l1-videos', name: 'Videos', icon: <Video className="w-7 h-7" />, coins: 25, color: 'from-purple-400 to-pink-500', action: () => { setVideoType('video'); setShowVideoView(true); }, count: videoStatus.count, maxCount: 5 },
                  { id: 'l1-games', name: 'Games', icon: <Gamepad2 className="w-7 h-7" />, coins: 50, color: 'from-emerald-400 to-teal-500', action: () => setShowGamesView(true) },
                  { id: 'l1-wheel', name: 'Fortune Wheel', icon: <Aperture className="w-7 h-7" />, coins: null, color: 'from-amber-400 to-orange-500', action: () => setShowWheelView(true) },
                  { id: 'l1-ads', name: 'View Ads', icon: <MonitorPlay className="w-7 h-7" />, coins: 10, color: 'from-sky-400 to-cyan-500', action: () => { setVideoType('view_ads'); setShowVideoView(true); }, count: viewAdsStatus.count, maxCount: 5 },
                ].map(item => <OptionCard key={item.id} item={item} count={item.count} maxCount={item.maxCount} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <div className="w-full max-w-4xl mx-auto border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-slate-600 text-white text-[10px] px-3 py-1 font-bold rounded-bl-xl">Ad</span>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="text-blue-500 font-bold text-lg">Nice job!</span>
              <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">This is a 320x50 test ad.</span>
            </div>
          </div>

          {/* ═══════ LEVEL 2 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay for Level 2 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">2</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 2</h3>
                  <p className="text-[11px] text-slate-400 font-medium">1,500 — 3,500 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-sky-400/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 md:gap-5 justify-items-center">
                {[
                  { id: 'l2-scratch', name: 'Scratch Card', icon: <Gift className="w-7 h-7" />, coins: null, color: 'from-rose-400 to-pink-500', action: () => setShowScratchView(true) },
                  { id: 'l2-quiz', name: 'Quizzes', icon: <HelpCircle className="w-7 h-7" />, coins: 20, color: 'from-violet-400 to-purple-500', action: () => setShowQuizSelection(true) },
                  { id: 'l2-daily-quiz', name: 'Daily Quiz', icon: <HelpCircle className="w-7 h-7" />, coins: 50, color: 'from-amber-500 to-orange-600', action: () => setShowQuizSelection(true) },
                  { id: 'l2-math', name: 'Math Quiz', icon: <Calculator className="w-7 h-7" />, coins: 20, color: 'from-blue-500 to-indigo-600', action: () => launchQuiz('math') },
                  { id: 'l2-binary', name: 'Binary Quiz', icon: <Binary className="w-7 h-7" />, coins: 30, color: 'from-purple-500 to-pink-600', action: () => launchQuiz('binary') },
                  { id: 'l2-word', name: 'Word Quiz', icon: <Type className="w-7 h-7" />, coins: 25, color: 'from-emerald-500 to-teal-600', action: () => launchQuiz('word') },
                  { id: 'l2-gk', name: 'Gen. Knowledge', icon: <HelpCircle className="w-7 h-7" />, coins: 40, color: 'from-amber-500 to-orange-600', action: () => launchQuiz('gk') },
                ].map(item => <OptionCard key={item.id} item={item} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <div className="w-full max-w-2xl mx-auto border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-slate-600 text-white text-[10px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
            <div className="flex items-center gap-4">
              <span className="text-blue-500 font-bold text-sm">Nice job!</span>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">This is a 468x60 test ad.</span>
            </div>
          </div>

          {/* ═══════ LEVEL 3 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay Level 3 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">3</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 3</h3>
                  <p className="text-[11px] text-slate-400 font-medium">3,500 — 6,000 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-emerald-400/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6 justify-items-center">
                {[
                  { id: 'l3-youtube', name: 'YouTube', logo: 'https://img.icons8.com/color/96/youtube-play.png', coins: 30, color: 'from-red-500 to-rose-600', action: () => openMultiAdView({ key: 'youtube', name: 'YouTube', adType: 'rewarded', coins: 30, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-red-500 to-rose-600' }) },
                  { id: 'l3-tiktok', name: 'TikTok', logo: 'https://img.icons8.com/color/96/tiktok.png', coins: 25, color: 'from-slate-800 to-slate-900', action: () => openMultiAdView({ key: 'tiktok', name: 'TikTok', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/tiktok.png', color: 'from-slate-800 to-slate-900' }) },
                  { id: 'l3-facebook', name: 'Facebook', logo: 'https://img.icons8.com/color/96/facebook-new.png', coins: 20, color: 'from-blue-500 to-blue-700', action: () => openMultiAdView({ key: 'facebook', name: 'Facebook', adType: 'rewarded', coins: 20, logo: 'https://img.icons8.com/color/96/facebook-new.png', color: 'from-blue-500 to-blue-700' }) },
                ].map(item => <OptionCard key={item.id} item={item} count={getMultiAdCount(item.id.replace('l3-',''))} maxCount={5} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <div className="w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
            <div className="flex items-center gap-4">
              <span className="text-blue-500 font-bold text-sm">Nice job!</span>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">This is a 468x60 test ad.</span>
            </div>
          </div>

          {/* ═══════ LEVEL 4 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay Level 4 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">4</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 4</h3>
                  <p className="text-[11px] text-slate-400 font-medium">6,000 — 10,000 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4 justify-items-center">
                {[
                  { id: 'l4-reward-video', name: 'Reward Video', logo: 'https://img.icons8.com/color/96/youtube-play.png', coins: 25, color: 'from-red-500 to-rose-600', action: () => openMultiAdView({ key: 'reward_video', name: 'Reward Video', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-red-500 to-rose-600' }) },
                  { id: 'l4-interstitial', name: 'Interstitial Ad', logo: 'https://img.icons8.com/color/96/google-ads.png', coins: 15, color: 'from-blue-500 to-indigo-600', action: () => openMultiAdView({ key: 'interstitial_ad', name: 'Interstitial Ad', adType: 'interstitial', coins: 15, logo: 'https://img.icons8.com/color/96/google-ads.png', color: 'from-blue-500 to-indigo-600' }) },
                  { id: 'l4-native', name: 'Native Ad Click', logo: 'https://img.icons8.com/color/96/facebook-new.png', coins: 10, color: 'from-indigo-500 to-blue-600', action: () => openMultiAdView({ key: 'native_ad', name: 'Native Ad Click', adType: 'native', coins: 10, logo: 'https://img.icons8.com/color/96/facebook-new.png', color: 'from-indigo-500 to-blue-600' }) },
                  { id: 'l4-bonus', name: 'Bonus Ad', logo: 'https://img.icons8.com/color/96/gift.png', coins: 30, color: 'from-amber-400 to-orange-500', action: () => openMultiAdView({ key: 'bonus_ad', name: 'Bonus Ad', adType: 'rewarded', coins: 30, logo: 'https://img.icons8.com/color/96/gift.png', color: 'from-amber-400 to-orange-500' }) },
                  { id: 'l4-hourly', name: 'Hourly Ad', logo: 'https://img.icons8.com/color/96/hourglass.png', coins: 20, color: 'from-teal-400 to-emerald-500', action: () => openMultiAdView({ key: 'hourly_ad', name: 'Hourly Ad', adType: 'interstitial', coins: 20, logo: 'https://img.icons8.com/color/96/hourglass.png', color: 'from-teal-400 to-emerald-500' }) },
                  { id: 'l4-weekly-refer', name: 'Weekly Refer', logo: 'https://img.icons8.com/color/96/conference-call.png', coins: 100, color: 'from-purple-400 to-pink-500', action: () => openMultiAdView({ key: 'weekly_refer', name: 'Weekly Refer', adType: 'rewarded', coins: 100, logo: 'https://img.icons8.com/color/96/conference-call.png', color: 'from-purple-400 to-pink-500' }) },
                  { id: 'l4-surprise', name: 'Surprise Bonus', logo: 'https://img.icons8.com/color/96/confetti.png', coins: 50, color: 'from-pink-400 to-rose-500', action: () => openMultiAdView({ key: 'surprise_bonus', name: 'Surprise Bonus', adType: 'rewarded', coins: 50, logo: 'https://img.icons8.com/color/96/confetti.png', color: 'from-pink-400 to-rose-500' }) },
                ].map(item => <OptionCard key={item.id} item={item} count={getMultiAdCount(item.id.replace('l4-','').replace(/-/g,'_'))} maxCount={5} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <div className="w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
            <div className="flex items-center gap-4">
              <span className="text-blue-500 font-bold text-sm">Nice job!</span>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">This is a 468x60 test ad.</span>
            </div>
          </div>

          {/* ═══════ LEVEL 5 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay Level 5 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">5</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 5</h3>
                  <p className="text-[11px] text-slate-400 font-medium">10,000+ Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-rose-500/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 justify-items-center">
                {[
                  { id: 'l5-rik-survey', name: 'Rik Survey', logo: 'https://img.icons8.com/color/96/survey.png', coins: 50, color: 'from-sky-400 to-blue-500', action: () => handleAdOptionClick('Rik Survey', 'Offerwall', 50) },
                  { id: 'l5-web-reg', name: 'Website Reg.', logo: 'https://img.icons8.com/color/96/domain.png', coins: 30, color: 'from-violet-400 to-purple-500', action: () => handleAdOptionClick('Website Registration', 'Offerwall', 30) },
                  { id: 'l5-email', name: 'Email Submit', logo: 'https://img.icons8.com/color/96/email.png', coins: 20, color: 'from-orange-400 to-red-500', action: () => handleAdOptionClick('Email Submit', 'Offerwall', 20) },
                  { id: 'l5-app', name: 'App Install', logo: 'https://img.icons8.com/color/96/google-play.png', coins: 40, color: 'from-emerald-400 to-green-500', action: () => handleAdOptionClick('App Install', 'Offerwall', 40) },
                  { id: 'l5-affiliate', name: 'Affiliate Market', logo: 'https://img.icons8.com/color/96/merchant-account.png', coins: 75, color: 'from-amber-400 to-yellow-500', action: () => handleAdOptionClick('Affiliate Market', 'Offerwall', 75) },
                  { id: 'l5-trial', name: 'Trial Signup', logo: 'https://img.icons8.com/color/96/key.png', coins: 60, color: 'from-rose-400 to-pink-500', action: () => handleAdOptionClick('Trial Signup', 'Offerwall', 60) },
                ].map(item => <OptionCard key={item.id} item={item} />)}
              </div>
            </div>
          </div>

          {/* Level Progress Overview Card */}
          <div className="max-w-5xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowLevelView(true)}
              className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-400/20 rounded-2xl p-4 md:p-6 flex items-center gap-4 transition-all hover:border-amber-400/40"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <span className="font-black text-white text-lg">{levelInfo.level}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{levelInfo.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">
                    {levelInfo.isMax ? 'MAX' : `${Math.round(progressPercent)}%`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500 shrink-0" />
            </motion.button>
          </div>

          {/* My Rewards */}
          <div className="space-y-6 max-w-5xl mx-auto">
            <h3 className="text-center md:text-left font-bold text-slate-800 dark:text-slate-200 text-xl md:text-2xl">My Rewards</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-14">
              {rewardOptions.map((item) => (
                <div key={'reward-' + item.id} className="w-24 md:w-32">
                  <OptionCard item={item} isLarge />
                </div>
              ))}
            </div>
          </div>

          {/* Large Monster Ad 300x250 */}
          <div className="w-full max-w-md mx-auto border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner relative overflow-hidden text-center gap-6">
            <span className="absolute top-0 right-0 bg-slate-700 text-white text-[10px] px-3 py-1 font-bold rounded-bl-xl">Ad</span>
            <div className="relative">
              <motion.div
                className="w-32 h-32 bg-rose-100 rounded-full flex items-center justify-center animate-float"
              >
                <img src="https://img.icons8.com/color/144/monster.png" alt="Ad Character" className="w-24 h-24" />
              </motion.div>
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Nice job!
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">This is a 300x250 test ad.</p>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                 <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" className="w-5 h-5 opacity-50" />
                 <span>Google AdMob</span>
              </div>
            </div>
          </div>

          {/* Custom Modals Down Here */}
          {/* Interstitial Ad / Rewarded Video Modal */}
          <AnimatePresence>
            {showInterstitialAd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4"
              >
                {/* Simulated close/timer area */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <div className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {currentAdInfo.time > 0 ? `Reward in ${currentAdInfo.time}s` : 'Reward Ready!'}
                  </div>
                  {currentAdInfo.time === 0 && (
                    <button onClick={() => setShowInterstitialAd(false)} className="bg-white/20 backdrop-blur w-7 h-7 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/40">
                      <span className="text-white text-xs font-bold">X</span>
                    </button>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-blue-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                    <MonitorPlay className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white">{currentAdInfo.name} ({currentAdInfo.type})</h2>
                  <p className="text-slate-400 max-w-sm mx-auto">This is a simulated AdMob {currentAdInfo.type}. Keep viewing to receive your {currentAdInfo.coins} Coins reward.</p>

                  {currentAdInfo.time === 0 && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                      className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
                    >
                      {isLoading ? 'Claiming...' : `Claim ${currentAdInfo.coins} Coins`}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Native Ad Modal */}
          <AnimatePresence>
            {showNativeAd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
              >
                <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm p-4 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>

                  <div className="flex gap-3 mt-2">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                       <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight leading-tight mb-1">{currentAdInfo.name} Native Preview</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">This simulates an inline Native Ad experience. Wait {currentAdInfo.time}s to interact.</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                     <MonitorPlay className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  </div>
                  
                  {currentAdInfo.time > 0 ? (
                    <div className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-lg text-center font-bold text-sm">
                      Please wait {currentAdInfo.time}s...
                    </div>
                  ) : (
                    <button
                      disabled={isLoading} 
                      onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                      className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-center font-bold text-sm transition-colors shadow-lg"
                    >
                      {isLoading ? 'Claiming...' : `Install & Claim ${currentAdInfo.coins} Coins`}
                    </button>
                  )}
                  {currentAdInfo.time === 0 && (
                     <button onClick={() => setShowNativeAd(false)} className="mt-2 w-full text-center text-[10px] bg-transparent text-slate-400 underline">Dismiss</button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offerwall Ad Modal (For Surveys, Regs etc.) */}
          <AnimatePresence>
            {showOfferwallAd && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[200] bg-slate-100 dark:bg-slate-900 flex flex-col"
              >
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                  <button onClick={() => setShowOfferwallAd(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-slate-800 dark:text-white">{currentAdInfo.name} - Offer Details</h3>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                  <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 text-center mt-8">
                     <div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <Gift className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                     </div>
                     <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2">{currentAdInfo.name}</h2>
                     <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                        Complete this {currentAdInfo.type.toLowerCase()} exactly as instructed to automatically receive your coins. 
                        Usually takes 2-3 minutes.
                     </p>
                     
                     <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-8 text-left border border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Instructions:</h4>
                        <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                           <li>Click the button below to start the task.</li>
                           <li>Follow all steps correctly on the destination page.</li>
                           <li>For surveys, answer honestly to avoid disqualification.</li>
                           <li>Once finished, come back here to claim your reward.</li>
                        </ol>
                     </div>
                     
                     {currentAdInfo.time > 0 ? (
                        <div className="font-bold text-slate-400 dark:text-slate-500">
                           Verifying session details... {currentAdInfo.time}s
                        </div>
                     ) : (
                        <div className="flex flex-col gap-3">
                          <button
                            disabled={isLoading} 
                            onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 w-full"
                          >
                            {isLoading ? 'Processing...' : `Complete Task (+${currentAdInfo.coins} Coins)`}
                          </button>
                        </div>
                     )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          </>
        )}

        </div>
      </div>
    </main>
  );
};

export default EarningPage;
