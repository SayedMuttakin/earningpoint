import React, { useState } from 'react';
import { API_BASE } from '../config';
import { ChevronLeft, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const DeleteAccountPage = ({ onBack, onLogout }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('warning'); // 'warning' | 'confirm'
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('darkMode');
        if (onLogout) onLogout();
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-24">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors mr-4">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Delete Account</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
          <div className="w-full max-w-xl">
            {step === 'warning' && (
              <div
                key="warning"
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-fade-in-up"
              >
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Are you sure?</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Deleting your account is <strong className="text-red-500">permanent</strong> and cannot be undone. All your data, earnings, referral history, and progress will be lost forever.
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-5 mb-8 text-left">
                  <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">You will lose:</h3>
                  <ul className="space-y-2 text-sm text-red-600 dark:text-red-400">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                      All your earnings and wallet balance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                      Your referral code and referral history
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                      Purchase history and order records
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                      Verification status and all personal data
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onBack}
                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div
                key="confirm"
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in-up"
              >
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Confirm Deletion</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your password to permanently delete your account.</p>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center border border-red-100 dark:border-red-800 mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleDelete} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-slate-900 dark:text-white"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('warning')}
                      className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !password}
                      className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isLoading ? 'Deleting...' : 'Delete Forever'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default DeleteAccountPage;
