import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { Lock, Mail, UserPlus, AtSign, Globe, ChevronDown, Check, Search, Users, Eye, EyeOff } from 'lucide-react';
import { countries } from '../utils/countries';
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
        {loading ? 'Signing in...' : 'Sign Up with Google'}
      </button>
    </div>
  );
};

const RegistrationForm = ({ onToggleForm, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '',
    phoneOrEmail: '', 
    password: '',
    confirmPassword: '',
    referCode: '',
    country: 'BGD' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeField, setActiveField] = useState('');
  
  const [referrerName, setReferrerName] = useState(null);
  const [isCheckingReferrer, setIsCheckingReferrer] = useState(false);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  // Debounced refer code check
  useEffect(() => {
    const checkReferrer = async () => {
      if (!formData.referCode) {
        setReferrerName(null);
        return;
      }
      setIsCheckingReferrer(true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/referrer/${formData.referCode}`);
        const data = await response.json();
        if (response.ok) {
          setReferrerName(data.name);
        } else {
          setReferrerName(null);
        }
      } catch (err) {
        setReferrerName(null);
      } finally {
        setIsCheckingReferrer(false);
      }
    };

    const timer = setTimeout(() => {
      checkReferrer();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.referCode]);

  // Debounced username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username) {
        setUsernameStatus(null);
        return;
      }
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/referrer/${formData.username}`);
        if (response.ok) {
          setUsernameStatus('taken'); 
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        setUsernameStatus(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timer = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refToken = params.get('ref');
    if (refToken) {
      setFormData(prev => ({ ...prev, referCode: refToken }));
    }
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const selectedCountryObj = countries.find(c => c.id === formData.country) || countries[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') {
      setError('Username is already taken. Please choose another one.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
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
          referCode: formData.referCode,
          country: selectedCountryObj.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center relative z-10 pb-4">
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-slate-100 rounded-full blur-3xl -z-10 pointer-events-none opacity-60"></div>

      <div className="mb-6 w-full flex justify-center">
        <img src="/login-illustration.png" alt="Registration Illustration" className="h-40 w-auto object-contain" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#087b7a] mb-1">Create Account</h1>
        <p className="text-slate-500 text-sm">Join us today to get started.</p>
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
              <UserPlus className={`h-5 w-5 transition-colors ${activeField === 'name' ? 'text-[#087b7a]' : 'text-slate-400'}`} />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              onFocus={() => setActiveField('name')}
              onBlur={() => setActiveField('')}
              className={`pl-12 pr-4 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-300 text-sm font-medium text-slate-700 ${activeField === 'name' ? 'border-[#087b7a]' : 'border-slate-200'}`}
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <AtSign className={`h-5 w-5 transition-colors ${activeField === 'username' ? 'text-[#087b7a]' : 'text-slate-400'}`} />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              onFocus={() => setActiveField('username')}
              onBlur={() => setActiveField('')}
              className={`pl-12 pr-4 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-300 text-sm font-medium text-slate-700 ${activeField === 'username' ? 'border-[#087b7a]' : 'border-slate-200'}`}
              placeholder="Username (Referral Code)"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          {isCheckingUsername ? (
            <p className="text-xs text-[#087b7a] font-bold ml-4 mt-1.5 animate-pulse">Checking availability...</p>
          ) : formData.username && usernameStatus === 'taken' ? (
            <p className="text-xs text-red-500 font-bold ml-4 mt-1.5">Username is already taken</p>
          ) : formData.username && usernameStatus === 'available' ? (
            <p className="text-xs text-[#087b7a] font-bold ml-4 mt-1.5">Username is available!</p>
          ) : null}
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 transition-colors ${activeField === 'email' ? 'text-[#087b7a]' : 'text-slate-400'}`} />
            </div>
            <input
              id="phoneOrEmail"
              name="phoneOrEmail"
              type="text"
              required
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField('')}
              className={`pl-12 pr-4 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-300 text-sm font-medium text-slate-700 ${activeField === 'email' ? 'border-[#087b7a]' : 'border-slate-200'}`}
              placeholder="Email or Phone Number"
              value={formData.phoneOrEmail}
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
              placeholder="Password (••••••••)"
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
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 transition-colors ${activeField === 'confirmPassword' ? 'text-[#087b7a]' : 'text-slate-400'}`} />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              onFocus={() => setActiveField('confirmPassword')}
              onBlur={() => setActiveField('')}
              className={`pl-12 pr-12 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-200 text-sm font-medium text-slate-700 ${activeField === 'confirmPassword' ? 'border-[#087b7a]' : 'border-slate-200'}`}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            className="w-full flex items-center justify-between pl-4 pr-5 py-3 bg-white border-2 border-slate-200 rounded-full hover:border-[#087b7a] transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                <img 
                  src={`https://flagcdn.com/w80/${selectedCountryObj.iso}.png`} 
                  alt={selectedCountryObj.name}
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5">Country</p>
                <p className="text-slate-700 text-sm font-medium leading-none">{selectedCountryObj.name}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

            {isCountryDropdownOpen && (
              <div
                className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-[#087b7a] transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, country: country.id });
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors ${formData.country === country.id ? 'bg-[#087b7a]/10' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-4 rounded-sm overflow-hidden flex-shrink-0">
                          <img 
                            src={`https://flagcdn.com/w40/${country.iso}.png`} 
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`text-sm font-medium ${formData.country === country.id ? 'text-[#087b7a]' : 'text-slate-700'}`}>
                          {country.name}
                        </span>
                      </div>
                      {formData.country === country.id && (
                        <Check className="w-4 h-4 text-[#087b7a]" />
                      )}
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-slate-400 text-sm font-medium">No countries found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className={`h-5 w-5 transition-colors ${activeField === 'referCode' ? 'text-[#087b7a]' : 'text-slate-400'}`} />
            </div>
            <input
              id="referCode"
              name="referCode"
              type="text"
              onFocus={() => setActiveField('referCode')}
              onBlur={() => setActiveField('')}
              className={`pl-12 pr-4 block w-full border-2 rounded-full py-3 bg-white outline-none transition-all duration-300 text-sm font-medium text-slate-700 ${activeField === 'referCode' ? 'border-[#087b7a]' : 'border-slate-200'}`}
              placeholder="Refer Code (Optional)"
              value={formData.referCode}
              onChange={handleChange}
            />
          </div>
          {isCheckingReferrer ? (
            <p className="text-xs text-[#087b7a] font-bold ml-4 mt-1.5 animate-pulse">Checking...</p>
          ) : formData.referCode && referrerName ? (
            <p className="text-xs text-[#087b7a] font-bold ml-4 mt-1.5">Referred by: {referrerName}</p>
          ) : formData.referCode ? (
            <p className="text-xs text-red-500 font-bold ml-4 mt-1.5">Invalid refer code</p>
          ) : null}
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isLoading || usernameStatus === 'taken'}
            className="w-[180px] flex items-center justify-center bg-[#087b7a] hover:bg-[#065f5e] text-white py-3 rounded-full font-bold tracking-wide shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70"
          >
            {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
          </button>
        </div>
      </form>

      <div className="text-center my-6">
        <span className="text-xs text-slate-400 font-medium">Or Connect Using</span>
      </div>

      <GoogleButton onSuccess={onRegisterSuccess} />

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-xs font-medium">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-[#087b7a] font-bold hover:underline ml-1 uppercase"
          >
            LOG IN NOW
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

export default RegistrationForm;
