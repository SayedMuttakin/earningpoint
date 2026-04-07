import React, { useState } from 'react';
import { API_BASE } from '../config';
import { ChevronLeft, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const ChangePasswordPage = ({ onBack }) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to change password');
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
          <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 mb-6 shadow-sm">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create New Password</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Your new password must be different from previous used passwords.</p>

            {success ? (
              <div className="flex flex-col items-center py-8 text-center animate-fade-in-up">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Changed!</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Your password has been changed successfully.</p>
                <button onClick={onBack} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                  Back to Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center border border-red-100 dark:border-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Old Password</label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      required
                      className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Enter old password"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                      {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Must be at least 6 characters"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Repeat new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors active:scale-95 mt-6 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Changing...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ChangePasswordPage;
