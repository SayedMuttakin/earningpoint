import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';
import { ChevronLeft, Share2, Copy, Check, Users } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const ReferralsPage = ({ onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: 'Loading...',
    friendsInvited: 0,
    totalEarned: 0
  });

  const fetchReferrals = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/referrals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setReferralData({
          referralCode: data.referralCode,
          friendsInvited: data.friendsInvited,
          totalEarned: data.totalEarned
        });
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReferrals();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?ref=${referralData.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join EarningPoint',
          text: `Use my referral code ${referralData.referralCode} to get a 60 TK Bonus!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Referral link copied to clipboard!');
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-slate-50 flex flex-col pb-24">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors mr-4">
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">My Referrals</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
          <div className="w-full max-w-xl flex flex-col items-center">
            
            <div className="bg-white w-full rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden animate-fade-in-up">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-brand-50 rounded-full opacity-50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-brand-100 rounded-full opacity-50 pointer-events-none" />
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mx-auto mb-4 sm:mb-6 shadow-sm relative z-10">
                <Users className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3 relative z-10">Invite Friends & Earn</h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-sm mx-auto relative z-10 font-medium">
                Share your unique code. When your friends register using your link and complete verification, you both earn a <span className="text-brand-600 font-bold">60 TK Bonus!</span>
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 relative z-10 mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Your Unique Referral Code</span>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1.5 sm:p-2 pl-4 sm:pl-6 shadow-sm">
                  <span className="font-mono text-base sm:text-2xl font-bold text-slate-800 tracking-normal sm:tracking-wider truncate">
                    {referralData.referralCode}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
                  >
                    {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleShare}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-base sm:text-lg relative z-10"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> Share Link Now
              </button>
            </div>

            {/* Stats Section */}
            <div className="w-full mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm text-center">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block mb-1">{referralData.friendsInvited}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-500">Friends Invited</span>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm text-center">
                <span className="text-2xl sm:text-3xl font-black text-brand-600 block mb-1">৳{referralData.totalEarned}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-500">Total Earned</span>
              </div>
            </div>

            {/* Promotional Banner */}
            <div className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white text-center shadow-lg relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <div className="relative z-10">
                 <h3 className="text-lg sm:text-xl font-black mb-1 sm:mb-2">Earn Without Limits!</h3>
                 <p className="text-xs sm:text-sm font-medium opacity-90">Invite as many friends as you want. There is no cap on how much you can earn from referrals.</p>
               </div>
               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>
            
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ReferralsPage;
