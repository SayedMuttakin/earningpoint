import React, { useState } from 'react';
import { ChevronLeft, Lock, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../config';

const ResetPasswordPage = ({ token, onDone }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState('input'); // 'input' | 'loading' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setStep('loading');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('success');
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
      } else {
        setError(data.message || 'Reset failed. Link may have expired.');
        setStep('input');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('input');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-20 h-20 rounded-3xl bg-[#087b7a]/10 dark:bg-[#087b7a]/20 flex items-center justify-center shadow-sm mb-6">
          <CheckCircle className="w-10 h-10 text-[#087b7a]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
          Password Reset!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed text-center max-w-xs mb-8">
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <button
          onClick={onDone}
          className="w-full max-w-xs py-4 bg-[#087b7a] hover:bg-[#065f5e] text-white font-bold text-base rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-[#087b7a]/30"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onDone}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          Set New Password
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          Enter and confirm your new password below.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#087b7a]" />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Min 6 characters"
                required
                className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-[#087b7a] dark:focus:border-[#0ea5a4] transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#087b7a]" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repeat new password"
                required
                className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium outline-none focus:border-[#087b7a] dark:focus:border-[#0ea5a4] transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={step === 'loading'}
            className="w-full py-4 bg-[#087b7a] hover:bg-[#065f5e] text-white font-bold text-base rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-[#087b7a]/30 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
          >
            {step === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
