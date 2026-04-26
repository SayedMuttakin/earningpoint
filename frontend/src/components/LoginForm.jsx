import React, { useState } from 'react';
import { API_BASE } from '../config';
import { Lock, LogIn, AtSign, Eye, EyeOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID = '410797628659-49d55sis32em5iktc44aj349v9bsqo02.apps.googleusercontent.com';

const GoogleButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleLogin = async () => {
    setGoogleError('');
    // Check if running in Capacitor mobile app vs web browser
    const isMobileApp = Capacitor.getPlatform() !== 'web';
    
    if (isMobileApp) {
      // Use Capacitor Google Auth plugin for mobile apps
      try {
        setLoading(true);
        
        // Initialize GoogleAuth before signing in (required for some versions)
        await GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        }).catch(() => {}); // ignore if already initialized
        
        const result = await GoogleAuth.signIn();
        
        // idToken is what the backend needs for verification
        const idToken = result?.authentication?.idToken || result?.idToken;
        
        if (!idToken) {
          setGoogleError('Google Sign-In failed. Please try again.');
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
          setGoogleError(data.message || 'Google Sign-In failed. Please try again.');
        }
      } catch (e) {
        // User cancelled sign-in - don't show error
        if (e?.error === 'popup_closed_by_user' || e?.code === '12501' || e?.message?.includes('cancel')) {
          // silently ignore cancellation
        } else {
          setGoogleError('Google Sign-In failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Use web-based Google Sign-In for browser
      if (!window.google) {
        setGoogleError('Google Sign-In is not available. Please refresh the page.');
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
              setGoogleError(data.message || 'Google Sign-In failed. Please try again.');
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
        <div className="mb-3 bg-red-50 text-red-500 p-3 rounded-xl text-sm text-center border border-red-100 font-semibold">
          {googleError}
        </div>
      )}
      <button
        id="google-signin-btn-login"
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95 transition-transform text-slate-700 py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm disabled:opacity-70"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-slate-400 border-t-brand-600 rounded-full animate-spin" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.8549 31.8988 35.111 34.473 32.5568 36.1631V42.1254H40.3302C44.9553 37.8691 47.532 31.7371 47.532 24.5528Z"/>
            <path fill="#34A853" d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3435 42.1254L32.57 36.1631C30.4207 37.6132 27.6547 38.4755 24.48 38.4755C18.2289 38.4755 12.9257 34.1624 11.0057 28.3792H2.95437V34.5244C6.99741 42.5987 15.2959 48.0016 24.48 48.0016Z"/>
            <path fill="#FBBC04" d="M11.0055 28.3792C10.0249 25.3985 10.0249 22.1643 11.0055 19.1836V13.0384H2.95437C-0.969988 20.8848 -0.969988 30.678 2.95437 38.5243L11.0055 28.3792Z"/>
            <path fill="#EA4335" d="M24.48 9.49932C27.8206 9.44641 31.0468 10.7338 33.4619 13.0168L40.4668 6.01196C36.1895 2.55092 30.7437 0.647064 24.48 0.716878C15.2959 0.716878 6.99741 6.11976 2.95437 14.194L11.0055 20.3392C12.9344 14.5477 18.2289 10.2434 24.48 9.49932Z"/>
          </svg>
        )}
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
    </div>
  );
};

const LoginForm = ({ onToggleForm, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ phoneOrEmail: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrEmail: formData.phoneOrEmail,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.darkMode) {
          localStorage.setItem('darkMode', 'true');
        }
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(`Network error: ${err.message}. Base: ${API_BASE}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 lg:hidden">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500">Please enter your details to sign in.</p>
      </div>

      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-500">Please enter your details to sign in.</p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="phoneOrEmail">Email or Phone Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <AtSign className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              id="phoneOrEmail"
              name="phoneOrEmail"
              type="text"
              required
              className="pl-12 block w-full border-2 border-slate-100 rounded-2xl py-4 px-4 bg-slate-50 outline-none transition-all duration-300 font-semibold focus:border-brand-500"
              placeholder="your@email.com or +880 1XX XXX XXXX"
              value={formData.phoneOrEmail || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <a href="#" className="text-sm text-brand-600 hover:text-brand-500 font-medium">Forgot password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="pl-10 pr-12 block w-full border-2 border-slate-100 rounded-xl py-3 px-4 bg-slate-50 outline-none transition-all duration-200 focus:border-brand-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-medium shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70"
        >
          <LogIn className="w-5 h-5" />
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Google Sign-In Button */}
      <GoogleButton onSuccess={onLoginSuccess} />

      <div className="mt-6 text-center">
        <p className="text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-brand-600 font-semibold hover:text-brand-700 focus:outline-none focus:underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
