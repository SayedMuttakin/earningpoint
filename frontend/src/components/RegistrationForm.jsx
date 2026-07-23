import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { countries } from '../utils/countries';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID = '1028494965258-90o444tljgmd5r6c5si8d8oc2oudnhnl.apps.googleusercontent.com';

// ── SVG Icons ──────────────────────────────────────────────────────────────────



const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="M2 8l10 6 10-6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const AtSignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="4"/>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
);

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

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── GoogleButton ───────────────────────────────────────────────────────────────
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
    <>
      {googleError && (
        <div className="mb-2 bg-red-50 text-red-500 p-2 rounded-xl text-xs text-center border border-red-100 font-semibold w-full">
          {googleError}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-70"
        style={{
          background: 'white',
          border: '1.5px solid #E5E7EB',
          color: '#374151',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {loading ? 'Signing in…' : 'Sign up with Google'}
      </button>
    </>
  );
};

// ── Input Field ───────────────────────────────────────────────────────────────
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

// ── RegistrationForm ──────────────────────────────────────────────────────────
const RegistrationForm = ({ onToggleForm, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phoneOrEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: 'BGD',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username) { setUsernameStatus(null); return; }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) { setUsernameStatus('invalid'); return; }
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/referrer/${formData.username}`);
        setUsernameStatus(response.ok ? 'taken' : 'available');
      } catch { setUsernameStatus(null); }
      finally { setIsCheckingUsername(false); }
    };
    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refToken = params.get('ref');
    if (refToken) localStorage.setItem('pending_referral_code', refToken);
  }, []);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );
  const selectedCountryObj = countries.find(c => c.id === formData.country) || countries[0];
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[@$!%*?&#]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username?.trim()) { setError('Username is required.'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username.trim())) { setError('Username must be 3-20 characters (letters, numbers, underscore only).'); return; }
    if (usernameStatus === 'taken') { setError('Username is already taken.'); return; }
    if (!/^\d{11}$/.test(formData.phoneOrEmail)) { setError('Phone number must be exactly 11 digits.'); return; }
    if (!isPasswordValid) { setError('Please fix the password requirements.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!agreedTerms) { setError('Please agree to the Terms & Conditions.'); return; }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          phoneOrEmail: formData.phoneOrEmail,
          password: formData.password,
          country: 'Bangladesh',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #F5F0FF 0%, #FFFFFF 60%, #EDE9FE 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
      />

      {/* Back button */}
      <div className="flex items-center px-5 pt-12 pb-2 z-10">
        <button
          type="button"
          onClick={onToggleForm}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: 'rgba(124,58,237,0.08)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-10 z-10">
        {/* Logo — logo.png from assets */}
        <div className="mb-3 mt-1 flex items-center justify-center animate-pulse" style={{ width: 72, height: 72 }}>
          <img
            src="/logo.png"
            alt="Zenivio"
            fetchpriority="high"
            decoding="sync"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <h1 className="text-2xl font-bold mb-0.5" style={{ color: '#1E1B4B' }}>Zenivio</h1>

        <div className="text-center mb-6 mt-3">
          <p className="text-lg font-bold" style={{ color: '#7C3AED' }}>Create Account</p>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Join Zenivio and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {/* Full Name */}
          <InputField
            icon={UserIcon}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setActiveField('name')}
            onBlur={() => setActiveField('')}
            active={activeField === 'name'}
          />

          {/* Username */}
          <div>
            <InputField
              icon={AtSignIcon}
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setActiveField('username')}
              onBlur={() => setActiveField('')}
              active={activeField === 'username'}
            />
            {isCheckingUsername && (
              <p className="text-xs font-semibold ml-2 mt-1 animate-pulse" style={{ color: '#7C3AED' }}>Checking availability…</p>
            )}
            {!isCheckingUsername && formData.username && usernameStatus === 'invalid' && (
              <p className="text-xs font-semibold ml-2 mt-1 text-red-500">3-20 characters, letters/numbers/underscore only</p>
            )}
            {!isCheckingUsername && formData.username && usernameStatus === 'taken' && (
              <p className="text-xs font-semibold ml-2 mt-1 text-red-500">Username already taken ✗</p>
            )}
            {!isCheckingUsername && formData.username && usernameStatus === 'available' && (
              <p className="text-xs font-semibold ml-2 mt-1" style={{ color: '#059669' }}>✓ Username available!</p>
            )}
          </div>

          {/* Phone Number */}
          <InputField
            icon={PhoneIcon}
            name="phoneOrEmail"
            type="tel"
            autoComplete="tel"
            placeholder="Phone Number (11 digits)"
            value={formData.phoneOrEmail}
            onChange={handleChange}
            onFocus={() => setActiveField('phone')}
            onBlur={() => setActiveField('')}
            active={activeField === 'phone'}
          />

          {/* Password */}
          <div>
            <InputField
              icon={LockIcon}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField('')}
              active={activeField === 'password'}
              rightSlot={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 focus:outline-none">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
            {formData.password && !isPasswordValid && (
              <div className="ml-2 mt-1.5 space-y-0.5">
                {!hasMinLength && <p className="text-[11px] text-red-500 font-semibold">• At least 8 characters</p>}
                {!hasUppercase && <p className="text-[11px] text-red-500 font-semibold">• At least 1 uppercase letter</p>}
                {!hasLowercase && <p className="text-[11px] text-red-500 font-semibold">• At least 1 lowercase letter</p>}
                {!hasNumber && <p className="text-[11px] text-red-500 font-semibold">• At least 1 number</p>}
                {!hasSpecial && <p className="text-[11px] text-red-500 font-semibold">• At least 1 special character (@$!%*?&#)</p>}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <InputField
              icon={LockIcon}
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setActiveField('confirmPassword')}
              onBlur={() => setActiveField('')}
              active={activeField === 'confirmPassword'}
              rightSlot={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 focus:outline-none">
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-[11px] text-red-500 font-semibold ml-2 mt-1">• Passwords do not match</p>
            )}
          </div>



          {/* Terms checkbox */}
          <button
            type="button"
            onClick={() => setAgreedTerms(!agreedTerms)}
            className="flex items-start gap-3 w-full text-left active:opacity-80"
          >
            <div
              className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
              style={{
                background: agreedTerms ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'white',
                border: agreedTerms ? 'none' : '1.5px solid #C4B5FD',
              }}
            >
              {agreedTerms && <CheckIcon />}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
              I agree to the{' '}
              <span className="font-bold" style={{ color: '#7C3AED' }}>Terms & Conditions</span>
              {' '}and{' '}
              <span className="font-bold" style={{ color: '#7C3AED' }}>Privacy Policy</span>
            </p>
          </button>

          {error && (
            <div className="bg-red-50 text-red-500 p-2.5 rounded-xl text-xs text-center border border-red-100 font-semibold">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || usernameStatus === 'taken'}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.97] disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-sm mt-6 text-center" style={{ color: '#6B7280' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-bold hover:opacity-80 transition-opacity"
            style={{ color: '#7C3AED' }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
