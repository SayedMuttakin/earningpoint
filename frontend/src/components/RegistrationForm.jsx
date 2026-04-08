import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { Lock, UserPlus, AtSign, Globe, ChevronDown, Check, Search, Users, Eye, EyeOff } from 'lucide-react';
import { countries } from '../utils/countries';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID = '683886612726-hpfnmmev12c8fbl7f4bbe37s03s48r23.apps.googleusercontent.com';

const GoogleButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const isMobileApp = Capacitor.getPlatform() !== 'web';

    if (isMobileApp) {
      try {
        setLoading(true);
        const result = await GoogleAuth.signIn();

        // idToken is what the backend needs for verification
        const idToken = result?.authentication?.idToken || result?.idToken;

        if (!idToken) {
          alert('Google Sign-In failed: No ID token received. Result: ' + JSON.stringify(result));
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
          alert(data.message || 'Google Sign-In failed');
        }
      } catch (e) {
        alert('Google Sign-In error: ' + (e.message || JSON.stringify(e)));
      } finally {
        setLoading(false);
      }
    } else {
      if (!window.google) {
        alert('Google Sign-In is not available. Please refresh the page.');
        return;
      }
      setLoading(true);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        use_fedcm_for_prompt: true,
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
              alert(data.message || 'Google Sign-In failed');
            }
          } catch (e) {
            alert('Network error. Please try again.');
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
    <button
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
  );
};

const RegistrationForm = ({ onToggleForm, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    phoneOrEmail: '', 
    password: '',
    referCode: '',
    country: 'BGD' // Default to Bangladesh
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referrerName, setReferrerName] = useState(null);
  const [isCheckingReferrer, setIsCheckingReferrer] = useState(false);

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
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData.referCode]);

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
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
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
    <div className="w-full">
      <div className="mb-8 lg:hidden text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2 italic">CREATE ACCOUNT</h1>
        <p className="text-slate-500 font-medium">Join us today to get started.</p>
      </div>

      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-2 italic">CREATE ACCOUNT</h2>
        <p className="text-slate-500 font-medium">Join us today to get started.</p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm font-bold text-center border-2 border-rose-100 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="name">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserPlus className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="pl-12 block w-full border-2 border-slate-100 rounded-2xl py-4 px-4 bg-slate-50 outline-none transition-all duration-300 font-semibold focus:border-brand-500"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

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
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="password">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="pl-12 pr-12 block w-full border-2 border-slate-100 rounded-2xl py-4 px-4 bg-slate-50 outline-none transition-all duration-300 font-semibold focus:border-brand-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Country Selection Dropdown */}
        <div className="relative">
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Country</label>
          <button
            type="button"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            className="w-full flex items-center justify-between pl-4 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-brand-200 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                <img 
                  src={`https://flagcdn.com/w80/${selectedCountryObj.iso}.png`} 
                  alt={selectedCountryObj.name}
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Select Country</p>
                <p className="text-slate-900 font-bold">{selectedCountryObj.name}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

            {isCountryDropdownOpen && (
              <div
                className="absolute z-50 left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden backdrop-blur-xl animate-fade-in-up"
              >
                <div className="p-3 border-b-2 border-slate-50 bg-slate-50/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-all font-semibold"
                    />
                  </div>
                </div>
                <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, country: country.id });
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-brand-50 transition-colors ${formData.country === country.id ? 'bg-brand-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 rounded-md overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                          <img 
                            src={`https://flagcdn.com/w40/${country.iso}.png`} 
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`font-bold ${formData.country === country.id ? 'text-brand-600' : 'text-slate-700'}`}>
                          {country.name}
                        </span>
                      </div>
                      {formData.country === country.id && (
                        <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <Globe className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 font-bold">No countries found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Refer Code Field */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="referCode">Refer Code (Optional)</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              id="referCode"
              name="referCode"
              type="text"
              className="pl-12 block w-full border-2 border-slate-100 rounded-2xl py-4 px-4 bg-slate-50 outline-none transition-all duration-300 font-semibold focus:border-brand-500"
              placeholder="Enter refer code if you have one"
              value={formData.referCode}
              onChange={handleChange}
            />
          </div>
          {isCheckingReferrer ? (
            <p className="text-xs text-brand-500 font-bold ml-1 mt-1.5 animate-pulse">Checking...</p>
          ) : formData.referCode && referrerName ? (
            <p className="text-xs text-emerald-500 font-bold ml-1 mt-1.5">Referred by: {referrerName}</p>
          ) : formData.referCode ? (
            <p className="text-xs text-rose-500 font-bold ml-1 mt-1.5">Invalid refer code</p>
          ) : (
            <p className="text-[10px] text-slate-400 font-bold ml-1 mt-1.5 uppercase tracking-wider">Leave blank if you don't have a code</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-700 hover:-translate-y-0.5 active:scale-95 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-brand-200/50 transition-all disabled:opacity-70 mt-2"
        >
          <UserPlus className="w-6 h-6" />
          {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Google Button */}
      <GoogleButton onSuccess={onRegisterSuccess} />

      <div className="mt-6 text-center">
        <p className="text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-brand-600 font-semibold hover:text-brand-700 focus:outline-none focus:underline"
          >
            Log in now
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
