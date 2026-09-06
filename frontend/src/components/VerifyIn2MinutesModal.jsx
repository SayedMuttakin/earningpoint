import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  ArrowLeft, 
  X, 
  ChevronRight, 
  Lock, 
  RotateCw,
  Sparkles,
  KeyRound,
  Check
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
];

export default function VerifyIn2MinutesModal({ isOpen, onClose, onSuccess, initialUser }) {
  const [step, setStep] = useState('overview'); // 'overview' | 'phone_input' | 'email_input' | 'email_otp' | 'success'
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Status
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Phone Form
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [phoneCanResend, setPhoneCanResend] = useState(false);
  const phoneOtpRefs = useRef([]);

  // Email Form
  const [emailInput, setEmailInput] = useState('');
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailTimer, setEmailTimer] = useState(45);
  const [emailCanResend, setEmailCanResend] = useState(false);

  const emailOtpRefs = useRef([]);

  // Fetch current verification status
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account-verify/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsPhoneVerified(Boolean(data.isPhoneVerified));
        setVerifiedPhone(data.verifiedPhone || '');
        setIsEmailVerified(Boolean(data.isEmailVerified));
        setVerifiedEmail(data.verifiedEmail || '');
        if (data.verifiedEmail) setEmailInput(data.verifiedEmail);
        
        if (data.isAccountVerified) {
          setStep('success');
        }
      }
    } catch (err) {
      console.error('Failed to fetch verify status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      fetchStatus();
    }
  }, [isOpen]);

  // Phone timer
  useEffect(() => {
    let interval = null;
    if (step === 'phone_otp' && phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer(t => t - 1), 1000);
    } else if (phoneTimer === 0) {
      setPhoneCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, phoneTimer]);

  // Email timer
  useEffect(() => {
    let interval = null;
    if (step === 'email_otp' && emailTimer > 0) {
      interval = setInterval(() => setEmailTimer(t => t - 1), 1000);
    } else if (emailTimer === 0) {
      setEmailCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, emailTimer]);

  if (!isOpen) return null;

  // ── Step 1: Start Flow ──────────────────────────────────────────────────────────
  const handleStartVerification = () => {
    setError('');
    if (!isPhoneVerified) {
      setStep('phone_input');
    } else if (!isEmailVerified) {
      setStep('email_input');
    } else {
      setStep('success');
    }
  };

  // ── Step 2: Send Phone OTP via BulkSMSDhaka ──
  const handleSendPhoneOTP = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account-verify/phone/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ countryCode, phoneNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send SMS OTP');

      setPhoneTimer(60);
      setPhoneCanResend(false);
      setPhoneOtp(['', '', '', '', '', '']);
      setStep('phone_otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Step 2.5: Verify Phone OTP ──
  const handleVerifyPhoneOTP = async (codeOverride) => {
    const code = codeOverride || phoneOtp.join('');
    if (code.length < 6) {
      setError('Please enter the 6-digit code received on your phone.');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account-verify/phone/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify phone code');

      setIsPhoneVerified(true);
      setVerifiedPhone(data.verifiedPhone || `${countryCode}${phoneNumber}`);

      if (!isEmailVerified) {
        setStep('email_input');
      } else {
        setStep('success');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Step 3: Send Email OTP (Real Email via Hostinger Business Mail) ───────────
  const handleSendEmailOTP = async () => {
    const emailToSend = emailInput || verifiedEmail;
    if (!emailToSend || !emailToSend.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account-verify/email/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: emailToSend })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send email verification code');

      setEmailTimer(45);
      setEmailCanResend(false);
      setEmailOtp(['', '', '', '', '', '']);
      setStep('email_otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Step 4: Verify Email OTP ───────────────────────────────────────────────────
  const handleVerifyEmailOTP = async (codeOverride) => {
    const code = codeOverride || emailOtp.join('');
    if (code.length < 6) {
      setError('Please enter the 6-digit code received in your email.');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account-verify/email/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed. Please check the code.');

      setIsEmailVerified(true);
      setVerifiedEmail(data.verifiedEmail || emailInput);

      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Digit Input Handler
  const handleOtpDigitChange = (digits, setDigits, refs, index, value, onComplete) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newDigits.every(d => d !== '')) {
      onComplete(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (digits, setDigits, refs, index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (setDigits, refs, e, onComplete) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setDigits(arr);
      refs.current[5]?.focus();
      onComplete(pasted);
    }
  };

  // Helper for Stepper Active index
  const getStepperIndex = () => {
    if (step === 'overview') return 0;
    if (step === 'phone_input') return 1;
    if (step === 'email_input' || step === 'email_otp') return 2;
    if (step === 'success') return 3;
    return 0;
  };

  const currentStepperIdx = getStepperIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md md:max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[94vh] md:h-[600px]">
        
        {/* ── DESKTOP LEFT SIDEBAR (Visible on md and up) ── */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-8 flex-col justify-between border-r border-indigo-900/30 relative overflow-hidden select-none">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-white">Account Security</h3>
                <p className="text-[11px] text-indigo-200/70 font-medium">Zenivio Account Verification</p>
              </div>
            </div>

            <h2 className="text-xl font-black text-white leading-tight mt-3">
              Verify in 2 minutes
            </h2>
            <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed">
              Verify your contact details to protect your account and display "Verified" status above your bio.
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="relative z-10 space-y-4 my-auto py-2">
            {/* Step 1: Overview */}
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStepperIdx > 0 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : currentStepperIdx === 0 
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' 
                    : 'bg-white/10 text-white/50'
              }`}>
                {currentStepperIdx > 0 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div>
                <div className={`text-xs font-bold ${currentStepperIdx === 0 ? 'text-white' : 'text-slate-300'}`}>
                  Overview & Status
                </div>
                <div className="text-[10px] text-slate-400">Security checklist</div>
              </div>
            </div>

            {/* Step 2: Phone */}
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isPhoneVerified 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : currentStepperIdx === 1 
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' 
                    : 'bg-white/10 text-white/50'
              }`}>
                {isPhoneVerified ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <div>
                <div className={`text-xs font-bold ${currentStepperIdx === 1 ? 'text-white' : 'text-slate-300'}`}>
                  Phone Number
                </div>
                <div className="text-[10px] text-slate-400">
                  {isPhoneVerified ? '✓ Connected' : 'Save mobile number'}
                </div>
              </div>
            </div>

            {/* Step 3: Email */}
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isEmailVerified 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : currentStepperIdx === 2 
                    ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' 
                    : 'bg-white/10 text-white/50'
              }`}>
                {isEmailVerified ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <div>
                <div className={`text-xs font-bold ${currentStepperIdx === 2 ? 'text-white' : 'text-slate-300'}`}>
                  Email Address
                </div>
                <div className="text-[10px] text-slate-400">
                  {isEmailVerified ? '✓ Verified' : 'Gmail OTP verification'}
                </div>
              </div>
            </div>

            {/* Step 4: Complete */}
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStepperIdx === 3 
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20' 
                  : 'bg-white/10 text-white/50'
              }`}>
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className={`text-xs font-bold ${currentStepperIdx === 3 ? 'text-white' : 'text-slate-300'}`}>
                  Account Verified
                </div>
                <div className="text-[10px] text-slate-400">Verified status shown above bio</div>
              </div>
            </div>
          </div>

          {/* Desktop Reassurance Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-[11px] text-indigo-200/80 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Fast 2-minute setup • Verified details kept secure</span>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT PANEL (Both Desktop & Mobile) ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              {step !== 'overview' && step !== 'success' ? (
                <button 
                  onClick={() => {
                    setError('');
                    if (step === 'phone_otp') setStep('phone_input');
                    else if (step === 'email_otp') setStep('email_input');
                    else setStep('overview');
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : null}
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {step === 'phone_input' && 'Mobile Number'}
                  {step === 'phone_otp' && 'Verify Phone SMS'}
                  {step === 'email_input' && 'Email Verification'}
                  {step === 'email_otp' && 'Verify Your Email'}
                  {step === 'success' && 'Verification Complete'}
                  {step === 'overview' && 'Verify in 2 minutes'}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col justify-between">
            <div>
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in">
                  {error}
                </div>
              )}

              {/* SCREEN 1: OVERVIEW */}
              {step === 'overview' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="text-center pt-1">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                        <ShieldCheck className="w-9 h-9" />
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-3.5">
                      Secure Your Account
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                      Verify your details to protect your account and activate the "Verified" status above your bio.
                    </p>
                  </div>

                  {/* Status Checklist Cards */}
                  <div className="space-y-3 pt-1">
                    {/* Phone Card */}
                    <div 
                      onClick={() => {
                        if (!isPhoneVerified) {
                          setError('');
                          setStep('phone_input');
                        }
                      }}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isPhoneVerified 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isPhoneVerified 
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Phone Number</div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {isPhoneVerified ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                ✔ {verifiedPhone || 'Connected'}
                              </span>
                            ) : (verifiedPhone || 'Not added yet - Tap to add')}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isPhoneVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Email Card */}
                    <div 
                      onClick={() => {
                        if (!isEmailVerified) {
                          setError('');
                          setStep('email_input');
                        }
                      }}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isEmailVerified 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isEmailVerified 
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                        }`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Email (Gmail)</div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                            {isEmailVerified ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                ✔ {verifiedEmail || 'Verified'}
                              </span>
                            ) : (verifiedEmail || 'Not verified - Tap to verify')}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isEmailVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Start CTA Button */}
                  <button
                    onClick={handleStartVerification}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isEmailVerified ? 'View Verification Status' : 'Start Verification'}
                  </button>

                  {/* Mobile-Only "Why Verify?" Box (Hidden on desktop since left panel displays it) */}
                  <div className="md:hidden bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white mb-2">Why Verify?</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      It keeps your account safe and helps you get back in if you ever lose access.
                    </p>
                    <div className="space-y-2.5 text-[11px]">
                      <div className="flex items-start gap-2.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Protection from unauthorized access:</strong>{' '}
                          <span className="text-slate-500 dark:text-slate-400">Only you can access your account with your verified details.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Lock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Easy account recovery:</strong>{' '}
                          <span className="text-slate-500 dark:text-slate-400">Reset your password easily if you ever forget it.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Peace of mind:</strong>{' '}
                          <span className="text-slate-500 dark:text-slate-400">'Verified' status displays above your profile bio.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 2: PHONE INPUT */}
              {step === 'phone_input' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="text-center pt-2">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-3.5">
                      Enter Mobile Number
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Enter your mobile number to link it with your account.
                    </p>
                  </div>

                  {/* Phone Input Box */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Mobile Number
                    </label>
                    <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-white dark:bg-slate-800">
                      {/* Country Code Selector */}
                      <div className="relative border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                        <select
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          className="appearance-none bg-transparent pl-3 pr-7 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-none"
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code} className="dark:bg-slate-900">
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                      </div>

                      {/* Number input */}
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="17XXXXXXXX"
                        className="flex-1 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendPhoneOTP}
                    disabled={actionLoading || !phoneNumber.trim()}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification SMS</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setStep('email_input')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Skip to email verification →
                    </button>
                  </div>
                </div>
              )}

              
              {/* SCREEN 2.5: PHONE OTP */}
              {step === 'phone_otp' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="text-center pt-2">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                      <KeyRound className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-3.5">
                      Verify Your Phone
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      We sent a 6-digit SMS code to <strong className="text-slate-800 dark:text-slate-200">{countryCode} {phoneNumber}</strong>
                    </p>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                    {phoneOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => (phoneOtpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigitChange(phoneOtp, setPhoneOtp, phoneOtpRefs, idx, e.target.value, handleVerifyPhoneOTP)}
                        onKeyDown={e => handleOtpKeyDown(phoneOtp, setPhoneOtp, phoneOtpRefs, idx, e)}
                        onPaste={e => handleOtpPaste(setPhoneOtp, phoneOtpRefs, e, handleVerifyPhoneOTP)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Timer & Resend */}
                  <div className="text-center">
                    {phoneCanResend ? (
                      <button
                        onClick={handleSendPhoneOTP}
                        disabled={actionLoading}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Resend SMS
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Resend SMS in {phoneTimer}s
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleVerifyPhoneOTP()}
                    disabled={actionLoading || phoneOtp.join('').length < 6}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Verify Phone Number'}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setStep('phone_input')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Change mobile number
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 3: EMAIL INPUT */}
              {step === 'email_input' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="text-center pt-2">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                      <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-3.5">
                      Verify Your Email Address
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      We will send a 6-digit verification code to your email inbox.
                    </p>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Email Address (Gmail)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                        autoFocus
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Make sure you have access to this inbox to receive your code.
                    </span>
                  </div>

                  <button
                    onClick={handleSendEmailOTP}
                    disabled={actionLoading || !emailInput.trim()}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* SCREEN 4: EMAIL OTP */}
              {step === 'email_otp' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="text-center pt-2">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                      <KeyRound className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-3.5">
                      Verify Your Email
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      We sent a 6-digit code to <strong className="text-slate-800 dark:text-slate-200">{emailInput || verifiedEmail}</strong>
                    </p>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                    {emailOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => (emailOtpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigitChange(emailOtp, setEmailOtp, emailOtpRefs, idx, e.target.value, handleVerifyEmailOTP)}
                        onKeyDown={e => handleOtpKeyDown(emailOtp, setEmailOtp, emailOtpRefs, idx, e)}
                        onPaste={e => handleOtpPaste(setEmailOtp, emailOtpRefs, e, handleVerifyEmailOTP)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Timer & Resend */}
                  <div className="text-center">
                    {emailCanResend ? (
                      <button
                        onClick={handleSendEmailOTP}
                        disabled={actionLoading}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Resend code
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Resend code in {emailTimer}s
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleVerifyEmailOTP()}
                    disabled={actionLoading || emailOtp.join('').length < 6}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Verify Email'}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setStep('email_input')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Change email address
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 5: SUCCESS */}
              {step === 'success' && (
                <div className="space-y-6 animate-in zoom-in-95 duration-200 text-center pt-2">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 text-white">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                      Verification Complete! 🎉
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                      Your details are confirmed. The <strong>"Verified"</strong> status is now active above your profile bio.
                    </p>
                  </div>

                  {/* Verified details checklist */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-left space-y-3">
                    {verifiedPhone && (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Phone connected
                          <div className="text-[11px] font-mono text-slate-400 font-normal">
                            {verifiedPhone}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`flex items-center gap-3 ${verifiedPhone ? 'pt-2 border-t border-slate-200/50 dark:border-slate-700/50' : ''}`}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Email verified
                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-[240px]">
                          {verifiedEmail || 'Connected'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSuccess) onSuccess();
                      onClose();
                    }}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
                  >
                    Done & Return to Profile
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
