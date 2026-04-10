import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AdMobService } from '../utils/admob';
import { API_BASE } from '../config';
import MultiAdViewPage from './MultiAdViewPage';
import { 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  Medal, 
  Wallet, 
  Shield, 
  Globe, 
  Gift, 
  Flame, 
  Film, 
  X, 
  Crown, 
  AlertCircle,
  History,
  TrendingUp,
  Star,
  Calculator, 
  Binary, 
  Type, 
  HelpCircle,
  Users,
  CalendarCheck,
  Newspaper, 
  Video, 
  BookOpen,
  Aperture, 
  Search,
  ChevronDown, 
  ChevronUp, 
  Menu, 
  Home, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Radio, 
  Tv,
  RefreshCw,
  Gamepad2,
  MonitorPlay,
  Music2,
  Zap,
  Pointer,
  Hash,
  Facebook,
  Youtube,
  Mail,
  Download,
  ClipboardList,
  ShoppingBag,
  Key
} from 'lucide-react';

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
import PullToRefresh from './PullToRefresh';

const ipPackages = [
  { id: 'month-1', name: '1 Month', price: 600, freeInfo: '7 Days free', label: '1 Month (+7 Days free)' },
  { id: 'month-3', name: '3 Month', price: 1300, freeInfo: '15 Days free', label: '3 Months (+15 Days free)' },
  { id: 'month-6', name: '6 Month', price: 2200, freeInfo: '1 Month free', label: '6 Months (+1 Month free)' },
  { id: 'year-1', name: '1 Year', price: 4200, freeInfo: '2 Month free', bestValue: true, label: '1 Year (+2 Months free)' },
];


const BannerAd468x60 = () => (
  <div className="w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden my-4">
    <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
    <div className="flex items-center gap-4">
      <span className="text-blue-500 font-bold text-sm">SPONSORED</span>
      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">468x60 Banner Ad</span>
    </div>
  </div>
);

const EarningPage = ({ onReferralsClick, setActiveTab }) => {
  const [balance, setBalance] = React.useState(0);
  const [coins, setCoins] = React.useState(0);
  const [lifetimeCoins, setLifetimeCoins] = React.useState(0);
  const [showCoinsDetails, setShowCoinsDetails] = React.useState(false);
  const [showLevelView, setShowLevelView] = React.useState(false);
  const [activeEarningTab, setActiveEarningTab] = React.useState('rewards');
  const isAdLoading = useRef(false);

  const [toast, setToast] = React.useState({ visible: false, message: '', type: 'success' });
  const [refreshing, setRefreshing] = React.useState(false);
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [withdrawPhone, setWithdrawPhone] = React.useState('');
  const [withdrawMethod, setWithdrawMethod] = React.useState('');
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = React.useState(false);

  const blurPhone = (phone = '') => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  };

  const demoWithdrawHistory = [
    { id: 1, name: 'Sayed Muttakin', phone: '01711234567', amount: 1500, method: 'bKash', date: '2025-03-28', status: 'completed' },
    { id: 2, name: 'Rahim Uddin', phone: '01819876543', amount: 2000, method: 'Nagad', date: '2025-03-25', status: 'completed' },
    { id: 3, name: 'Karim Hossain', phone: '01612345678', amount: 1000, method: 'Rocket', date: '2025-03-22', status: 'pending' },
  ];

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 1000) {
      showToast('Minimum withdrawal amount is ৳1,000', 'error');
      return;
    }
    if (!withdrawPhone || withdrawPhone.length < 11) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }
    if (!withdrawMethod) {
      showToast('Please select a payment method', 'error');
      return;
    }
    if (balance < parseFloat(withdrawAmount)) {
      showToast('Insufficient balance', 'error');
      return;
    }
    setWithdrawLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), phone: withdrawPhone, method: withdrawMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawSuccess(true);
        setBalance(data.balance ?? balance);
        showToast('Withdrawal request submitted successfully!', 'success');
        setWithdrawAmount('');
        setWithdrawPhone('');
        setWithdrawMethod('');
        setTimeout(() => setWithdrawSuccess(false), 5000);
      } else {
        showToast(data.message || 'Withdrawal failed. Try again.', 'error');
      }
    } catch (_) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const withdrawMethods = [
    { id: 'bkash', name: 'bKash', logo: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png', available: true },
    { id: 'nagad', name: 'Nagad', logo: 'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png', available: true },
    { id: 'rocket', name: 'Rocket', logo: 'https://freelogopng.com/images/all_img/1656235199rocket-app-logo.png', available: true },
    { id: 'upay', name: 'Upay', logo: 'https://freelogopng.com/images/all_img/1656235105upay-logo.png', available: false },
  ];

  const [showCheckinView, setShowCheckinView] = React.useState(false);

  const [showAdOverlay, setShowAdOverlay] = React.useState(false);
  const [adCountdown, setAdCountdown] = React.useState(40);
  const [canCloseAd, setCanCloseAd] = React.useState(false);
  const [checkinStatus, setCheckinStatus] = React.useState({ lastCheckin: null, count: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [adType, setAdType] = React.useState('daily');

  const [showVideoView, setShowVideoView] = React.useState(false);
  const [videoStatus, setVideoStatus] = React.useState({ lastVideoDate: null, count: 0 });
  const [viewAdsStatus, setViewAdsStatus] = React.useState({ lastAdDate: null, count: 0 });
  const [videoType, setVideoType] = React.useState('video');

  const [showWheelView, setShowWheelView] = React.useState(false);
  const [wheelStatus, setWheelStatus] = React.useState({ lastSpinDate: null, count: 0 });
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [spinReward, setSpinReward] = React.useState(null);

  const [showScratchView, setShowScratchView] = React.useState(false);
  const [scratchStatus, setScratchStatus] = React.useState({ lastScratchDate: null, count: 0 });
  const [activeScratchCard, setActiveScratchCard] = React.useState(null);

  const [showGamesView, setShowGamesView] = React.useState(false);

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

  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [premiumExpiryDate, setPremiumExpiryDate] = React.useState(null);
  const [premiumCountry, setPremiumCountry] = React.useState('');
  const [premiumPackageName, setPremiumPackageName] = React.useState('');
  const [searchCountry, setSearchCountry] = React.useState('');

  const [showGkQuizView, setShowGkQuizView] = React.useState(false);
  const [gkQuizQuestions, setGkQuizQuestions] = React.useState([]);
  const [currentGkIndex, setCurrentGkIndex] = React.useState(0);
  const [gkQuizScore, setGkQuizScore] = React.useState(0);

  // Featured options shown at top (Daily Checkin, Refer)
  const mainOptions = [
    {
      id: 'feat-checkin',
      name: 'Daily Checkin',
      icon: <CalendarCheck className="w-6 h-6" />,
      coins: 5,
      color: 'from-emerald-400 to-teal-400',
      action: () => setShowCheckinView(true)
    },
    {
      id: 'feat-refer',
      name: 'Refer & Earn',
      icon: <Users className="w-6 h-6" />,
      coins: 50,
      color: 'from-amber-400 to-orange-500',
      action: () => { if (typeof onReferralsClick === 'function') onReferralsClick(); else if (typeof setActiveTab === 'function') setActiveTab('referrals'); }
    }
  ];

  const rewardOptions = [
    { id: 'reward-wallet', name: 'Wallet', icon: <Wallet className="w-7 h-7" />, color: 'from-blue-500 to-indigo-600', action: () => setActiveEarningTab('wallet') },
    { id: 'reward-history', name: 'History', icon: <History className="w-7 h-7" />, color: 'from-purple-500 to-pink-600', action: () => setActiveEarningTab('history') },
    { id: 'reward-tutorial', name: 'Tutorial', icon: <BookOpen className="w-7 h-7" />, color: 'from-emerald-500 to-teal-600', action: () => setActiveEarningTab('tutorial') },
  ];
  const [gkSelected, setGkSelected] = React.useState(null);
  const [gkAnswered, setGkAnswered] = React.useState(false);

  const [showArticleView, setShowArticleView] = React.useState(false);
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [articleReadingTime, setArticleReadingTime] = useState(0);
  const [isReadingStarted, setIsReadingStarted] = useState(false);
  const [articleReadCount, setArticleReadCount] = useState(0);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setArticleReadCount(data.dailyCount || 0);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };
  const [articleStep, setArticleStep] = React.useState(1);
  const [showArticleReader, setShowArticleReader] = React.useState(false);
  const [showArticleListView, setShowArticleListView] = React.useState(false);

  const [showInterstitialAd, setShowInterstitialAd] = React.useState(false);
  const [showNativeAd, setShowNativeAd] = React.useState(false);
  const [showOfferwallAd, setShowOfferwallAd] = React.useState(false);
  const [currentAdInfo, setCurrentAdInfo] = React.useState({ name: '', type: '', coins: 0, time: 0 });

  const [globalSettings, setGlobalSettings] = React.useState({
    premiumIpPrice: 600,
    premiumIpDuration: '30 Days',
    bkashNumber: '01700-000000',
    nagadNumber: '01700-000000',
    rocketNumber: '01700-000000',
    premiumIpPackages: [],
    nativeAdsConfig: [
      { id: 'ad-1', name: 'Native Ad Click Ad 1', icon: 'Tv', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-2', name: 'Native Ad Click Ad 2', icon: 'Video', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-3', name: 'Native Ad Click Ad 3', icon: 'Radio', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-4', name: 'Native Ad Click Ad 4', icon: 'Target', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-5', name: 'Native Ad Click Ad 5', icon: 'Zap', coins: 10, quizType: 'math', isActive: true }
    ],
    fortuneWheelConfig: {
      coins: [5, 10, 15, 20, 25, 30, 35, 50],
      adsPerSpin: 1,
      dailyLimit: 10
    },
    promoBanner: { imageUrl: '', linkUrl: '', isActive: false }
  });

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/earning/settings`);
      const data = await res.json();
      if (res.ok && data) {
        setGlobalSettings(prev => ({
          ...prev,
          premiumIpPrice: data.premiumIpPrice || 600,
          premiumIpDuration: data.premiumIpDuration || '30 Days',
          bkashNumber: data.bkashNumber || '01700-000000',
          nagadNumber: data.nagadNumber || '01700-000000',
          rocketNumber: data.rocketNumber || '01700-000000',
          premiumIpPackages: data.premiumIpPackages || [],
          nativeAdsConfig: data.nativeAdsConfig || prev.nativeAdsConfig,
          fortuneWheelConfig: data.fortuneWheelConfig ? {
            ...prev.fortuneWheelConfig,
            ...data.fortuneWheelConfig,
            // Ensure coins array is always valid
            coins: (Array.isArray(data.fortuneWheelConfig.coins) && data.fortuneWheelConfig.coins.length > 0)
              ? data.fortuneWheelConfig.coins
              : prev.fortuneWheelConfig.coins
          } : prev.fortuneWheelConfig,
          promoBanner: data.promoBanner || prev.promoBanner
        }));
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
    }
  };



  const [showIntroScreen, setShowIntroScreen] = React.useState(false);
  const [introSection, setIntroSection] = React.useState(null);

  const [showMultiAdView, setShowMultiAdView] = React.useState(false);
  const [multiAdConfig, setMultiAdConfig] = React.useState(null);

  const getMultiAdCount = (key) => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(`multi_ad_${key}`) || '{"date":"","count":0}');
    if (stored.date !== today) return 0;
    return stored.count;
  };

  const incrementMultiAdCount = (key) => {
    const today = new Date().toDateString();
    const newCount = getMultiAdCount(key) + 1;
    localStorage.setItem(`multi_ad_${key}`, JSON.stringify({ date: today, count: newCount }));
    return newCount;
  };

  const [showPremiumIPView, setShowPremiumIPView] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState(null);
  const [ipStep, setIpStep] = React.useState(1);
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [transactionId, setTransactionId] = React.useState('');
  const [ipSubmitting, setIpSubmitting] = React.useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = React.useState(false);

  React.useEffect(() => {
    let timer;
    if (isPremium && premiumExpiryDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(premiumExpiryDate).getTime();
        const difference = expiry - now;
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        } else {
          setIsPremium(false);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [isPremium, premiumExpiryDate]);


  const [introItem, setIntroItem] = React.useState(null);

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
        setPremiumExpiryDate(data.premiumExpiry || null);
        setPremiumCountry(data.premiumCountry || '');
        setPremiumPackageName(data.premiumPackageName || '');
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchBalance(),
        fetchCheckinStatus(),
        fetchVideoStatus(),
        fetchWheelStatus(),
        fetchScratchStatus(),
        fetchQuizStatus(),
        fetchGlobalSettings()
      ]);
      showToast('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Refresh failed:', error);
      showToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
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
      const videoResp = await fetch(`${API_BASE}/api/earning/video-status?type=video`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const videoData = await videoResp.json();
      if (videoResp.ok) setVideoStatus({ lastVideoDate: videoData.lastAd, count: videoData.count });

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

  const [showStatusOverlay, setShowStatusOverlay] = React.useState(false);
  const [statusData, setStatusData] = React.useState({ name: '', type: 'upcoming' });

  const handleStatusClick = (name, type) => {
    setStatusData({ name, type });
    setShowStatusOverlay(true);
    AdMobService.showInterstitial();
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
    fetchArticles();
    fetchGlobalSettings();
    AdMobService.showBanner();
    return () => {
      AdMobService.hideBanner();
    };
  }, []);

  useEffect(() => {
    if (premiumExpiryDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(premiumExpiryDate).getTime();
        const distance = expiry - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
          setIsPremium(true);
        } else {
          setIsPremium(false);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    } else {
      setIsPremium(false);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, [premiumExpiryDate]);

  // Article Timer Logic
  useEffect(() => {
    let timer;
    if (showArticleReader && isReadingStarted && articleReadingTime > 0) {
      timer = setInterval(() => {
        setArticleReadingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showArticleReader, isReadingStarted, articleReadingTime]);

  const startReadingArticle = (article) => {
    setCurrentArticle(article);
    setArticleReadingTime(article.readingTime || 60);
    setIsReadingStarted(true);
    setShowArticleReader(true);
    setShowArticleListView(false);
  };

  const claimArticleReward = async () => {
    if (articleReadingTime > 0) {
      showToast(`Please wait ${articleReadingTime}s more.`, 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/article-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId: currentArticle._id })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setCoins(data.coins);
        setArticleReadCount(data.dailyCount);
        showToast(`🎉 +${currentArticle.coins} Coins earned!`, 'success');
        setShowArticleReader(false);
        setIsReadingStarted(false);
      } else {
        showToast(data.message || 'Failed to claim reward.', 'error');
      }
    } catch (err) {
      console.error('Error claiming article reward:', err);
      showToast('Network error.', 'error');
    }
  };

  const ArticleListView = () => {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-safe px-6 py-5 flex justify-between items-center shadow-lg shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setShowArticleListView(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <ArrowLeft className="w-6 h-6 text-white" />
             </button>
             <h3 className="text-xl font-bold text-white">Daily Articles</h3>
          </div>
          <div className="bg-white/20 px-4 py-1.5 rounded-full border border-white/20">
             <span className="text-white font-black text-sm">{articleReadCount}/5 Today</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-blue-900 dark:text-blue-200 font-bold text-sm">Read & Earn Coins</p>
              <p className="text-blue-700 dark:text-blue-400 text-xs">Tap each card to read an article and earn coins.</p>
            </div>
          </div>

          <div className="space-y-4">
            {articles.length > 0 ? (
              articles.map((art, idx) => (
                <div key={art._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-black text-slate-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{art.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">+{art.coins} Coins</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {art.readingTime}s
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => startReadingArticle(art)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-black text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-transform"
                  >
                    READ
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-10">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <BookOpen className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-400 font-bold">No articles available yet.</p>
                <p className="text-slate-500 text-xs mt-1">Check back later for new content!</p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <BannerAd468x60 />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const ArticleReader = () => {
    if (!currentArticle) return null;
    
    // Split content by double new lines for paragraphs
    const paragraphs = currentArticle.content.split(/\n\n|\r\n\r\n/).filter(p => p.trim() !== '');

    return createPortal(
      <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col w-full overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-safe px-6 py-4 flex justify-between items-center shrink-0">
          <button onClick={() => setShowArticleReader(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-slate-500" />
          </button>
          <div className="flex flex-col items-center flex-1 mx-4">
             <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-full border-2 border-brand-500/30 flex items-center justify-center overflow-hidden">
                   <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${((currentArticle.readingTime - articleReadingTime) / currentArticle.readingTime) * 100}%` }} />
                </div>
                <span className="font-black text-slate-800 dark:text-white text-sm">
                  {articleReadingTime > 0 ? `${articleReadingTime}s remaining` : 'Reading Complete!'}
                </span>
             </div>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 sm:p-10 max-w-2xl mx-auto w-full">
           <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
             {currentArticle.title}
           </h1>

           <div className="space-y-6">
             {paragraphs.map((para, idx) => (
               <React.Fragment key={idx}>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
                   {para}
                 </p>
                 {/* Inject 468x60 Banner between paragraphs (every 2nd paragraph) */}
                 {(idx + 1) % 2 === 0 && (
                   <div className="py-4 flex flex-col items-center">
                     <div className="w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
                       <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
                       <div className="flex items-center gap-4">
                         <span className="text-blue-500 font-bold text-sm">SPONSORED</span>
                         <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                         <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">468x60 Banner Ad</span>
                       </div>
                     </div>
                   </div>
                 )}
               </React.Fragment>
             ))}
           </div>

           <div className="mt-12 mb-20">
              <BannerAd468x60 />
           </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center shrink-0">
          <button
            onClick={claimArticleReward}
            disabled={articleReadingTime > 0}
            className={`w-full max-w-sm py-4 rounded-2xl font-black text-lg transition-all transform-gpu shadow-xl ${
              articleReadingTime > 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-95'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white animate-bounce-subtle'
            }`}
          >
            {articleReadingTime > 0 ? `READING... (${articleReadingTime}s)` : 'CLAIM REWARD 🎉'}
          </button>
        </div>
      </div>,
      document.body
    );
  };

  const goBackWithAd = (closeFn) => {
    if (isAdLoading.current) return;
    isAdLoading.current = true;
    AdMobService.showInterstitial(() => {
      isAdLoading.current = false;
      if (closeFn) closeFn();
    });
  };

  const startAd = (type) => {
    const activeType = typeof type === 'string' ? type : 'daily';
    setAdType(activeType);
    let placement = 'rewarded';
    if (activeType === 'daily') placement = 'rewarded_daily';
    if (activeType === 'video') placement = 'rewarded_videos';
    if (activeType === 'view_ads') placement = 'rewarded_view_ads';

    if (isLoading) return;
    setIsLoading(true);

    const onError = (msg) => {
      setIsLoading(false);
      showToast(msg, "error");
    };

    const onDismiss = () => {
      setIsLoading(false);
    };

    AdMobService.showRewarded((rewardItem) => {
      claimReward(activeType);
    }, placement, onError, onDismiss).catch(err => {
      onError("Something went wrong");
    });
  };

  const claimReward = async (typeOverride, onSuccess) => {
    const activeType = typeOverride || adType;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

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
        else if (data.points !== undefined) setCoins(data.points);
        
        if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
        else if (data.lifetimePoints !== undefined) setLifetimeCoins(data.lifetimePoints);
        
        if (activeType === 'view_ads') {
          setViewAdsStatus({ lastAdDate: data.lastAd, count: data.count });
          showToast(`🎉 Congratulations! You earned 10 Coins!`, "success");
        } else if (activeType === 'video') {
          setVideoStatus({ lastVideoDate: data.lastAd, count: data.count });
          showToast(`🎉 Congratulations! You earned 25 Coins!`, "success");
        } else if (activeType === 'daily') {
          setCheckinStatus({ lastCheckin: data.lastCheckin, count: data.count });
          showToast("🎉 Congratulations! You earned 50 Coins!", "success");
        }
        if (onSuccess) onSuccess();
      } else {
        showToast(data.message || "Failed to claim reward.", "error");
      }
    } catch (err) {
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      content: "কিন্তু গফুর মিয়া হাল ছাড়ার লোক না।\nসে আবার নতুন প্ল্যান করল—\n—“মুরগি ব্যাংক খুলবো!”\nগ্রামের লোকজন বলল,\n—“এটা আবার কী জিনিস?”\nগফুর মিয়া বলল,\n—“আপনারা টাকা না রেখে মুরগি জমা রাখবেন। মাস শেষে সুদ হিসেবে ডিম পাবেন!”\nএই আইডিয়া শুনে গ্রামের মানুষ একটু সিরিয়াস হয়ে গেল।\nকারণ—ডিম তো প্রতিদিন দরকার!\nতাই অনেকেই তার “মুরগি ব্যাংক”-এ মুরগি জমা রাখতে শুরু করল."
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
        if (finalScore >= 5) {
          handleVerifiedAdAction("Daily GK Reward", async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${API_BASE}/api/earning/gk-claim`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok) {
                setBalance(data.balance);
                if (data.coins !== undefined) setCoins(data.coins);
                showToast(`🎉 Daily GK completed! You won ${data.reward} Coins!`, "success");
              } else {
                showToast(data.message || 'Failed to claim GK reward.', "error");
              }
            } catch (err) {
              showToast('Network error.', "error");
            }
          });
        } else {
          showToast(`Quiz finished! You scored ${finalScore}/10. You need at least 5 correct to win Coins!`, 'error');
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

  const handleAdOptionClick = async (adName, adType, coins) => {
    if (isLoading) return;
    setCurrentAdInfo({ name: adName, type: adType, coins, time: 0 });
    
    if (adType === 'Rewarded Video' || adType === 'Rewarded Interstitial') {
      setIsLoading(true);
      await AdMobService.showRewarded(() => handleCustomAdReward(coins, adName), 'rewarded');
    } else if (adType === 'App Open Ad') {
      setIsLoading(true);
      await AdMobService.showAppOpenAd(() => handleCustomAdReward(coins, adName));
    } else if (adType === 'Interstitial') {
      setIsLoading(true);
      await AdMobService.showInterstitial(() => handleCustomAdReward(coins, adName));
    } else if (adType === 'Native Ad') {
      setShowNativeAd(true);
      setCurrentAdInfo({ name: adName, type: adType, coins, time: 5 });
      await AdMobService.showNativeSimulatedAd();
    } else {
      setShowOfferwallAd(true);
    }
  };

  const handlePremiumSubmit = async () => {
    if (!selectedPackage || !selectedCountry || !paymentMethod || !transactionId) {
      showToast('Please fill all required fields!', 'error');
      return;
    }
    const pkg = ipPackages.find(p => p.id === selectedPackage);
    const amount = pkg?.price || 0;
    
    setIpSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/earning/premium-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          packageId: selectedPackage,
          packageName: pkg?.name,
          country: selectedCountry,
          paymentMethod,
          transactionId,
          amount
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Order submitted successfully!', 'success');
        setShowPremiumIPView(false);
        setIpStep(1);
        setSelectedPackage(null);
        setSelectedCountry('');
        setPaymentMethod('');
        setTransactionId('');
      } else {
        showToast(data.message || 'Submission failed.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setIpSubmitting(false);
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
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE}/api/earning/task-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ points: pts, name: adName })
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
        if (data.coins !== undefined) setCoins(data.coins);
        showToast(`🎉 You earned ${pts} Coins from ${adName}!`, "success");
      } else {
        showToast(data.message || 'Failed to claim coins.', "error");
      }
    } catch (err) {
      showToast('Network error.', "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showSectionIntro = (section) => {
    setIntroSection(section);
    setShowIntroScreen(true);
  };

  const openMultiAdView = (config) => {
    setMultiAdConfig(config);
    setShowMultiAdView(true);
  };

  const closeSectionIntro = (callback) => {
    setShowIntroScreen(false);
    setTimeout(callback, 300);
  };

  React.useEffect(() => {
    let adTmr;
    if (showNativeAd && currentAdInfo.time > 0) {
      adTmr = setInterval(() => {
        setCurrentAdInfo(prev => {
          if (prev.time - 1 === 0) {
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

  const handleVerifiedAdAction = (title, onVerified) => {
    AdMobService.showInterstitial(() => {
      if (onVerified) onVerified();
    });
  };

  const OptionCard = ({ item, isLarge = false, count = null, maxCount = null, skipIntro = false }) => {
    const isCompleted = count !== null && count >= maxCount;
    const itemsToSkipIntro = ['Premium IP', 'Refer & Earn', 'Wallet', 'History', 'Tutorial', 'Invite Friends', 'Daily Quiz', 'Math Quiz', 'Binary Quiz', 'Word Quiz', 'Meta'];
    const shouldSkip = skipIntro || itemsToSkipIntro.includes(item?.name);

    const handleClick = () => {
      if (shouldSkip || !item.action) {
        if (item.action) item.action();
        return;
      }
      setIntroItem(item);
      setShowIntroScreen(true);
    };

    return (
      <button
        key={item.id}
        onClick={handleClick}
        className="flex flex-col items-center group w-full transition-transform duration-150 active:scale-95 hover:scale-105"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className={`w-14 h-14 md:w-${isLarge ? '20' : '16'} md:h-${isLarge ? '20' : '16'} rounded-2xl bg-gradient-to-br ${item.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg relative`}>
          {typeof item.icon === 'string' ? (
            <img src={item.icon} alt={item.name} className="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-md" />
          ) : React.isValidElement(item.icon) ? (
            <div className="text-white drop-shadow-md flex items-center justify-center">
              {React.cloneElement(item.icon, { 
                className: `${isLarge ? 'w-10 h-10' : 'w-7 h-7'}`,
                strokeWidth: 2.5
              })}
            </div>
          ) : item.logo ? (
            <img src={item.logo} alt={item.name} className="w-8 h-8 md:w-11 md:h-11 object-contain drop-shadow-md" />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg" />
          )}

          {count !== null && (
            <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-800 rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 dark:border-slate-700 min-w-[20px] flex items-center justify-center">
              <span className={`text-[9px] font-black ${isCompleted ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}>
                {count}/{maxCount}
              </span>
            </div>
          )}
        </div>
        <span className="mt-2.5 text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 text-center leading-tight">
          {item.name}
        </span>
        {item.coins && (
          <span className="text-[10px] font-bold text-emerald-500 mt-0.5">
            +{item.coins} Coins
          </span>
        )}
      </button>
    );
  };

  const OptionIntroScreen = () => {
    const [moreOpen, setMoreOpen] = React.useState(false);
    const item = introItem;
    if (!item) return null;

    const bgClass = item.color || 'from-blue-500 to-indigo-600';

    // Determine animation type from item name
    const getAnimType = (name = '') => {
      const n = name.toLowerCase();
      if (n.includes('video') || n.includes('film') || n.includes('mega')) return 'video';
      if (n.includes('spin') || n.includes('wheel') || n.includes('fortune')) return 'spin';
      if (n.includes('scratch')) return 'scratch';
      if (n.includes('checkin') || n.includes('daily')) return 'checkin';
      if (n.includes('quiz') || n.includes('math') || n.includes('binary') || n.includes('word') || n.includes('knowledge')) return 'quiz';
      if (n.includes('refer') || n.includes('invite') || n.includes('friend')) return 'refer';
      if (n.includes('article') || n.includes('read')) return 'article';
      if (n.includes('premium') || n.includes('ip')) return 'premium';
      if (n.includes('game') || n.includes('play')) return 'game';
      return 'generic';
    };
    const animType = getAnimType(item.name);

    // Duration label per type
    const durationLabel = {
      video: '30s (per video)',
      spin: '1 Spin',
      scratch: '1 Scratch',
      checkin: 'Daily',
      quiz: '30s (per question)',
      refer: 'Per Invite',
      article: '60s (per article)',
      premium: 'Monthly',
      game: 'Per Game',
      generic: 'Per Complete',
    }[animType] || 'Per Complete';

    // Emoji icon per type for the big glow circle
    const centerEmoji = {
      video: '🎬',
      spin: '🎡',
      scratch: '🃏',
      checkin: '📅',
      quiz: '🧠',
      refer: '👥',
      article: '📰',
      premium: '💎',
      game: '🎮',
      generic: '🎯',
    }[animType] || '🎯';

    const handlePlay = () => {
      setShowIntroScreen(false);
      setTimeout(() => { if (item.action) item.action(); }, 100);
    };

    return (
      <div className="fixed inset-0 z-[9998] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)' }}>
        {/* Colour tint overlay matching item colour */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-15 pointer-events-none`} />

        {/* Floating ambient dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              background: 'white',
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17 + 10) % 85}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}

        {/* ── Top Bar ── */}
        <div className="relative z-50 flex items-center justify-between px-4 pt-safe py-3">
          <button
            onClick={() => goBackWithAd(() => setShowIntroScreen(false))}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-white font-black text-base tracking-tight">{item.name}</h1>

          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl py-2 w-44 z-50">
                {[
                  { name: 'Home', icon: '🏠', action: () => { setShowIntroScreen(false); setActiveTab('Home'); } },
                  { name: 'Notification', icon: '🔔', action: () => { setShowIntroScreen(false); setActiveTab('Notification'); } },
                  { name: 'Profile', icon: '👤', action: () => { setShowIntroScreen(false); setActiveTab('Profile'); } },
                ].map((link, i) => (
                  <button
                    key={i}
                    onClick={() => { setMoreOpen(false); link.action(); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                  >
                    <span>{link.icon}</span>{link.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Balance Chip ── */}
        <div className="relative z-10 flex justify-center mt-1 mb-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-1.5">
            <span className="text-amber-400 text-base">💰</span>
            <span className="text-white font-black text-sm">৳{balance.toFixed(2)}</span>
            <span className="text-white/30 text-xs">|</span>
            <span className="text-amber-300 text-xs font-bold">{coins} Coins</span>
          </div>
        </div>

        {/* ── Activity Identity Card ── */}
        <div className="relative z-10 mx-4 mb-4 flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center shadow-lg flex-shrink-0`}>
            {typeof item.icon !== 'string' && React.isValidElement(item.icon)
              ? <div className="text-white">{React.cloneElement(item.icon, { className: 'w-6 h-6' })}</div>
              : typeof item.icon === 'string' && item.icon.startsWith('http')
                ? <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain" />
                : <span className="text-2xl">{centerEmoji}</span>
            }
          </div>
          <div>
            <div className="text-white font-black text-sm leading-none">{item.name}</div>
            <div className="text-white/50 text-[10px] font-medium mt-0.5">Earning Activity</div>
          </div>
        </div>

        {/* ── Large Themed Center Icon ── */}
        <div className="relative z-10 flex items-center justify-center mb-6" style={{ minHeight: 160 }}>
          {/* Outer glow ring 1 */}
          <div className={`absolute w-40 h-40 rounded-full bg-gradient-to-br ${bgClass} opacity-10 animate-ping`} style={{ animationDuration: '3s' }} />
          {/* Outer ring 2 */}
          <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-br ${bgClass} opacity-15`} />
          {/* Main icon circle */}
          <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${bgClass} flex items-center justify-center shadow-2xl border-2 border-white/20`}>
            {typeof item.icon !== 'string' && React.isValidElement(item.icon)
              ? <div className="text-white drop-shadow-xl">{React.cloneElement(item.icon, { className: 'w-12 h-12' })}</div>
              : typeof item.icon === 'string' && item.icon.startsWith('http')
                ? <img src={item.icon} alt={item.name} className="w-14 h-14 object-contain drop-shadow-xl" />
                : <span className="text-5xl drop-shadow-xl" style={{ transform: 'translateZ(0)' }}>{centerEmoji}</span>
            }
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="relative z-10 mx-4 space-y-2 mb-4">
          {/* Duration */}
          <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⏱️</span>
            </div>
            <div>
              <div className="text-white font-black text-sm leading-none">
                Duration: <span className="text-blue-400">{durationLabel.split(' ')[0]}</span>
              </div>
              <div className="text-white/50 text-[10px] font-medium mt-0.5">
                {durationLabel.includes('(') ? durationLabel.substring(durationLabel.indexOf('(')) : ''}
              </div>
            </div>
          </div>

          {/* Prize */}
          {item.coins != null && (
            <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🪙</span>
              </div>
              <div>
                <div className="text-white font-black text-sm leading-none">
                  Prize: <span className="text-amber-400">{item.coins} coins</span>
                </div>
                <div className="text-white/50 text-[10px] font-medium mt-0.5">
                  {animType === 'quiz' ? '(per answer)' : animType === 'video' ? '(per video)' : animType === 'refer' ? '(per invite)' : '(upon completion)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Play Button ── */}
        <div className="relative z-10 px-4 pb-4">
          <button
            onClick={handlePlay}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r ${bgClass} text-white font-black text-lg shadow-xl relative overflow-hidden active:scale-95 transition-transform`}
          >
            {/* Shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <span className="relative z-10">
              ▶ {animType === 'article' ? 'Read' : animType === 'refer' ? 'Invite' : animType === 'premium' ? 'Get' : 'Play'} {item.name}
            </span>
          </button>

          {/* Ad Banner */}
          <div className="mt-4 flex flex-col items-center">
            <BigAdBanner />
          </div>
        </div>
      </div>
    );
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
    <>
      {toast.visible && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_8px_30px_rgba(139,92,246,0.3)] font-bold text-sm bg-violet-600 text-white animate-fade-in whitespace-nowrap border border-white/20 backdrop-blur-md">
            <span>{toast.type === 'error' ? '✖' : '🎉'}</span>
            <span>{toast.message}</span>
          </div>
        )}

      {showIntroScreen && introItem && <OptionIntroScreen />}
      
      {showArticleListView && <ArticleListView />}
      {showArticleReader && <ArticleReader />}
      
      {showMultiAdView && multiAdConfig && (
        <MultiAdViewPage
          config={multiAdConfig}
          onClose={() => setShowMultiAdView(false)}
          onCoinsEarned={(amount, label, data) => {
            if (data?.balance !== undefined) setBalance(data.balance);
            if (data?.coins !== undefined) setCoins(data.coins);
            else setCoins(prev => prev + amount);
            showToast(`🎉 +${amount} Coins from ${label}!`, 'success');
          }}
        />
      )}

      {showQuizView && quizQuestion && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
            <div className="bg-[#1a362d] text-white pt-safe px-6 py-5 flex justify-between items-center shadow-lg shrink-0">
              <button onClick={() => goBackWithAd(() => { setShowQuizView(false); setQuizTimerActive(false); })} className="p-2 hover:bg-white/10 rounded-lg shrink-0">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold truncate mx-4 capitalize">{quizType.replace('-', ' ')} Quiz</h3>
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={`${(quizTimer / 30) * 125.66} 125.66`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{quizTimer}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8">
              <div className="w-full max-w-lg bg-gradient-to-br from-[#2d8a5e] to-[#1a6b42] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <p className="text-white text-center text-3xl font-black leading-tight drop-shadow-sm relative z-10">{quizQuestion.question}</p>
              </div>

              <div className="w-full max-w-lg space-y-4">
                {quizQuestion.options.map((option, idx) => {
                  const isSelected = quizSelected === option;
                  return (
                    <button 
                      key={idx} 
                      disabled={quizAnswered} 
                      onClick={() => setQuizSelected(option)}
                      className={`w-full py-5 px-8 rounded-2xl text-center text-xl font-black transition-all border-4 transform-gpu active:scale-95 ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-200 dark:hover:border-emerald-900/50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto w-full max-w-lg">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Session Progress</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white">{quizStatus.count} / 10 Games Complete</p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <BigAdBanner />
              </div>
            </div>
          </div>
        )}

      {showWheelView && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Fortune Wheel</h3>
              <button onClick={() => goBackWithAd(() => setShowWheelView(false))} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8 relative">
              <div className="text-center space-y-1">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Spin the wheel to win Coins!</p>
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${wheelStatus.count > i ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">{wheelStatus.count}/10 spins used today</p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-full max-w-[320px] aspect-square transform-gpu">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-2xl">
                  <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-rose-600"></div>
                </div>

                <div
                  className="w-full h-full rounded-full border-[10px] border-amber-400 dark:border-amber-500 shadow-2xl relative transition-transform duration-5000 ease-out flex items-center justify-center overflow-hidden"
                  style={{ 
                    transform: isSpinning ? `rotate(${spinReward?.totalRotation || 0}deg)` : 'rotate(0deg)',
                    background: `conic-gradient(${(Array.isArray(globalSettings.fortuneWheelConfig?.coins) && globalSettings.fortuneWheelConfig.coins.length > 0 ? globalSettings.fortuneWheelConfig.coins : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]).map((_, i, arr) => {
                      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];
                      const size = 360 / (arr.length || 1);
                      return `${colors[i % colors.length]} ${i * size}deg ${(i + 1) * size}deg`;
                    }).join(', ')})` 
                  }}
                >
                  {(Array.isArray(globalSettings.fortuneWheelConfig?.coins) && globalSettings.fortuneWheelConfig.coins.length > 0 ? globalSettings.fortuneWheelConfig.coins : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]).map((pts, i, arr) => {
                    const segmentSize = 360 / (arr.length || 1);
                    const rotation = i * segmentSize + (segmentSize / 2);
                    return (
                      <div
                        key={i}
                        className="absolute font-black text-white text-base drop-shadow-md"
                        style={{
                          transform: `rotate(${rotation}deg) translateY(-100px) rotate(-${rotation}deg)`
                        }}
                      >
                        {pts}
                      </div>
                    );
                  })}
                  
                  {/* Center hub */}
                  <div className="absolute w-16 h-16 bg-white dark:bg-slate-900 rounded-full shadow-xl border-4 border-amber-400 z-10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-800 rounded-full" />
                  </div>
                </div>
              </div>

              <button
                disabled={isSpinning || wheelStatus.count >= (globalSettings.fortuneWheelConfig?.dailyLimit || 10)}
                onClick={() => {
                  const maxSpins = globalSettings.fortuneWheelConfig?.dailyLimit || 10;
                  if (wheelStatus.count >= maxSpins) {
                    showToast(`You have used all ${maxSpins} spins today. Come back tomorrow!`, 'info');
                    return;
                  }
                  
                  const startSpinAction = () => {
                    const segments = globalSettings.fortuneWheelConfig?.coins || [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                    const randomIdx = Math.floor(Math.random() * segments.length);
                    const segmentSize = 360 / segments.length;
                    const segmentAngle = randomIdx * segmentSize + (segmentSize / 2);
                    const landAngle = (360 - segmentAngle + 360) % 360;
                    const totalRotation = 3600 + landAngle; 
                    setSpinReward({ coins: segments[randomIdx], totalRotation });
                    setIsSpinning(true);
                    
                    // Delay for animation
                    setTimeout(async () => {
                        setIsSpinning(false);
                        const reward = segments[randomIdx];
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
                            setWheelStatus({ lastSpinDate: data.lastSpinDate, count: data.count });
                            showToast(`🎉 Congratulations! You won ${reward} Coins!`, "success");
                          } else {
                            showToast(data.message || 'Failed to claim spin.', "error");
                          }
                        } catch (err) {
                          showToast('Network error.', "error");
                        }
                    }, 5200);
                  };

                  AdMobService.showInterstitial(() => {
                    startSpinAction();
                  });
                }}
                className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-lg"
              >
                {isSpinning ? 'Spinning...' : 'Spin Now!'}
              </button>

              <div className="mt-8 flex justify-center">
                <BigAdBanner />
              </div>
            </div>
          </div>
        )}

      {showGamesView && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
            <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Games</h3>
              <button onClick={() => goBackWithAd(() => setShowGamesView(false))} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-4">Play games and earn bonus Coins!</p>
              {[
                { name: 'Puzzle Quest', desc: 'Solve puzzles to earn rewards', icon: '🧩', color: 'from-blue-500 to-indigo-600', pts: '5-50' },
                { name: 'Color Match', desc: 'Match colours and win big', icon: '🎨', color: 'from-pink-500 to-rose-600', pts: '10-30' },
                { name: 'Word Master', desc: 'Find hidden words for coins', icon: '📝', color: 'from-green-500 to-emerald-600', pts: '5-25' },
              ].map((game, i) => (
                <button
                  key={i}
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
                </button>
              ))}
              <div className="text-center pt-4">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">More games coming soon! 🎮</span>
              </div>
            </div>
          </div>
        )}

      {showScratchView && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
            <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Scratch Cards</h3>
              <button onClick={() => goBackWithAd(() => setShowScratchView(false))} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
                    <button
                      key={i}
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
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 flex flex-col items-center justify-center gap-2 group-hover:opacity-90 transition-opacity z-10">
                            <div className="text-4xl animate-float">🎁</div>
                            <span className="font-black text-white text-sm drop-shadow">SCRATCH HERE!</span>
                            <span className="text-[10px] text-white/80 font-bold">Card {cardNum}</span>
                          </div>
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
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {activeScratchCard && (
          <div
            className="fixed inset-0 animate-fade-in z-[9999] bg-slate-100 flex flex-col h-screen w-full"
          >
            {/* Header */}
            <div className="bg-[#1a362d] text-white pt-safe px-4 py-4 flex items-center gap-4 shadow-md shrink-0">
              <button
                onClick={() => goBackWithAd(() => setActiveScratchCard(null))}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-medium">Scratch Card</h3>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center gap-6">

              {/* Scratch Area */}
              <button
                onClick={async () => {
                  if (activeScratchCard.isRevealed || isLoading) return;
                  
                  // Unified Verified Action logic
                  handleVerifiedAdAction("Scratch Reward", async () => {
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
                        else if (data.points !== undefined) setCoins(data.points);
                        if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                        else if (data.lifetimePoints !== undefined) setLifetimeCoins(data.lifetimePoints);
                        setScratchStatus({ lastScratchDate: data.lastScratchDate, count: data.count });
                        setActiveScratchCard(prev => ({ ...prev, isRevealed: true, reward: data.reward }));
                        showToast(`🎉 Congratulations! You won ${data.reward} Coins!`, "success");
                      } else {
                        showToast(data.message || 'Failed to scratch.', "error");
                      }
                    } catch (err) {
                      showToast('Network error.', "error");
                    } finally {
                      setIsLoading(false);
                    }
                  });
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
                {!activeScratchCard.isRevealed && (
                    <div
                      className="absolute inset-0 z-10 bg-[#c53232] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                    >
                       {/* Text shadow/cut effect in center */}
                       <div className="relative z-20 flex flex-col items-center drop-shadow-lg">
                          <span className="text-4xl font-black text-white/90 leading-none mb-2">SCRATCH</span>
                          <span className="text-4xl font-black text-white/90 leading-none">HERE!</span>
                       </div>
                    </div>
                  )}
                
              </button>

              <div className="mt-6 min-h-[280px] flex items-center justify-center">
                <BigAdBanner />
              </div>

            </div>
          </div>
        )}

      {showQuizSelection && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
              <div className="bg-slate-50 dark:bg-slate-900 pt-safe px-8 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Choose a Quiz</h3>
                <button 
                  onClick={() => setShowQuizSelection(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-4">Complete 10 quizzes daily to earn maximum Coins!</p>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'math', name: 'Math Quiz', icon: '🔢', color: 'from-blue-500 to-indigo-600', pts: '+20 Coins', desc: 'Test your calculation speed' },
                    { id: 'binary', name: 'Binary Quiz', icon: '💻', color: 'from-purple-500 to-violet-600', pts: '+20 Coins', desc: 'Logic and computation puzzles' },
                    { id: 'word', name: 'Word Quiz', icon: '📝', color: 'from-amber-500 to-orange-600', pts: '+20 Coins', desc: 'Vocabulary and word finding' },
                    { id: 'gk', name: 'Daily Trivia', icon: '🌍', color: 'from-emerald-500 to-teal-600', pts: '+50 Coins', desc: 'General knowledge challenges' }
                  ].map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        setShowQuizSelection(false);
                        if (quiz.id === 'gk') {
                          startGkQuiz();
                        } else {
                          launchQuiz(quiz.id);
                        }
                      }}
                      className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-14 h-14 bg-gradient-to-br ${quiz.color} flex items-center justify-center rounded-2xl text-3xl shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                          {quiz.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{quiz.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{quiz.desc}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-xs font-bold shrink-0">
                        {quiz.pts}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center pt-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Daily Limit: {quizStatus.count}/10 Complete</p>
                  <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-500"
                      style={{ width: `${(quizStatus.count / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <BigAdBanner />
                </div>
              </div>
          </div>
        )}

      {showCheckinView && !showAdOverlay && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
               <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Daily Checkin</h3>
                  <button onClick={() => goBackWithAd(() => setShowCheckinView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                     <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="text-center space-y-2">
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Watch 2 ads every 2 hours to earn Coins!</p>
                     <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${checkinStatus.count >= 1 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${checkinStatus.count >= 2 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     {checkinStatus.count < 1 && (
                        <button
                           onClick={startAd}
                           className="flex flex-col items-center gap-4 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl group shadow-sm transform-gpu"
                        >
                           <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                              <Film className="w-8 h-8" />
                           </div>
                           <span className="font-bold text-orange-700 dark:text-orange-400">Ad 1</span>
                        </button>
                     )}

                     {checkinStatus.count < 2 && (
                        <button
                           onClick={startAd}
                           className="flex flex-col items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl group shadow-sm transform-gpu"
                        >
                           <div className="bg-blue-500 text-white p-4 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                              <Film className="w-8 h-8" />
                           </div>
                           <span className="font-bold text-blue-700 dark:text-blue-400">Ad 2</span>
                        </button>
                     )}

                     {checkinStatus.count >= 2 && (
                        <div className="col-span-2 text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                           <p className="text-green-600 dark:text-green-400 font-bold">Both ads completed! 🎉</p>
                        </div>
                     )}
                  </div>
               </div>
          </div>
      )}

      {showGkQuizView && gkQuizQuestions.length > 0 && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 pt-safe px-6 py-4 flex justify-between items-center shadow-lg shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6" /> Gen. Knowledge
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-white font-bold bg-black/20 px-3 py-1 rounded-full text-sm">
                  {currentGkIndex + 1} / 10
                </div>
                <button onClick={() => goBackWithAd(() => setShowGkQuizView(false))} className="text-white p-1">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="h-1.5 bg-amber-100 dark:bg-amber-900/30">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${((currentGkIndex + 1) / 10) * 100}%` }}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <p className="text-center text-slate-500 dark:text-slate-400 font-semibold text-lg">
                Who is this athlete? 🏆
              </p>

              <div className="flex justify-center">
                <div className="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 ring-8 ring-amber-500/10">
                  <img
                    src={gkQuizQuestions[currentGkIndex].image}
                    alt="Athlete"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gkQuizQuestions[currentGkIndex].answer)}&size=300&background=f59e0b&color=fff&bold=true`;
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gkQuizQuestions[currentGkIndex].options.map((option, idx) => {
                  const isCorrect = gkAnswered && option === gkQuizQuestions[currentGkIndex].answer;
                  const isWrong = gkAnswered && gkSelected === option && option !== gkQuizQuestions[currentGkIndex].answer;

                  let btnClass = "w-full px-6 py-4 rounded-2xl font-black text-base transition-all border-2 text-center ";
                  if (!gkAnswered) {
                    btnClass += "bg-white border-slate-200 hover:border-amber-400 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200";
                  } else if (isCorrect) {
                    btnClass += "bg-emerald-500 border-emerald-400 text-white scale-[1.02] shadow-emerald-500/20 shadow-lg";
                  } else if (isWrong) {
                    btnClass += "bg-rose-500 border-rose-400 text-white";
                  } else {
                    btnClass += "bg-slate-100 border-transparent text-slate-400 dark:bg-slate-800 dark:border-slate-700 opacity-40";
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

              <div className="mt-auto pt-8">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Current Progress</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">Score: {gkQuizScore} / {currentGkIndex} correct</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Need 5+ correct answers to earn 40 Coins</p>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <BigAdBanner />
              </div>
            </div>
          </div>
        )}
      

    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-24 md:pb-8">

      {/* Responsive Container */}
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 md:rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">

        {/* Top Header - more compact height */}
        <div className="bg-[#f5f3ff] dark:bg-slate-900 text-slate-800 dark:text-white px-4 py-3 sm:px-6 sm:py-4 flex justify-center items-center gap-3 sm:gap-6 border-b border-purple-100 dark:border-slate-800">
            {/* Premium IP Indicator - Compact and Larger */}
            <button
              onClick={() => { setShowPremiumIPView(true); setIpStep(1); }}
              className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl flex items-center gap-2 border-2 shadow-sm transform-gpu ${
                isPremium 
                  ? "bg-amber-500 border-amber-600 text-white" 
                  : "bg-white dark:bg-slate-800 border-purple-200 dark:border-slate-700 text-purple-700 dark:text-purple-300"
              }`}
            >
              <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${isPremium ? "text-white" : "text-purple-500"}`} strokeWidth={3} />
              <span className="text-sm sm:text-base font-black uppercase tracking-tight">
                Get IP
              </span>
            </button>
            <button
              onClick={() => setActiveEarningTab('wallet')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl border-2 border-purple-500/30 shadow-md shadow-purple-500/20 transform-gpu text-white transition-colors"
            >
               <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
               <span className="text-sm sm:text-base font-black uppercase tracking-tight">My Wallet</span>
            </button>
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
            {/* ═══ Combined Balance Dashboard ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Cash Balance Card */}
               <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-700/50 relative overflow-hidden group transform-gpu">
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                 <div className="relative">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-black text-xs font-black">৳</span>
                      </div>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Balance</p>
                   </div>
                   <p className="text-4xl font-black text-white mb-2 leading-none">৳ {balance.toLocaleString()}</p>
                   <p className="text-slate-500 text-[10px] font-bold">MIN. WITHDRAW: <span className="text-amber-400">1,000 ৳</span></p>
                 </div>
                 {withdrawSuccess && (
                   <div
                     className="absolute bottom-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                     <Check className="w-3 h-3" /> Requested!
                   </div>
                 )}
               </div>

               {/* Coin Balance Card */}
               <div className="bg-gradient-to-br from-[#1a362d] to-[#0a1f18] rounded-3xl p-6 text-white shadow-xl border border-emerald-900/30 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                 <div className="relative">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Medal className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-emerald-400/80 text-sm font-bold uppercase tracking-wider">Coins</p>
                       </div>
                    </div>
                    <p className="text-4xl font-black text-white mb-2 leading-none">{coins.toLocaleString()}</p>
                    <p className="text-emerald-500/60 text-[10px] font-bold">LIFETIME: {lifetimeCoins.toLocaleString()}</p>
                 </div>
               </div>
            </div>

            {/* ═══ Coin Conversion Section ═══ */}
            <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shrink-0">
                     <TrendingUp className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                     <p className="text-sm font-black text-slate-800 dark:text-white">Convert Coins to Cash</p>
                     <p className="text-xs text-slate-500 font-medium">1000 Coins = 50 ৳ Balance</p>
                  </div>
               </div>
               <button
                 onClick={handleConvertCoins}
                 disabled={coins < 1000 || isLoading}
                 className={`px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all ${
                   coins < 1000 
                     ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                     : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
                 }`}
               >
                 {isLoading ? 'Converting...' : 'Convert Now'}
               </button>
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
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-bold transform-gpu will-change-transform ${
                      !m.available
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed'
                        : withdrawMethod === m.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md shadow-brand-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
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
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-black text-base shadow-lg shadow-brand-500/30 transform-gpu disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {withdrawLoading ? (
                <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Processing...</span>
              ) : 'Request Withdrawal'}
            </button>

            <p className="text-center text-xs text-slate-400">Withdrawals are processed within 1–3 business days. Secure and encrypted.</p>
          </div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {activeEarningTab === 'history' && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-2">
               <button
                 onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} 
                 className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 transform-gpu"
               >
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
            {(mainOptions || []).map((item) => (
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
                  { id: 'l1-article', name: 'Articles', icon: <Newspaper className="w-7 h-7" />, coins: 15, color: 'from-blue-400 to-indigo-500', action: () => setShowArticleListView(true), count: articleReadCount, maxCount: 5 },
                  { id: 'l1-videos', name: 'Videos', icon: <Video className="w-7 h-7" />, coins: 25, color: 'from-purple-400 to-pink-500', action: () => openMultiAdView({ key: 'videos', name: 'Videos', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-purple-400 to-pink-500' }), count: getMultiAdCount('videos'), maxCount: 5 },
                  { id: 'l1-games', name: 'Games', icon: <Gamepad2 className="w-7 h-7" />, coins: 50, color: 'from-emerald-400 to-teal-500', action: () => setShowGamesView(true) },
                  { id: 'l1-wheel', name: 'Fortune Wheel', icon: <Aperture className="w-7 h-7" />, coins: null, color: 'from-amber-400 to-orange-500', action: () => setShowWheelView(true) },
                  { id: 'l1-ads', name: 'View Ads', icon: <MonitorPlay className="w-7 h-7" />, coins: 10, color: 'from-sky-400 to-cyan-500', action: () => openMultiAdView({ key: 'view_ads', name: 'View Ads', adType: 'interstitial', coins: 10, logo: 'https://img.icons8.com/color/96/monitor.png', color: 'from-sky-400 to-cyan-500' }), count: getMultiAdCount('view_ads'), maxCount: 5 },
                ].map(item => <OptionCard key={item.id} item={item} count={item.count} maxCount={item.maxCount} />)}
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          {globalSettings?.promoBanner?.isActive && globalSettings?.promoBanner?.imageUrl && (
            <div className="w-full max-w-2xl mx-auto px-4 mb-8">
              <div className="w-full aspect-[468/200] max-h-[200px] overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <img 
                  src={globalSettings.promoBanner.imageUrl} 
                  alt="Promotional Banner" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          )}



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
          <BannerAd468x60 />

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
                  { id: 'l3-youtube', name: 'YouTube', icon: <Youtube className="w-7 h-7" />, coins: 30, color: 'from-red-500 to-rose-600', action: () => openMultiAdView({ key: 'youtube', name: 'YouTube', adType: 'rewarded', coins: 30, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-red-500 to-rose-600' }) },
                  { id: 'l3-tiktok', name: 'TikTok', icon: <Music2 className="w-7 h-7" />, coins: 25, color: 'from-slate-800 to-slate-900', action: () => openMultiAdView({ key: 'tiktok', name: 'TikTok', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/tiktok.png', color: 'from-slate-800 to-slate-900' }) },
                  { id: 'l3-facebook', name: 'Facebook', icon: <Facebook className="w-7 h-7" />, coins: 20, color: 'from-blue-500 to-blue-700', action: () => openMultiAdView({ key: 'facebook', name: 'Facebook', adType: 'rewarded', coins: 20, logo: 'https://img.icons8.com/color/96/facebook-new.png', color: 'from-blue-500 to-blue-700' }) },
                ].map(item => <OptionCard key={item.id} item={item} count={getMultiAdCount(item.id.replace('l3-',''))} maxCount={5} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <BannerAd468x60 />

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
                  { id: 'l4-reward-video', name: 'Reward Video', icon: <MonitorPlay className="w-7 h-7" />, coins: 25, color: 'from-red-500 to-rose-600', action: () => openMultiAdView({ key: 'reward_video', name: 'Reward Video', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-red-500 to-rose-600' }) },
                  { id: 'l4-interstitial', name: 'Interstitial Ad', icon: <Zap className="w-7 h-7" />, coins: 15, color: 'from-blue-500 to-indigo-600', action: () => openMultiAdView({ key: 'interstitial_ad', name: 'Interstitial Ad', adType: 'interstitial', coins: 15, logo: 'https://img.icons8.com/color/96/google-ads.png', color: 'from-blue-500 to-indigo-600' }) },
                  { id: 'l4-native', name: 'Native Ad Click', icon: <Pointer className="w-7 h-7" />, coins: 10, color: 'from-indigo-500 to-blue-600', action: () => openMultiAdView({ key: 'native_ad', name: 'Native Ad Click', adType: 'native', coins: 10, logo: 'https://img.icons8.com/color/96/facebook-new.png', color: 'from-indigo-500 to-blue-600' }) },
                  { id: 'l4-bonus', name: 'Bonus Ad', icon: <Gift className="w-7 h-7" />, coins: 30, color: 'from-amber-400 to-orange-500', action: () => openMultiAdView({ key: 'bonus_ad', name: 'Bonus Ad', adType: 'rewarded', coins: 30, logo: 'https://img.icons8.com/color/96/gift.png', color: 'from-amber-400 to-orange-500' }) },
                  { id: 'l4-hourly', name: 'Hourly Ad', icon: <Clock className="w-7 h-7" />, coins: 20, color: 'from-teal-400 to-emerald-500', action: () => openMultiAdView({ key: 'hourly_ad', name: 'Hourly Ad', adType: 'interstitial', coins: 20, logo: 'https://img.icons8.com/color/96/hourglass.png', color: 'from-teal-400 to-emerald-500' }) },
                  { id: 'l4-weekly-refer', name: 'Meta', icon: <Hash className="w-7 h-7" />, coins: 100, color: 'from-purple-400 to-pink-500', action: () => openMultiAdView({ key: 'weekly_refer', name: 'Meta', adType: 'rewarded', coins: 100, logo: 'https://img.icons8.com/color/96/conference-call.png', color: 'from-purple-400 to-pink-500' }) },
                  { id: 'l4-surprise', name: 'Surprise Bonus', icon: <Star className="w-7 h-7" />, coins: 50, color: 'from-pink-400 to-rose-500', action: () => openMultiAdView({ key: 'surprise_bonus', name: 'Surprise Bonus', adType: 'rewarded', coins: 50, logo: 'https://img.icons8.com/color/96/confetti.png', color: 'from-pink-400 to-rose-500' }) },
                ].map(item => <OptionCard key={item.id} item={item} count={getMultiAdCount(item.id.replace('l4-','').replace(/-/g,'_'))} maxCount={5} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <BannerAd468x60 />

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
                  { id: 'l5-rik-survey', name: 'Rik Survey', icon: <ClipboardList />, coins: 1200, color: 'from-sky-400 to-blue-500', action: () => handleStatusClick('Rik Survey', 'unavailable') },
                  { id: 'l5-web-reg', name: 'Website Reg.', icon: <Globe />, coins: 30, color: 'from-violet-400 to-purple-500', action: () => handleStatusClick('Website Registration', 'upcoming') },
                  { id: 'l5-email', name: 'Email Submit', icon: <Mail />, coins: 20, color: 'from-orange-400 to-red-500', action: () => handleStatusClick('Email Submit', 'upcoming') },
                  { id: 'l5-app', name: 'App Install', icon: <Download />, coins: 40, color: 'from-emerald-400 to-green-500', action: () => handleStatusClick('App Install', 'unavailable') },
                  { id: 'l5-affiliate', name: 'Affiliate Market', icon: <ShoppingBag />, coins: 75, color: 'from-amber-400 to-yellow-500', action: () => handleStatusClick('Affiliate Market', 'upcoming') },
                  { id: 'l5-trial', name: 'Trial Signup', icon: <Key />, coins: 60, color: 'from-rose-400 to-pink-500', action: () => handleStatusClick('Trial Signup', 'upcoming') },
                ].map(item => <OptionCard key={item.id} item={item} />)}
              </div>
            </div>
          </div>

          {/* Level Progress Overview Card */}
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setShowLevelView(true)}
              className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-400/20 rounded-2xl p-4 md:p-6 flex items-center gap-4 transform-gpu"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <span className="font-black text-white text-lg">{levelInfo.level}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{levelInfo.label}</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">
                    {levelInfo.isMax ? 'MAX' : `${Math.round(progressPercent)}%`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500 shrink-0" />
            </button>
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

          {/* Ad Banner */}
          <BannerAd468x60 />

          {/* Custom Modals Down Here */}
          {/* Interstitial Ad / Rewarded Video Modal */}
          {showInterstitialAd && (
              <div
                className="fixed inset-0 animate-fade-in z-[200] bg-black flex flex-col items-center justify-center p-4"
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
                    <button
                      onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                      className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.3)] transform-gpu"
                    >
                      {isLoading ? 'Claiming...' : `Claim ${currentAdInfo.coins} Coins`}
                    </button>
                  )}
                </div>
              </div>
            )}
          

          {/* Native Ad Modal */}
          {showNativeAd && (
              <div
                className="fixed inset-0 animate-fade-in z-[200] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
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
                      className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg text-center font-bold text-sm transform-gpu shadow-lg"
                    >
                      {isLoading ? 'Claiming...' : `Install & Claim ${currentAdInfo.coins} Coins`}
                    </button>
                  )}
                  {currentAdInfo.time === 0 && (
                     <button onClick={() => setShowNativeAd(false)} className="mt-2 w-full text-center text-[10px] bg-transparent text-slate-400 underline">Dismiss</button>
                  )}
                </div>
              </div>
            )}
          

          {/* Offerwall Ad Modal (For Surveys, Regs etc.) */}
          {showOfferwallAd && (
              <div
                className="fixed inset-0 animate-fade-in z-[200] bg-slate-100 dark:bg-slate-900 flex flex-col"
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
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 w-full transform-gpu"
                          >
                            {isLoading ? 'Processing...' : `Complete Task (+${currentAdInfo.coins} Coins)`}
                          </button>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            )}
          

          </>
        )}
        </div>
      </div>

      </main>

      {/* ══════ PREMIUM IP VIEW OVERLAY ══════ */}
      {showPremiumIPView && createPortal(
        <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-[#070B14] via-[#0B101D] to-[#0A1838] flex flex-col animate-fade-in overflow-hidden">
          
          {/* Background decoration flares */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-[#FACC15] opacity-[0.03] blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
          
          {/* Header area with back button */}
          <div className="p-4 shrink-0 flex items-center border-b border-white/5 relative z-10 bg-black/10 backdrop-blur-md">
            <button
              onClick={() => {
                if (ipStep === 3 || ipStep === 4 || (ipStep === 2 && isPremium)) {
                  setIpStep(ipStep - 1);
                } else {
                  setShowPremiumIPView(false);
                  setIpStep(1);
                }
              }}
              className="w-10 h-10 flex items-center justify-start text-slate-300 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[#FACC15] font-bold ml-1 text-lg tracking-wide flex-1">Get IP</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 scrollbar-hide flex flex-col relative z-10">
             <div className="flex-1 space-y-6">
             {/* If Premium Active Timer View (Step 1 when Premium) */}
             {isPremium && ipStep === 1 ? (
               <div className="flex flex-col items-center justify-center pt-6">
                  <Crown className="w-16 h-16 text-[#FACC15] fill-[#FACC15] mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Active IP</h2>
                  <p className="text-slate-400 text-sm mb-6 text-center">
                     You currently have an active premium IP.
                  </p>
                  
                  <div className="flex gap-4 p-5 bg-[#151A23] rounded-2xl border border-white/5 text-center w-full mb-8 shadow-xl">
                     <div className="flex-1">
                        <div className="text-2xl font-black text-white">{timeLeft.days}</div>
                        <div className="text-[10px] uppercase text-slate-500 mt-1 font-bold tracking-wider">Days</div>
                     </div>
                     <div className="flex-1 border-l border-slate-800">
                        <div className="text-2xl font-black text-white">{timeLeft.hours}</div>
                        <div className="text-[10px] uppercase text-slate-500 mt-1 font-bold tracking-wider">Hours</div>
                     </div>
                     <div className="flex-1 border-l border-slate-800">
                        <div className="text-2xl font-black text-white">{timeLeft.minutes}</div>
                        <div className="text-[10px] uppercase text-slate-500 mt-1 font-bold tracking-wider">Mins</div>
                     </div>
                  </div>

                  <button
                     onClick={() => setIpStep(2)}
                     className="px-8 py-4 bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 rounded-xl font-black active:scale-95 w-full uppercase tracking-wider shadow-[0_5px_20px_rgba(250,204,21,0.3)]"
                  >
                     Extend Membership
                  </button>
               </div>
             ) : null}

             {/* Package Selection (Step 1 or Step 2) */}
             {(!isPremium && ipStep === 1) || (isPremium && ipStep === 2) ? (
                <div className="flex flex-col items-center">
                   <Crown className="w-12 h-12 text-[#FACC15] fill-[#FACC15] mb-3 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                   <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Get IP</h2>
                   <p className="text-slate-400 text-xs mb-4 text-center px-4 leading-relaxed">
                      Upgrade to Premium IP to enjoy more<br/>features
                   </p>
                   
                   <div className="w-full space-y-3 mb-4 px-2 max-w-[280px]">
                      <div className="flex items-center gap-3 text-slate-300">
                         <Globe className="w-4 h-4 text-[#FACC15]" />
                         <span className="text-xs font-bold opacity-90">All Global Services</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <Shield className="w-4 h-4 text-[#FACC15]" />
                         <span className="text-xs font-bold opacity-90">Super fast Connections</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <Globe className="w-4 h-4 text-[#FACC15]" />
                         <span className="text-xs font-bold opacity-90">All 30+ country Server for VIP</span>
                      </div>
                   </div>
                   
                   <div className="w-full space-y-3">
                      {((globalSettings.premiumIpPackages && globalSettings.premiumIpPackages.length > 0) ? globalSettings.premiumIpPackages : [
                         {id: '1', duration: '1 Month', price: 700, freeBonus: '+7 Days free', promoTag: ''},
                         {id: '2', duration: '3 Month', price: 1300, freeBonus: '+15 Days free', promoTag: 'POPULAR'},
                         {id: '3', duration: '6 Month', price: 2200, freeBonus: '+1 Month free', promoTag: 'BEST VALUE'},
                         {id: '4', duration: '1 Year', price: 4200, freeBonus: '+2 Month free', promoTag: 'PRO'}
                      ]).map(pkg => {
                         const displayBonus = pkg.freeBonus || (pkg.duration.includes('1 Month') ? '+7 Days free' : pkg.duration.includes('3 Month') ? '+15 Days free' : pkg.duration.includes('6 Month') ? '+1 Month free' : pkg.duration.includes('1 Year') ? '+2 Month free' : '');
                         
                         return (
                         <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`w-full relative px-3 py-3 rounded-2xl border flex items-center justify-between transition-all overflow-hidden ${
                               selectedPackage === pkg.id ? 'border-[#FACC15] bg-[#FACC15]/10 shadow-[0_0_15px_rgba(250,204,21,0.15)]' : 'border-white/10 bg-[#151A23]'
                            }`}
                         >
                            <div className="flex items-center gap-1.5 md:gap-2 z-10 w-full overflow-hidden">
                               <span className={`font-black text-[15px] sm:text-lg whitespace-nowrap ${selectedPackage === pkg.id ? 'text-[#FACC15]' : 'text-white'}`}>৳{pkg.price}/-</span>
                               <span className="text-white/20 h-4 w-px bg-white/20"></span>
                               <span className={`font-bold text-[11px] sm:text-sm tracking-wide whitespace-nowrap ${selectedPackage === pkg.id ? 'text-white' : 'text-slate-300'}`}>{pkg.duration}</span>
                               <span className="text-white/20 h-4 w-px bg-white/20"></span>
                               {displayBonus && (
                                  <span className="text-emerald-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-emerald-400/10 px-1 py-0.5 rounded border border-emerald-400/20 whitespace-nowrap truncate">
                                     {displayBonus}
                                  </span>
                               )}
                            </div>
                            
                            <div className="flex flex-col items-end justify-center z-10 flex-shrink-0 ml-1">
                               <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage === pkg.id ? 'border-[#FACC15]' : 'border-slate-500'}`}>
                                  {selectedPackage === pkg.id && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FACC15] drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
                               </div>
                            </div>
                            
                            {/* Subtle background glow for selected package */}
                            {selectedPackage === pkg.id && (
                               <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FACC15]/10 to-transparent"></div>
                            )}
                         </button>
                      )})}
                   </div>

                   {/* GET IP NOW Button - Moved Higher */}
                   <div className="w-full mt-4">
                      <button
                         disabled={!selectedPackage}
                         onClick={() => setIpStep(isPremium ? 3 : 2)}
                         className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none tracking-wider text-sm"
                      >
                         GET IP NOW
                      </button>
                   </div>
                </div>
             ) : null}

             {/* Country Selection (Step 2 or 3) */}
             {((!isPremium && ipStep === 2) || (isPremium && ipStep === 3)) ? (
               <div className="flex flex-col items-center pt-4">
                  <h2 className="text-xl font-black text-white mb-2">Select Country</h2>
                  <p className="text-slate-400 text-xs mb-8 text-center">Choose the origin of your new IP</p>
                  
                  <div className="w-full relative">
                     <div 
                        className="bg-[#121A2B] border-2 border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                     >
                        {selectedCountry ? (
                           <div className="flex items-center gap-3">
                              <span className="text-2xl">{countries.find(c => c.name === selectedCountry)?.emoji}</span>
                              <span className="text-white font-bold">{selectedCountry}</span>
                           </div>
                        ) : (
                           <span className="text-slate-400 font-bold">Tap to select country...</span>
                        )}
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                     </div>

                     {isCountryDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-[#121A2B] border-2 border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[350px]">
                           <div className="p-3 border-b border-slate-800 shrink-0">
                              <div className="bg-slate-900 rounded-xl flex items-center px-4 py-2">
                                 <Search className="w-4 h-4 text-slate-500 mr-3" />
                                 <input 
                                    type="text" 
                                    placeholder="Search country..." 
                                    className="bg-transparent border-none outline-none text-white text-sm w-full h-8"
                                    value={searchCountry}
                                    onChange={(e) => setSearchCountry(e.target.value)}
                                 />
                              </div>
                           </div>
                           <div className="overflow-y-auto flex-1 p-2 scrollbar-none">
                              {countries.filter(c => c.name.toLowerCase().includes(searchCountry.toLowerCase())).map((c) => (
                                 <button
                                    key={c.code}
                                    onClick={() => { setSelectedCountry(c.name); setIsCountryDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors ${selectedCountry === c.name ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`}
                                 >
                                    <span className="text-3xl">{c.emoji}</span>
                                    <span className="font-bold">{c.name}</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
             ) : null}

             {/* Payment Selection (Step 3 or 4) */}
             {((!isPremium && ipStep === 3) || (isPremium && ipStep === 4)) ? (
               <div className="flex flex-col animate-fade-in pt-4">
                  <h2 className="text-xl font-black text-[#FACC15] mb-2 text-center drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">Payment Methods</h2>
                  <p className="text-slate-300 font-bold mb-8 text-center bg-[#FACC15]/10 py-2 rounded-xl border border-[#FACC15]/20 max-w-[200px] mx-auto shadow-[0_0_15px_rgba(250,204,21,0.05)]">
                     Amount: <span className="text-[#FACC15] text-lg">৳{globalSettings.premiumIpPackages?.find(p => p.id === selectedPackage)?.price || (selectedPackage === '1' ? 700 : 0)}</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                     {[
                        { id: 'bkash', name: 'bKash', logo: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png', available: true, number: globalSettings.bkashNumber },
                        { id: 'nagad', name: 'Nagad', logo: 'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png', available: true, number: globalSettings.nagadNumber },
                        { id: 'rocket', name: 'Rocket', logo: 'https://freelogopng.com/images/all_img/1656235199rocket-app-logo.png', available: true, number: globalSettings.rocketNumber },
                        { id: 'bank', name: 'Bank Transfer', logo: 'https://img.icons8.com/color/96/bank-building.png', available: false },
                        { id: 'card', name: 'Mobile Card', logo: 'https://img.icons8.com/color/96/bank-cards.png', available: false },
                        { id: 'visa', name: 'Visa', logo: 'https://img.icons8.com/color/96/visa.png', available: false },
                     ].map((method) => (
                        <button
                           key={method.id}
                           disabled={!method.available}
                           onClick={() => setPaymentMethod(method.id)}
                           className={`relative p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                              paymentMethod === method.id 
                              ? 'border-[#FACC15] bg-[#FACC15]/10 shadow-[0_0_15px_rgba(250,204,21,0.15)]' 
                              : 'border-white/10 bg-[#151A23]'
                           } ${!method.available ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                        >
                           <img src={method.logo} alt={method.name} className={`w-10 h-10 object-contain transition-transform ${paymentMethod === method.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'drop-shadow'}`} />
                           <span className={`text-xs font-bold ${paymentMethod === method.id ? 'text-[#FACC15]' : 'text-white'}`}>{method.name}</span>
                           {!method.available && <span className="absolute inset-0 m-auto h-fit w-fit px-1.5 py-0.5 bg-slate-900/90 rounded text-[9px] font-black text-rose-400 uppercase tracking-widest text-center shadow-lg">Unavailable</span>}
                        </button>
                     ))}
                  </div>

                  {paymentMethod && (
                     <div className="bg-[#151A23] rounded-2xl p-5 border border-white/10 animate-slide-up shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-[40px]"></div>
                        
                        <p className="text-slate-300 text-sm mb-3 font-bold text-center relative z-10">1. Send exact amount to this number:</p>
                        <div className="flex items-center justify-between bg-black/30 rounded-xl p-3 border border-white/5 mb-6 group transition-colors relative z-10">
                           <span className="font-mono text-[#FACC15] font-black tracking-widest text-lg ml-2 drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]">
                              {paymentMethod === 'bkash' && globalSettings.bkashNumber}
                              {paymentMethod === 'nagad' && globalSettings.nagadNumber}
                              {paymentMethod === 'rocket' && globalSettings.rocketNumber}
                           </span>
                           <button onClick={(e) => {
                              navigator.clipboard.writeText(
                                 paymentMethod === 'bkash' ? globalSettings.bkashNumber : 
                                 paymentMethod === 'nagad' ? globalSettings.nagadNumber : globalSettings.rocketNumber
                              );
                              const btn = e.target;
                              const oldText = btn.innerText;
                              btn.innerText = 'Copied!';
                              setTimeout(() => btn.innerText = oldText, 2000);
                           }} className="text-xs bg-[#FACC15]/10 text-[#FACC15] px-4 py-2 rounded-lg font-black uppercase tracking-wider hover:bg-[#FACC15]/20 border border-[#FACC15]/20 transition-colors">Copy</button>
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-3 font-bold text-center mt-2 relative z-10">2. Enter your Transaction ID:</p>
                        <div className="space-y-2 relative z-10">
                           <input
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="e.g. TRXR123456789"
                              className="w-full bg-black/30 border border-white/10 focus:border-[#FACC15]/50 focus:bg-[#FACC15]/5 focus:shadow-[0_0_15px_rgba(250,204,21,0.1)] rounded-xl px-4 py-4 text-[#FACC15] font-mono text-sm outline-none transition-all text-center font-bold tracking-wider uppercase placeholder:text-slate-600 placeholder:normal-case"
                           />
                        </div>
                     </div>
                  )}
               </div>
             ) : null}

             </div>

             {/* Action Buttons Container (Appended correctly beneath content) */}
             {(!isPremium || ipStep > 1) && (
                <div className="w-full pt-4 mt-auto">
                   {((!isPremium && ipStep === 2) || (isPremium && ipStep === 3)) && (
                      <button
                         disabled={!selectedCountry}
                         onClick={() => setIpStep(isPremium ? 4 : 3)}
                         className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none tracking-wider text-sm"
                      >
                         CONTINUE TO PAYMENT
                      </button>
                   )}
                   {((!isPremium && ipStep === 3) || (isPremium && ipStep === 4)) && (
                      <button
                         disabled={!paymentMethod || !transactionId || ipSubmitting}
                         onClick={handlePremiumSubmit}
                         className="w-full flex items-center justify-center py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none tracking-wider text-sm gap-2"
                      >
                         {ipSubmitting ? <span className="animate-pulse">PROCESSING...</span> : (
                           <>
                             CONFIRM ORDER <Check strokeWidth={3} className="w-5 h-5" />
                           </>
                         )}
                      </button>
                   )}
                </div>
             )}
          </div>
        </div>
      , document.body)}

      {showStatusOverlay && createPortal(
        <div className="fixed inset-0 z-[99999] bg-[#070B14] flex flex-col animate-fade-in overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] animate-pulse"></div>
          </div>
          
          <div className="relative z-10 p-4 flex items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
            <button
              onClick={() => setShowStatusOverlay(false)}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[#FACC15] font-black ml-2 text-lg uppercase tracking-tight flex-1">Status Update</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
            <div className={`relative mb-10`}>
                <div className={`absolute inset-0 blur-3xl opacity-30 ${statusData.type === 'upcoming' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`}></div>
                <div className={`w-28 h-28 rounded-[2rem] bg-gradient-to-br ${statusData.type === 'upcoming' ? 'from-amber-400 to-orange-600 shadow-amber-500/20' : 'from-rose-500 to-pink-700 shadow-rose-500/20'} flex items-center justify-center shadow-2xl animate-float relative z-20`}>
                  {statusData.type === 'upcoming' ? (
                    <Clock className="w-14 h-14 text-white" strokeWidth={2.5} />
                  ) : (
                    <AlertCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                  )}
                </div>
            </div>

            <div className="space-y-6 max-w-sm">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                  {statusData.name}
                </h2>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest ${statusData.type === 'upcoming' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                   {statusData.type === 'upcoming' ? 'Coming Soon' : 'Locked!'}
                </div>
              </div>

              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                {statusData.type === 'upcoming' 
                  ? 'Great things take time! We are polishing this feature to give you the best earning experience.' 
                  : 'This section is currently under maintenance or requires a higher level to unlock.'}
              </p>
              
              <button 
                onClick={() => setShowStatusOverlay(false)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Go Back
              </button>
            </div>

            <div className="mt-auto w-full pb-8 flex flex-col items-center gap-4">
               <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">Sponsored Ad</div>
               <BigAdBanner />
            </div>
          </div>
        </div>
      , document.body)}

    </PullToRefresh>
    </>
  );
};

export default EarningPage;
