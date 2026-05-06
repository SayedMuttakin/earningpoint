import React, { useState } from 'react';
import { API_BASE } from '../config';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID = '410797628659-49d55sis32em5iktc44aj349v9bsqo02.apps.googleusercontent.com';

const GoogleButton = ({ onSuccess }) => {
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
    <div className="w-full flex flex-col items-center">
      {googleError && (
        <div className="mb-3 bg-red-50 text-red-500 p-2 rounded-xl text-xs text-center border border-red-100 font-semibold w-full">
          {googleError}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-[280px] flex items-center justify-center gap-3 bg-[#e44d3a] hover:bg-[#d4402e] active:scale-95 transition-all text-white py-3 px-4 rounded-full font-semibold text-sm shadow-sm disabled:opacity-70"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12.48 10.92v2.8h6.24c-.2 1.68-1.52 4.96-6.24 4.96-3.76 0-6.84-3.16-6.84-7.08s3.08-7.08 6.84-7.08c2.16 0 3.6 1.04 4.16 1.6l2.12-2.12C17.08 2.44 14.96 1.6 12.48 1.6 6.72 1.6 2 6.32 2 12.08s4.72 10.48 10.48 10.48c6.04 0 10.08-4.24 10.08-10.28 0-.84-.12-1.36-.2-1.84h-9.88z" />
          </svg>
        )}
        {loading ? 'Signing in...' : 'Sign In with Google'}
      </button>
    </div>
  );
};

const LoginForm = ({ onToggleForm, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ phoneOrEmail: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState('');

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
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center relative z-10 pb-4">
      {/* Background shape mimicking the bottom right gray wave in screenshot */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-slate-100 rounded-full blur-3xl -z-10 pointer-events-none opacity-60"></div>

      {/* Illustration */}
      <div className="mb-6 w-full flex justify-center">
        <img src="/login-illustration.png" alt="Login Illustration" className="h-40 w-auto object-contain" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#087b7a] mb-1">Let's Start</h1>
        <p className="text-slate-500 text-sm">Sign in to your existing account</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}
        
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 transition-colors ${activeField === 'email' ? 'text-[#087b7a]' : 'text-[#087b7a]'}`} />
            </div>
            <input
              id="phoneOrEmail"
              name="phoneOrEmail"
              type="text"
              required
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField('')}
              className="pl-12 pr-4 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-300 text-sm font-medium text-slate-700 focus:border-[#087b7a] border-[#087b7a]"
              placeholder="email@domain.com"
              value={formData.phoneOrEmail || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 transition-colors ${activeField === 'password' ? 'text-[#087b7a]' : 'text-slate-400'}`} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField('')}
              className={`pl-12 pr-12 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-200 text-sm font-medium text-slate-700 ${activeField === 'password' ? 'border-[#087b7a]' : 'border-slate-200'}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-right mt-2">
            <a href="#" className="text-xs text-slate-600 font-semibold hover:text-[#087b7a]">Forgot Password?</a>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-[180px] flex items-center justify-center bg-[#087b7a] hover:bg-[#065f5e] text-white py-3 rounded-full font-bold tracking-wide shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </div>
      </form>

      <div className="text-center my-6">
        <span className="text-xs text-slate-400 font-medium">Or Connect Using</span>
      </div>

      <GoogleButton onSuccess={onLoginSuccess} />

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-xs font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-[#087b7a] font-bold hover:underline ml-1 uppercase"
          >
            SIGN UP HERE
          </button>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          By continuing, you agree to our <br/>
          <a href="#" className="text-[#087b7a] font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-[#087b7a] font-bold hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
