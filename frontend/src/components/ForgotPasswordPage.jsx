import React, { useState } from 'react';
import { ChevronLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';

const ForgotPasswordPage = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'sent' | 'loading'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setStep('loading');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Always show success regardless of response (anti-enumeration)
      setStep('sent');
    } catch {
      setStep('sent'); // still show success UI
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4">
        {step === 'sent' ? (
          /* ── Success Screen ── */
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center pb-20">
            <div className="w-20 h-20 rounded-3xl bg-[#087b7a]/10 dark:bg-[#087b7a]/20 flex items-center justify-center shadow-sm">
              <CheckCircle className="w-10 h-10 text-[#087b7a]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              Check your email
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              We have sent instructions to recover your password to your email address.
            </p>
            <button
              onClick={onBack}
              className="mt-6 w-full max-w-xs py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-lg"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Input Screen ── */
          <>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              Forgot Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Enter your email account to reset password
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-[#087b7a]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-[#087b7a] dark:focus:border-[#0ea5a4] transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-xs text-red-500 font-semibold">{error}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={step === 'loading'}
                className="w-full py-4 bg-[#087b7a] hover:bg-[#065f5e] text-white font-bold text-base rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-[#087b7a]/30 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {step === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
