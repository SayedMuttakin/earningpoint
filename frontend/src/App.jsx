import React, { useState, useEffect, lazy, Suspense } from 'react';
import AuthLayout from './components/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { API_BASE } from './config';

import { AdMob } from '@capacitor-community/admob';
import { App as CapacitorApp } from '@capacitor/app';
import { AdMobService } from './utils/admob';

// Lazy load other sub-pages/components to split bundle size and make initial load super fast
const CartPage = lazy(() => import('./components/CartPage'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const VerificationPage = lazy(() => import('./components/VerificationPage'));
const LanguagePage = lazy(() => import('./components/LanguagePage'));
const ChangePasswordPage = lazy(() => import('./components/ChangePasswordPage'));
const ReferralsPage = lazy(() => import('./components/ReferralsPage'));
const LeaderboardPage = lazy(() => import('./components/LeaderboardPage'));
const TermsPrivacyPage = lazy(() => import('./components/TermsPrivacyPage'));
const DeleteAccountPage = lazy(() => import('./components/DeleteAccountPage'));
const EarningPage = lazy(() => import('./components/EarningPage'));
const NotificationPage = lazy(() => import('./components/NotificationPage'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const SupportPage = lazy(() => import('./components/SupportPage'));
const MessengerPage = lazy(() => import('./components/MessengerPage'));
const UpdatesPage = lazy(() => import('./components/UpdatesPage'));
const TransactionHistoryPage = lazy(() => import('./components/TransactionHistoryPage'));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const VideoReelsPage = lazy(() => import('./components/VideoReelsPage'));
const PublicProfilePage = lazy(() => import('./components/PublicProfilePage'));

// Ultra-fast loader fallback — uses inline styles so it renders before CSS parses
const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


function App() {
  // Check if URL has a password reset token (from email link) or reelId (from shared link)
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  const reelIdFromUrl = urlParams.get('reelId');
  const [resetPasswordToken, setResetPasswordToken] = useState(resetToken || null);

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('hasSeenOnboarding'));
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [activeTab, _setActiveTab] = useState(reelIdFromUrl ? 'Video' : 'Home');
  const [navigationHistory, setNavigationHistory] = useState([reelIdFromUrl ? 'Video' : 'Home']);

  const setActiveTab = (tab) => {
    setNavigationHistory(prev => {
      if (tab === 'Home') {
        return ['Home'];
      }
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
    _setActiveTab(tab);
  };

  const handleBackNavigation = () => {
    setNavigationHistory(prev => {
      if (prev.length <= 1) {
        _setActiveTab('Home');
        return ['Home'];
      }
      const newHistory = prev.slice(0, -1);
      const targetTab = newHistory[newHistory.length - 1];
      _setActiveTab(targetTab || 'Home');
      return newHistory;
    });
  };

  // Native back button listener
  const navigationHistoryRef = React.useRef(navigationHistory);
  useEffect(() => {
    navigationHistoryRef.current = navigationHistory;
  }, [navigationHistory]);

  useEffect(() => {
    let handler;
    const registerListener = async () => {
      try {
        handler = await CapacitorApp.addListener('backButton', () => {
          const customEvent = new CustomEvent('appBackButton', {
            cancelable: true,
            bubbles: true
          });
          document.dispatchEvent(customEvent);

          if (customEvent.defaultPrevented) {
            return;
          }

          if (navigationHistoryRef.current.length > 1) {
            handleBackNavigation();
          } else {
            CapacitorApp.exitApp();
          }
        });
      } catch (err) {
        console.error('Capacitor backButton listener failed:', err);
      }
    };

    registerListener();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  const [selectedReelId, setSelectedReelId] = useState(reelIdFromUrl || null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [activeChatPartner, setActiveChatPartner] = useState(null);
  const [selectedNotificationPostId, setSelectedNotificationPostId] = useState(null);
  const [activePublicProfileUserId, setActivePublicProfileUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile in App:', err);
      }
    };
    if (isAuthenticated) {
      fetchUser();
    } else {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  // Initialize AdMob
  useEffect(() => {
    const initAdMob = async () => {
      try {
        await AdMob.initialize({
          testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
        });
        console.log('AdMob Initialized');
        
        // Fetch global settings dynamically to retrieve current AdMob configs
        try {
          const res = await fetch(`${API_BASE}/api/earning/settings`);
          const settings = await res.json();
          if (settings && settings.admobConfig) {
            AdMobService.setConfig(settings.admobConfig);
          }
        } catch (settingsErr) {
          console.error('Failed to load dynamic AdMob config:', settingsErr);
        }
      } catch (err) {
        console.error('AdMob initialization failed:', err);
      }
    };
    initAdMob();
  }, []);

  // Back navigation — directly navigate without showing ads
  const showBackAd = (callback) => {
    if (callback) callback();
  };

  // Apply/remove dark class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('darkMode', String(newVal));

    // Sync with backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE}/api/profile/darkmode`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Failed to sync dark mode:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('darkMode');
    setDarkMode(false);
    setIsAuthenticated(false);
    setActiveTab('Home');
  };

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setActiveTab('Checkout');
  };

  // If user clicked a password reset link from email, show reset page immediately
  if (resetPasswordToken) {
    return (
      <ResetPasswordPage
        token={resetPasswordToken}
        onDone={() => {
          setResetPasswordToken(null);
          setIsLogin(true);
        }}
      />
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen 
        onComplete={() => {
          localStorage.setItem('hasSeenOnboarding', 'true');
          setShowOnboarding(false);
        }} 
      />
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100/50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar 
          onLogout={handleLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser} 
          activePublicProfileUserId={activePublicProfileUserId} 
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
        <Suspense fallback={<PageLoader />}>
          {activeTab === 'Home' && (
            <HomePage 
              onBuyNow={handleBuyNow} 
              setActiveTab={setActiveTab} 
              setSelectedNewsId={setSelectedNewsId}
              setActiveChatPartner={setActiveChatPartner}
              setSelectedReelId={setSelectedReelId}
              highlightedPostId={selectedNotificationPostId}
              setHighlightedPostId={setSelectedNotificationPostId}
              onUserClick={(uid) => {
                setActivePublicProfileUserId(uid);
                setActiveTab('PublicProfile');
              }}
            />
          )}
          {activeTab === 'Video' && (
            <VideoReelsPage selectedReelId={selectedReelId} onBack={() => handleBackNavigation()} />
          )}
          {activeTab === 'Cart' && <CartPage onBuyNow={handleBuyNow} />}
          {activeTab === 'Checkout' && <CheckoutPage product={selectedProduct} onBack={() => handleBackNavigation()} onSuccess={(method) => { setSelectedPaymentMethod(method); setActiveTab('PaymentSuccess'); }} />}
          {activeTab === 'Notification' && (
            <NotificationPage 
              onBack={() => handleBackNavigation()} 
              setActiveTab={setActiveTab}
              setSelectedNotificationPostId={setSelectedNotificationPostId}
            />
          )}
          {activeTab === 'PublicProfile' && (
            <PublicProfilePage 
              userId={activePublicProfileUserId}
              currentUser={currentUser}
              onBack={() => handleBackNavigation()}
              setActiveTab={setActiveTab}
              setSelectedReelId={setSelectedReelId}
              setActiveChatPartner={setActiveChatPartner}
            />
          )}
          {activeTab === 'MyProfile' && (
            <PublicProfilePage 
              userId="me"
              currentUser={currentUser}
              isOwnProfile={true}
              onBack={() => handleBackNavigation()}
              setActiveTab={setActiveTab}
              setSelectedReelId={setSelectedReelId}
              setActiveChatPartner={setActiveChatPartner}
            />
          )}
          {activeTab === 'PaymentSuccess' && <PaymentSuccess paymentMethod={selectedPaymentMethod} onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'EditProfile' && <ProfilePage 
            onBack={() => handleBackNavigation()}
            onVerifyClick={() => setActiveTab('Verify')} 
            onLanguageClick={() => setActiveTab('Language')} 
            onPasswordClick={() => setActiveTab('ChangePassword')}
            onReferralsClick={() => setActiveTab('Referrals')}
            onLeaderboardClick={() => setActiveTab('Leaderboard')}
            onTransactionsClick={() => setActiveTab('TransactionHistory')}
            onSupportClick={() => setActiveTab('Support')}
            onTermsClick={() => setActiveTab('TermsPrivacy')}
            onDeleteClick={() => setActiveTab('DeleteAccount')}
            onNotificationClick={() => setActiveTab('Notification')}
            onSettingsClick={() => setActiveTab('Setting')}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />}
          {activeTab === 'Verify' && <VerificationPage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'Language' && <LanguagePage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'ChangePassword' && <ChangePasswordPage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'Referrals' && <ReferralsPage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'Leaderboard' && <LeaderboardPage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'TransactionHistory' && <TransactionHistoryPage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'TermsPrivacy' && <TermsPrivacyPage onBack={() => showBackAd(() => handleBackNavigation())} />}
          {activeTab === 'DeleteAccount' && <DeleteAccountPage onBack={() => showBackAd(() => handleBackNavigation())} onLogout={handleLogout} />}
          {activeTab === 'Earning' && <EarningPage onReferralsClick={() => setActiveTab('Referrals')} setActiveTab={setActiveTab} />}
          
          {activeTab === 'Setting' && (
            <SettingsPage 
              darkMode={darkMode} 
              onToggleDarkMode={handleToggleDarkMode} 
              onLogout={handleLogout}
              onBack={() => handleBackNavigation()}
              onPasswordClick={() => setActiveTab('ChangePassword')}
              onLanguageClick={() => setActiveTab('Language')}
              onTermsClick={() => setActiveTab('TermsPrivacy')}
              onDeleteClick={() => setActiveTab('DeleteAccount')}
              onNotificationClick={() => setActiveTab('Notification')}
              onSupportClick={() => setActiveTab('Support')}
              onVerifyClick={() => setActiveTab('Verify')}
            />
          )}
          
          {activeTab === 'Support' && <SupportPage onBack={() => handleBackNavigation()} />}
          {activeTab === 'Messenger' && (
            <MessengerPage 
              onBack={() => {
                setActiveChatPartner(null);
                handleBackNavigation();
              }} 
              activeChatPartner={activeChatPartner}
              setActiveChatPartner={setActiveChatPartner}
            />
          )}
          {activeTab === 'Updates' && (
            <UpdatesPage 
              onBack={() => {
                setSelectedNewsId(null);
                handleBackNavigation();
              }} 
              selectedPostId={selectedNewsId}
              setSelectedPostId={setSelectedNewsId}
            />
          )}
        </Suspense>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AuthLayout>
        {showForgotPassword ? (
          <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
        ) : isLogin ? (
          <LoginForm
            onToggleForm={() => setIsLogin(false)}
            onLoginSuccess={() => setIsAuthenticated(true)}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
        ) : (
          <RegistrationForm
            onToggleForm={() => setIsLogin(true)}
            onRegisterSuccess={() => setIsLogin(true)}
          />
        )}
      </AuthLayout>
    </Suspense>
  );
}

export default App;
