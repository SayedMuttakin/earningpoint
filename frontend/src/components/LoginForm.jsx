import React, { useState } from 'react';
import { API_BASE } from '../config';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID = '1028494965258-90o444tljgmd5r6c5si8d8oc2oudnhnl.apps.googleusercontent.com';
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';

// ── SVG Icons ──────────────────────────────────────────────────────────────────



// Mail icon
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="M2 8l10 6 10-6"/>
  </svg>
);

// Lock icon
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// Eye icons
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Google icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Apple icon
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// Facebook icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ── GoogleButton ──────────────────────────────────────────────────────────────
const GoogleButton = ({ onSuccess, text = "Continue with Google" }) => {
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleLogin = async () => {
    setGoogleError('');
    const isMobileApp = Capacitor.getPlatform() !== 'web';

    if (isMobileApp) {
      try {
        setLoading(true);
        await GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        }).catch(() => {});

        const result = await GoogleAuth.signIn();
        const idToken = result?.authentication?.idToken || result?.idToken;

        if (!idToken) {
          setGoogleError('Google Sign-In failed.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: idToken }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('tokenNormal', data.token);
          localStorage.setItem('token', data.token);
          if (data.darkMode) localStorage.setItem('darkMode', 'true');
          if (onSuccess) onSuccess();
        } else {
          setGoogleError(data.message || 'Google Sign-In failed.');
        }
      } catch (e) {
        if (e?.error === 'popup_closed_by_user' || e?.code === '12501' || e?.message?.includes('cancel')) {
        } else {
          setGoogleError('Google Sign-In failed.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!window.google) {
        setGoogleError('Google Sign-In is not available.');
        return;
      }
      setLoading(true);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        use_fedcm_for_prompt: false,
        callback: async (response) => {
          try {
            const res = await fetch(`${API_BASE}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();
            if (res.ok) {
              localStorage.setItem('tokenNormal', data.token);
              localStorage.setItem('token', data.token);
              if (data.darkMode) localStorage.setItem('darkMode', 'true');
              if (onSuccess) onSuccess();
            } else {
              setGoogleError(data.message || 'Google Sign-In failed.');
            }
          } catch (e) {
            setGoogleError('Network error. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
        }
      });
    }
  };

  return (
    <div className="w-full">
      {googleError && (
        <div className="mb-2 bg-red-50 text-red-500 p-2 rounded-xl text-xs text-center border border-red-100 font-semibold w-full">
          {googleError}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-750 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin flex-shrink-0" />
        ) : (
          <GoogleIcon />
        )}
        <span>{loading ? 'Connecting with Google…' : text}</span>
      </button>
    </div>
  );
};

// ── FacebookButton ─────────────────────────────────────────────────────────────
const FacebookButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fbError, setFbError] = useState('');

  const handleFacebookLogin = async () => {
    setFbError('');
    const isMobileApp = Capacitor.getPlatform() !== 'web';

    if (isMobileApp) {
      try {
        setLoading(true);
        const { FacebookLogin } = await import('@capacitor-community/facebook-login');
        
        await FacebookLogin.initialize({ appId: FACEBOOK_APP_ID });
        const result = await FacebookLogin.login({ permissions: ['public_profile', 'email'] });

        if (result.accessToken) {
          const res = await fetch(`${API_BASE}/api/auth/facebook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: result.accessToken.token }),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('tokenNormal', data.token);
            localStorage.setItem('token', data.token);
            if (data.darkMode) localStorage.setItem('darkMode', 'true');
            if (onSuccess) onSuccess();
          } else {
            setFbError(data.message || 'Facebook Sign-In failed.');
          }
        } else {
          setFbError('Facebook Sign-In failed.');
        }
      } catch (e) {
        if (e?.message?.includes('cancel') || e?.code === '12501') {
          // User cancelled
        } else {
          setFbError('Facebook Sign-In failed.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Web Facebook SDK flow
      setLoading(true);
      try {
        if (!window.FB) {
          await new Promise((resolve, reject) => {
            window.fbAsyncInit = function() {
              window.FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v19.0'
              });
              resolve();
            };
            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.defer = true;
            script.onerror = () => reject(new Error('Facebook SDK failed to load.'));
            document.head.appendChild(script);
          });
        } else {
          window.FB.init({
            appId: FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v19.0'
          });
        }

        window.FB.login(async (response) => {
          if (response.authResponse) {
            try {
              const res = await fetch(`${API_BASE}/api/auth/facebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: response.authResponse.accessToken }),
              });
              const data = await res.json();
              if (res.ok) {
                localStorage.setItem('tokenNormal', data.token);
                localStorage.setItem('token', data.token);
                if (data.darkMode) localStorage.setItem('darkMode', 'true');
                if (onSuccess) onSuccess();
              } else {
                setFbError(data.message || 'Facebook Sign-In failed.');
              }
            } catch (e) {
              setFbError('Network error. Please try again.');
            }
          } else {
            setFbError('User cancelled login or did not fully authorize.');
          }
          setLoading(false);
        }, { scope: 'public_profile,email' });
      } catch (e) {
        setFbError('Facebook Sign-In is not available.');
        setLoading(false);
      }
    }
  };

  return (
    <>
      {fbError && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-red-50 text-red-500 p-3 rounded-2xl text-xs text-center border border-red-100 font-semibold shadow-lg">
          {fbError}
        </div>
      )}
      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={loading}
        className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all active:scale-95 disabled:opacity-70"
        style={{ background: 'white', border: '1.5px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <FacebookIcon />
        )}
      </button>
    </>
  );
};

// ── Input Field Component ─────────────────────────────────────────────────────
const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, name, autoComplete, rightSlot, onFocus, onBlur, active }) => (
  <div
    className="flex items-center w-full rounded-2xl px-4 py-3.5 gap-3 transition-all duration-200"
    style={{
      background: active ? 'rgba(124,58,237,0.04)' : '#F9F8FF',
      border: active ? '1.5px solid #7C3AED' : '1.5px solid #E8E3FF',
      boxShadow: active ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
    }}
  >
    <span style={{ color: active ? '#7C3AED' : '#A78BFA' }}>
      <Icon />
    </span>
    <input
      name={name}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-gray-400"
      style={{ color: '#1E1B4B' }}
    />
    {rightSlot}
  </div>
);

// ── LoginForm ─────────────────────────────────────────────────────────────────
const LoginForm = ({ onToggleForm, onLoginSuccess, onForgotPassword }) => {
  const [formData, setFormData] = useState({ phoneOrEmail: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: formData.phoneOrEmail, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.darkMode) localStorage.setItem('darkMode', 'true');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-center items-center overflow-y-auto py-8 sm:py-12 px-4"
      style={{ background: 'linear-gradient(160deg, #F5F0FF 0%, #FFFFFF 60%, #EDE9FE 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
      />

      {/* Main Centered Card on Desktop */}
      <div className="w-full max-w-[420px] sm:max-w-[440px] mx-auto bg-white/80 dark:bg-slate-900/80 sm:bg-white sm:dark:bg-slate-900 backdrop-blur-md sm:shadow-2xl rounded-[32px] sm:border border-purple-100/80 dark:border-purple-900/30 p-6 sm:p-8 z-10 flex flex-col">
        {/* Back button */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={onToggleForm}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer"
            style={{ background: 'rgba(124,58,237,0.08)' }}
            title="Back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-2 mb-1 select-none">
            <img 
              src="/zenivio-logo.png" 
              alt="Zenivio Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl shadow-xs" 
            />
            <h1 className="text-3xl font-black bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Zenivio
            </h1>
          </div>

          <div className="text-center mb-6 mt-1">
            <p className="text-lg font-bold" style={{ color: '#1E1B4B' }}>Welcome Back!</p>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Login to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          <InputField
            icon={MailIcon}
            name="phoneOrEmail"
            type="text"
            autoComplete="username"
            placeholder="Email or Phone Number"
            value={formData.phoneOrEmail}
            onChange={handleChange}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField('')}
            active={activeField === 'email'}
          />

          <InputField
            icon={LockIcon}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setActiveField('password')}
            onBlur={() => setActiveField('')}
            active={activeField === 'password'}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ color: '#7C3AED' }}
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-2.5 rounded-xl text-xs text-center border border-red-100 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.97] disabled:opacity-70 mt-1"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full my-5">
          <div className="flex-1 h-px" style={{ background: '#E8E3FF' }} />
          <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: '#E8E3FF' }} />
        </div>

        {/* Social buttons */}
        <div className="flex items-center justify-center w-full">
          <GoogleButton onSuccess={onLoginSuccess} />
        </div>

        {/* Toggle */}
        <p className="text-sm mt-8 text-center" style={{ color: '#6B7280' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-bold hover:opacity-80 transition-opacity"
            style={{ color: '#7C3AED' }}
          >
            Sign Up
          </button>
        </p>
      </div>
      </div>
    </div>
  );
};

export default LoginForm;
