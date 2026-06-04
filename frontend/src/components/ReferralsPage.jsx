import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';
import { ChevronLeft, Share2, Copy, Check, Users, X, Link, ShieldCheck, Clock } from 'lucide-react';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import { Share } from '@capacitor/share';

const APP_URL = 'https://zenivio.it.com';

const BigAdBanner = ({ globalSettings }) => {
  return (
    <div className="w-full flex justify-center mt-2">
      <BannerAd globalSettings={globalSettings} />
    </div>
  );
};

// Mask phone/email for privacy: show first 3 and last 2 chars
const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return phone || '—';
  return phone.slice(0, 3) + '••••' + phone.slice(-2);
};

const ReferralsPage = ({ onBack, globalSettings }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: 'Loading...',
    friendsInvited: 0,
    completedReferrals: 0,
    totalEarned: 0,
    referrals: [],
  });

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
        });
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const handleRefresh = () => { setRefreshing(true); fetchReferrals(); };

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
    setShowShareSheet(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`${getShareText()} ${getShareUrl()}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setShowShareSheet(false);
  };

  const handleMessenger = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`fb-messenger://share?link=${url}`, '_blank');
    setShowShareSheet(false);
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareSheet(false);
  };

  const handleTelegram = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    setShowShareSheet(false);
  };

  const pendingReferrals = referralData.referrals.filter(r => !r.vpnPurchased);
  const completedReferralsList = referralData.referrals.filter(r => r.vpnPurchased);

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
          <div className="w-full max-w-xl flex flex-col items-center gap-6">

            {/* Main invite card */}
            <div className="bg-white w-full rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-brand-50 rounded-full opacity-50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-brand-100 rounded-full opacity-50 pointer-events-none" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mx-auto mb-4 sm:mb-6 shadow-sm relative z-10">
                <Users className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3 relative z-10">Invite Friends &amp; Earn</h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-sm mx-auto relative z-10 font-medium">
                Share your code. When your friend purchases a <span className="text-brand-600 font-bold">VPN plan</span>, you <strong>both</strong> earn a <span className="text-brand-600 font-bold">60 TK Bonus!</span>
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 relative z-10 mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Your Unique Referral Code</span>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1.5 sm:p-2 pl-4 sm:pl-6 shadow-sm mb-2">
                  <span className="font-mono text-base sm:text-2xl font-bold text-slate-800 tracking-normal sm:tracking-wider truncate">
                    {referralData.referralCode}
                  </span>
                  <button onClick={handleCopy} className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}>
                    {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-medium italic">Note: Your username is your unique referral code.</p>
                <button onClick={handleCopyLink} className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-semibold transition-all ${linkCopied ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  {linkCopied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  {linkCopied ? 'Link Copied!' : 'Copy Referral Link'}
                </button>
              </div>

              <button onClick={handleShare} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-base sm:text-lg relative z-10">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> Share Link Now
              </button>
            </div>

            {/* Stats row */}
            <div className="w-full grid grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                <span className="text-2xl font-black text-slate-900 block mb-1">{referralData.friendsInvited}</span>
                <span className="text-xs font-medium text-slate-500">Invited</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm text-center">
                <span className="text-2xl font-black text-emerald-600 block mb-1">{referralData.completedReferrals}</span>
                <span className="text-xs font-medium text-slate-500">VPN Bought</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                <span className="text-2xl font-black text-brand-600 block mb-1">৳{referralData.totalEarned}</span>
                <span className="text-xs font-medium text-slate-500">Earned</span>
              </div>
            </div>

            <BannerAd globalSettings={globalSettings} />

            {/* ─── Referral List ──────────────────────────────────────────── */}
            {referralData.referrals.length > 0 && (
              <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-500" /> Referral List
                </h3>

                {/* Completed (VPN purchased) */}
                {completedReferralsList.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">VPN Purchased ({completedReferralsList.length})</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {completedReferralsList.map((r) => (
                        <div key={r.id} className="bg-white border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{r.name || 'User'}</p>
                            <p className="text-xs text-slate-400 font-mono">{maskPhone(r.phone)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full block mb-0.5">✅ Verified</span>
                            <span className="text-[10px] text-slate-400">+{r.bonusAwarded}৳</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending (no VPN yet) */}
                {pendingReferrals.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Waiting for VPN ({pendingReferrals.length})</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {pendingReferrals.map((r) => (
                        <div key={r.id} className="bg-white border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm opacity-80">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{r.name || 'User'}</p>
                            <p className="text-xs text-slate-400 font-mono">{maskPhone(r.phone)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full block mb-0.5">⏳ Pending</span>
                            <span className="text-[10px] text-slate-400">No VPN yet</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-3 font-medium">
                      💡 Ask your pending friends to purchase a VPN plan to unlock your 60৳ bonus!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Promo banner */}
            <div className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white text-center shadow-lg relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <div className="relative z-10">
                 <h3 className="text-lg sm:text-xl font-black mb-1 sm:mb-2">Earn Without Limits!</h3>
                 <p className="text-xs sm:text-sm font-medium opacity-90">Invite as many friends as you want. There is no cap on how much you can earn from referrals.</p>
               </div>
               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            <BigAdBanner globalSettings={globalSettings} />
          </div>
        </div>
      </div>

      {/* Share Bottom Sheet */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowShareSheet(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Share via</h3>
              <button onClick={() => setShowShareSheet(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-5">
              <button onClick={handleWhatsApp} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center active:scale-95 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <span className="text-xs font-semibold text-slate-600">WhatsApp</span>
              </button>
              <button onClick={handleFacebook} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center active:scale-95 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-600"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <span className="text-xs font-semibold text-slate-600">Facebook</span>
              </button>
              <button onClick={handleMessenger} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center active:scale-95 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-500"><path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/></svg>
                </div>
                <span className="text-xs font-semibold text-slate-600">Messenger</span>
              </button>
              <button onClick={handleTelegram} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center active:scale-95 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-sky-500"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <span className="text-xs font-semibold text-slate-600">Telegram</span>
              </button>
            </div>
            <button onClick={() => { handleCopyLink(); setShowShareSheet(false); }} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${linkCopied ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
              {linkCopied ? <Check className="w-5 h-5" /> : <Link className="w-5 h-5" />}
              {linkCopied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </PullToRefresh>
  );
};

export default ReferralsPage;
