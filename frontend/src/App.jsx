import React, { useState, useEffect } from 'react';
import AuthLayout from './components/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import ProfilePage from './components/ProfilePage';
import VerificationPage from './components/VerificationPage';
import LanguagePage from './components/LanguagePage';
import ChangePasswordPage from './components/ChangePasswordPage';
import ReferralsPage from './components/ReferralsPage';
import LeaderboardPage from './components/LeaderboardPage';
import TermsPrivacyPage from './components/TermsPrivacyPage';
import DeleteAccountPage from './components/DeleteAccountPage';
import EarningPage from './components/EarningPage';
import NotificationPage from './components/NotificationPage';
import PaymentSuccess from './components/PaymentSuccess';
import SettingsPage from './components/SettingsPage';
import { API_BASE } from './config';

import { AdMob } from '@capacitor-community/admob';
import { App as CapacitorApp } from '@capacitor/app';
import { AdMobService } from './utils/admob';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Initialize AdMob
  useEffect(() => {
    const initAdMob = async () => {
      try {
        await AdMob.initialize({
          testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
        });
        console.log('AdMob Initialized');
      } catch (err) {
        console.error('AdMob initialization failed:', err);
      }
    };
    initAdMob();
  }, []);

  // Show an interstitial ad, then run the callback (back navigation)
  const showBackAd = (callback) => {
    AdMobService.showInterstitial(callback);
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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100/50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'Home' && <HomePage onBuyNow={handleBuyNow} />}
        {activeTab === 'Cart' && <CartPage onBuyNow={handleBuyNow} />}
        {activeTab === 'Checkout' && <CheckoutPage product={selectedProduct} onBack={() => setActiveTab('Cart')} onSuccess={() => setActiveTab('PaymentSuccess')} />}
        {activeTab === 'Notification' && <NotificationPage onBack={() => showBackAd(() => setActiveTab('Home'))} />}
        {activeTab === 'PaymentSuccess' && <PaymentSuccess onBack={() => showBackAd(() => setActiveTab('Home'))} />}
        {activeTab === 'Profile' && <ProfilePage 
          onVerifyClick={() => setActiveTab('Verify')} 
          onLanguageClick={() => setActiveTab('Language')} 
          onPasswordClick={() => setActiveTab('ChangePassword')}
          onReferralsClick={() => setActiveTab('Referrals')}
          onLeaderboardClick={() => setActiveTab('Leaderboard')}
          onTermsClick={() => setActiveTab('TermsPrivacy')}
          onDeleteClick={() => setActiveTab('DeleteAccount')}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />}
        {activeTab === 'Verify' && <VerificationPage onBack={() => showBackAd(() => setActiveTab('Profile'))} />}
        {activeTab === 'Language' && <LanguagePage onBack={() => showBackAd(() => setActiveTab('Profile'))} />}
        {activeTab === 'ChangePassword' && <ChangePasswordPage onBack={() => showBackAd(() => setActiveTab('Profile'))} />}
        {activeTab === 'Referrals' && <ReferralsPage onBack={() => showBackAd(() => setActiveTab('Profile'))} />}
        {activeTab === 'Leaderboard' && <LeaderboardPage onBack={() => showBackAd(() => setActiveTab('Profile'))} />}
        {activeTab === 'TermsPrivacy' && <TermsPrivacyPage onBack={() => showBackAd(() => setActiveTab('Profile'))} />}
        {activeTab === 'DeleteAccount' && <DeleteAccountPage onBack={() => showBackAd(() => setActiveTab('Profile'))} onLogout={handleLogout} />}
        {activeTab === 'Earning' && <EarningPage onReferralsClick={() => setActiveTab('Referrals')} setActiveTab={setActiveTab} onSuccess={() => setActiveTab('PaymentSuccess')} />}
        
        {activeTab === 'Setting' && (
          <SettingsPage 
            darkMode={darkMode} 
            onToggleDarkMode={handleToggleDarkMode} 
            onLogout={handleLogout}
            onBack={() => setActiveTab('Home')}
            onPasswordClick={() => setActiveTab('ChangePassword')}
            onLanguageClick={() => setActiveTab('Language')}
            onTermsClick={() => setActiveTab('TermsPrivacy')}
            onDeleteClick={() => setActiveTab('DeleteAccount')}
            onNotificationClick={() => setActiveTab('Notification')}
          />
        )}
      </div>
    );
  }


  return (
    <AuthLayout>
      {isLogin ? (
        <LoginForm
          onToggleForm={() => setIsLogin(false)}
          onLoginSuccess={() => setIsAuthenticated(true)}
        />
      ) : (
        <RegistrationForm
          onToggleForm={() => setIsLogin(true)}
          onRegisterSuccess={() => setIsLogin(true)}
        />
      )}
    </AuthLayout>
  );
}

export default App;
