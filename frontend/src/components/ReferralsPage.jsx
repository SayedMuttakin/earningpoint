import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';
import { 
  ChevronLeft, ChevronRight, Copy, Check, Users, Link, 
  Wallet, Flame, Gift, Lock, Info, CheckCircle2, Tag, HelpCircle
} from 'lucide-react';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import { Share } from '@capacitor/share';

const APP_URL = 'https://zenivio.it.com';

const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return phone || '—';
  return phone.slice(0, 3) + '••••' + phone.slice(-2);
};

const ReferralsPage = ({ onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: 'Loading...',
    friendsInvited: 0,
    completedReferrals: 0,
    totalEarned: 0,
    referrals: [],
    campaignClaimed: false,
    referredByCode: null
  });

  const [globalSettings, setGlobalSettings] = useState({
    referralCampaignTarget: 5,
    referralCampaignReward: 300,
    bkashNumber: '',
    nagadNumber: '',
    rocketNumber: '',
    admobConfig: {}
  });

  // Apply Referral Code states
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [claimingCampaign, setClaimingCampaign] = useState(false);
  const [showRulesPage, setShowRulesPage] = useState(false);

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/earning/settings`);
      const data = await res.json();
      if (res.ok && data) {
        setGlobalSettings(data);
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
    }
  };

  const fetchReferrals = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/referrals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReferralData({
          referralCode: data.referralCode,
          friendsInvited: data.friendsInvited,
          completedReferrals: data.completedReferrals || 0,
          totalEarned: data.totalEarned,
          referrals: data.referrals || [],
          campaignClaimed: !!data.campaignClaimed,
          referredByCode: data.referredByCode || null
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
    fetchGlobalSettings();
    // Prefill pending referral code if stored in localStorage
    const savedCode = localStorage.getItem('pending_referral_code');
    if (savedCode) {
      setInputReferralCode(savedCode);
    }
  }, [fetchReferrals]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReferrals();
    fetchGlobalSettings();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareText = () => `🎉 আমি EarningPoint ব্যবহার করছি! Join করুন এবং ${referralData.referralCode} কোড ব্যবহার করে 60 TK Bonus নিন! 👇`;
  const getShareUrl = () => `${APP_URL}?ref=${referralData.referralCode}`;

  const handleShare = async () => {
    try {
      const canShare = await Share.canShare();
      if (canShare.value) {
        await Share.share({
          title: 'Join EarningPoint — Earn 60 TK Bonus!',
          text: getShareText(),
          url: getShareUrl(),
          dialogTitle: 'Share via',
        });
        return;
      }
    } catch (err) {
      console.log('Capacitor share fallback:', err);
    }
    // Fallback: Copy link
    navigator.clipboard.writeText(getShareUrl());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
    alert('Referral link copied to clipboard!');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputReferralCode(text.trim().toUpperCase());
      }
    } catch (err) {
      console.error('Clipboard paste failed:', err);
      // fallback to input focus
    }
  };

  const handleApplyReferral = async () => {
    if (!inputReferralCode || !inputReferralCode.trim()) {
      setApplyError('Please enter a referral code.');
      return;
    }
    setApplying(true);
    setApplyError('');
    setApplySuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/referrals/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ referralCode: inputReferralCode.trim().toUpperCase() })
      });
      const data = await response.json();
      if (response.ok) {
        setApplySuccess(data.message || 'Referral code applied successfully!');
        localStorage.removeItem('pending_referral_code');
        fetchReferrals();
      } else {
        setApplyError(data.message || 'Failed to apply referral code.');
      }
    } catch (err) {
      setApplyError('Server connection error. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleClaimCampaign = async () => {
    setClaimingCampaign(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/referrals/claim-campaign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Campaign reward claimed successfully!');
        fetchReferrals();
      } else {
        alert(data.message || 'Failed to claim campaign reward.');
      }
    } catch (err) {
      alert('Server connection error. Please try again.');
    } finally {
      setClaimingCampaign(false);
    }
  };

  const campaignTarget = globalSettings.referralCampaignTarget || 5;
  const campaignReward = globalSettings.referralCampaignReward || 300;

  // Render progress steps array
  const steps = [];
  for (let i = 1; i <= campaignTarget; i++) {
    steps.push(i);
  }

  const pendingReferrals = referralData.referrals.filter(r => !r.vpnPurchased);
  const completedReferralsList = referralData.referrals.filter(r => r.vpnPurchased);

  if (showRulesPage) {
    const campaignTarget = globalSettings.referralCampaignTarget || 5;
    const campaignReward = globalSettings.referralCampaignReward || 300;
    const steps = [];
    for (let i = 1; i <= campaignTarget; i++) {
      steps.push(i);
    }
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-6 select-none animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-3xs">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <button 
              onClick={() => setShowRulesPage(false)} 
              className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-transform flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center">
                <Info className="w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-805 dark:text-white leading-tight">Important Information</h1>
                <p className="text-[9.5px] text-slate-405 dark:text-slate-500 font-bold mt-0.5 leading-none">Read the rules carefully before referring</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full px-4 pt-4 space-y-4">
          {/* Rules Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 flex-shrink-0 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                <img 
                  src="/refer_megaphone.png" 
                  alt="Rules Megaphone" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="flex-1 space-y-3">
                {/* Rule 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-955/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-805 dark:text-white leading-tight">One Time Use Only</h4>
                    <p className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-snug">Each referral code can be used only once per account.</p>
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-955/40 text-emerald-605 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-805 dark:text-white leading-tight">Verification Required</h4>
                    <p className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-snug">Rewards are added after the referred user completes registration & verification.</p>
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-955/40 text-rose-655 dark:text-rose-455 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-rose-605">✕</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-805 dark:text-white leading-tight">No Fake Accounts</h4>
                    <p className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-snug">Fake, duplicate or invalid accounts will not be eligible for any rewards.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            <div className="space-y-3">
              {/* Rule 4 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-105 dark:bg-blue-955/40 text-blue-600 dark:text-blue-450 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-805 dark:text-white leading-tight">Campaign Rewards</h4>
                  <p className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-snug">Extra bonuses will be credited after completing campaign conditions.</p>
                </div>
              </div>

              {/* Rule 5 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-105 dark:bg-amber-955/40 text-amber-605 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-805 dark:text-white leading-tight">Right to Change</h4>
                  <p className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-snug">Zenivio reserves the right to modify or cancel any referral campaign at any time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Card */}
          <div className="bg-gradient-to-r from-violet-900 via-indigo-955 to-purple-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 flex-shrink-0 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
                <img 
                  src="/clay_gift_pedestal.png" 
                  alt="Campaign Gift" 
                  className="w-16 h-16 object-contain animate-pulse"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-[9px] font-black text-white w-max">
                  <Flame className="w-3 h-3 text-orange-400 fill-orange-400 animate-pulse" />
                  <span>Current Campaign</span>
                </div>
                <h3 className="text-[14px] font-black tracking-wide block mt-2.5 uppercase text-slate-200">
                  Refer {campaignTarget} Friends
                </h3>
                <h2 className="text-lg font-black text-yellow-350 block mt-0.5 tracking-tight">
                  Earn ৳{campaignReward} Cash
                </h2>
              </div>
            </div>

            {/* Progress Panel */}
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-805 dark:text-white">Your Progress</span>
                <span className="text-[9.5px] font-black text-white bg-indigo-600 px-2.5 py-0.5 rounded-full">
                  {referralData.completedReferrals} / {campaignTarget}
                </span>
              </div>

              {/* Progress step bar */}
              <div className="flex items-center justify-between px-2.5 relative">
                <div className="absolute left-[16px] right-[16px] top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                <div 
                  className="absolute left-[16px] top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0 transition-all duration-500" 
                  style={{ 
                    width: `${Math.min((referralData.completedReferrals / (campaignTarget - 1)) * 100, 100)}%` 
                  }}
                />

                {steps.map((step) => {
                  const isCompleted = step <= referralData.completedReferrals;
                  const isActive = step === referralData.completedReferrals + 1 && step <= campaignTarget;
                  
                  return (
                    <div key={step} className="relative z-10 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : isActive ? (
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-650 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-[11px] shadow-sm">
                          {step}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500 flex items-center justify-center font-black text-[11px]">
                          {step}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions Button */}
              {referralData.campaignClaimed ? (
                <button
                  disabled
                  className="w-full py-3 bg-slate-100 dark:bg-slate-900 text-slate-405 dark:text-slate-600 font-black rounded-xl text-[10.5px] flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/30"
                >
                  <Check className="w-4 h-4" /> Campaign Reward Claimed
                </button>
              ) : referralData.completedReferrals >= campaignTarget ? (
                <button
                  onClick={handleClaimCampaign}
                  disabled={claimingCampaign}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-900 font-black rounded-xl text-[10.5px] shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" /> {claimingCampaign ? 'Claiming...' : `Claim ৳${campaignReward} Cash Now!`}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-slate-50 dark:bg-slate-900 text-slate-450 dark:text-slate-600 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-default border border-slate-100 dark:border-slate-800"
                >
                  <Wallet className="w-3.5 h-3.5 text-slate-400" /> Complete {campaignTarget} Referrals to get ৳{campaignReward}
                </button>
              )}
            </div>
          </div>

          {/* Bottom Note Alert */}
          <div className="bg-indigo-50/20 dark:bg-slate-900 border border-indigo-100/10 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-3xs">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-650 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-black text-slate-655 dark:text-slate-400 leading-relaxed pt-0.5">
              <span className="font-extrabold text-indigo-650 dark:text-indigo-400 mr-1">Note:</span>
              It may take up to 24 hours to reflect rewards in your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-3xs">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-transform">
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-350" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-sm font-black text-slate-800 dark:text-white leading-tight">Referral Code</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 leading-none">Unlock rewards with a referral code</p>
            </div>
            <button onClick={() => setShowRulesPage(true)} className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-750 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors animate-pulse-glow" title="Important Rules Notice">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full px-4 pt-6 space-y-5">
          {/* Main Card: Your Referral Code */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 relative z-10 flex-1">
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">Your Referral Code</span>
                
                {/* Code display inside card */}
                <div className="flex items-center justify-between py-2.5 px-4 bg-white/10 border border-white/20 rounded-2xl mt-2 select-all">
                  <span className="font-mono text-lg font-black tracking-widest truncate">{referralData.referralCode}</span>
                  <button 
                    onClick={handleCopy} 
                    className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'hover:bg-white/10 text-white'}`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Pedestal gift illustration */}
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl shadow-inner flex-shrink-0 animate-bounce relative z-10" style={{ animationDuration: '3s' }}>
                🎁
              </div>
            </div>

            <p className="text-[10px] text-slate-105 font-bold leading-normal mt-4 relative z-10">
              Share your code with friends and earn exciting rewards together!
            </p>
          </div>

          {/* Important Rules banner */}
          <button 
            onClick={() => setShowRulesPage(true)} 
            className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100/50 dark:bg-amber-955/10 dark:hover:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] shadow-3xs"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-black text-xs text-amber-850 dark:text-amber-300 block">Important Notice & Rules</span>
                <span className="text-[9.5px] text-amber-600 dark:text-amber-500 font-bold block mt-0.5">Please read before sharing your referral code</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </button>

          {/* What you can do section */}
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3 ml-1">What you can do</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Invite Friends', desc: 'Share your code with friends', icon: Users, color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' },
                { label: 'Earn Rewards', desc: 'Get coins & bonuses for successful invites', icon: Gift, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
                { label: 'Complete Tasks', desc: 'More tasks, more earnings', icon: CheckCircle2, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
                { label: 'Withdraw', desc: 'Withdraw your earnings anytime', icon: Wallet, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 text-center flex flex-col items-center justify-between min-h-[110px] shadow-3xs hover:-translate-y-0.5 transition-transform duration-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color} flex-shrink-0`}>
                    <item.icon className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="mt-2 flex-1 flex flex-col justify-center">
                    <span className="font-black text-[9.5px] text-slate-800 dark:text-slate-200 block leading-tight">{item.label}</span>
                    <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-bold block leading-tight mt-0.5">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Have a Referral Code Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-3xs">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Have a Referral Code?</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Enter the referral code you received from your friend</p>

            {referralData.referredByCode ? (
              // Already submitted a code
              <div className="flex items-center gap-2.5 py-3 px-4 bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[11px] font-black border border-emerald-100 dark:border-emerald-950/30 mt-4 animate-fade-in">
                <span>✓ Referral code <strong>"{referralData.referredByCode}"</strong> applied successfully!</span>
              </div>
            ) : (
              // Submit code field
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-1.5 focus-within:border-indigo-500/50 transition-colors">
                  <div className="pl-2.5 flex items-center justify-center text-[#7C3AED] dark:text-indigo-400 flex-shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    value={inputReferralCode}
                    onChange={(e) => setInputReferralCode(e.target.value.trim().toUpperCase())}
                    className="flex-1 bg-transparent px-2 py-1 text-xs font-bold text-slate-800 dark:text-white outline-none border-0 placeholder-slate-400 dark:placeholder-slate-600 uppercase"
                  />
                  <button 
                    onClick={handlePaste}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[#7C3AED] dark:text-indigo-400 rounded-xl text-[9.5px] font-black shadow-3xs cursor-pointer active:scale-95 transition-transform"
                  >
                    Paste
                  </button>
                </div>

                {applyError && (
                  <p className="text-[9.5px] text-rose-500 font-black ml-1.5 animate-pulse">❌ {applyError}</p>
                )}
                {applySuccess && (
                  <p className="text-[9.5px] text-emerald-500 font-black ml-1.5">✅ {applySuccess}</p>
                )}

                <div className="flex items-start gap-1.5 text-[9px] text-slate-450 dark:text-slate-500 font-bold leading-relaxed px-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#7C3AED]" />
                  <span>Each code can be used only once per account.</span>
                </div>

                <button
                  onClick={handleApplyReferral}
                  disabled={applying || !inputReferralCode.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-md shadow-indigo-650/20 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" /> {applying ? 'Submitting...' : 'Submit Code & Get Reward'}
                </button>

                <div className="flex items-center justify-center gap-1 text-[8.5px] text-slate-400 dark:text-slate-600 font-bold pt-1">
                  <Lock className="w-3 h-3" /> Your referral code will be used securely
                </div>
              </div>
            )}
          </div>



          {/* Stats Summary row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-3xs text-center">
              <span className="text-xl font-black text-slate-800 dark:text-white block mb-0.5">{referralData.friendsInvited}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Invited</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3 shadow-3xs text-center">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mb-0.5">{referralData.completedReferrals}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">VPN Bought</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-3xs text-center">
              <span className="text-xl font-black text-[#7C3AED] dark:text-indigo-400 block mb-0.5">৳{referralData.totalEarned}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Earned</span>
            </div>
          </div>

          {/* Referral List bottom section */}
          {referralData.referrals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider ml-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7C3AED]" /> Referral List
              </h3>

              {/* Verified Referrals list */}
              {completedReferralsList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 ml-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9.5px] font-black text-emerald-600 uppercase tracking-wider">VPN Purchased ({completedReferralsList.length})</span>
                  </div>
                  {completedReferralsList.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl px-4 py-3 flex items-center justify-between shadow-3xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">{r.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">{maskPhone(r.phone)}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full block">Verified</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">+{r.bonusAwarded}৳</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Referrals list */}
              {pendingReferrals.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 ml-1">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9.5px] font-black text-amber-600 uppercase tracking-wider">Waiting for VPN ({pendingReferrals.length})</span>
                  </div>
                  {pendingReferrals.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between shadow-3xs opacity-85">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">{r.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{maskPhone(r.phone)}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full block">Pending</span>
                        <span className="text-[8px] text-slate-400 font-bold block mt-1">No VPN plan</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <BannerAd globalSettings={globalSettings} />
        </div>
      </div>
    </PullToRefresh>
  );
};

export default ReferralsPage;
