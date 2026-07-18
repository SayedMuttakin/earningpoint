import React, { useState } from 'react';
import { 
  ChevronLeft, Trash2, Mail, Shield, AlertTriangle, CheckCircle2, 
  HelpCircle, ExternalLink, Moon, Sun, ArrowRight, User, Info, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicDeleteAccountPage = ({ onBack, darkMode = false, onToggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('inapp'); // 'inapp' | 'request'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getEmailBody = () => {
    return `Hello Zenivio Support,

I am writing to request the permanent deletion of my Zenivio account and all associated personal data in accordance with the platform's Privacy Policy.

Here are my account details:
- Registered Email: ${email || '[Your Registered Email]'}
- Username: ${username || '[Your Username]'}
- Reason for Deletion: ${reason || 'No specific reason provided'}

I confirm that I understand that this action is permanent, and that deleting my account will erase my profile, earnings, coins, posts, messaging history, and referrals forever.

Thank you.`;
  };

  const handleOpenEmail = (e) => {
    e.preventDefault();
    if (!confirmed) return;
    const subject = encodeURIComponent('Zenivio - Account Deletion Request');
    const body = encodeURIComponent(getEmailBody());
    window.location.href = `mailto:support@zenivio.com?subject=${subject}&body=${body}`;
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(getEmailBody());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-300 overflow-y-auto pb-20">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span 
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent cursor-pointer transform hover:scale-105 transition-all duration-300 select-none"
              onClick={onBack}
            >
              Zenivio
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleDarkMode && (
              <button 
                onClick={onToggleDarkMode}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-slate-650 dark:text-slate-350 cursor-pointer active:scale-95"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>
            )}
            <a 
              href="/"
              className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black transition-all duration-300 shadow-sm active:scale-95"
            >
              Launch App
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC HEADER SECTION */}
      <section className="relative overflow-hidden py-12 sm:py-16 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-slate-50 dark:from-slate-900/30 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/40 dark:border-slate-900/80">
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.01] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 dark:bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/45 border border-red-100/60 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-black tracking-wide uppercase mb-6"
          >
            <Shield className="w-3.5 h-3.5" />
            Data Deletion & Safety Compliance
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4"
          >
            Request Account Deletion
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            We respect your privacy. This page provides directions and request forms to permanently erase your Zenivio profile, social history, and associated personal data.
          </motion.p>
        </div>
      </section>

      {/* 3. MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side Panels - Deletion Impact Info */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-inner mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                Deletion is Permanent
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-semibold mb-4">
                Once deleted, your account cannot be recovered. Make sure to read the details below before submitting a request.
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3.5">
                <div>
                  <h4 className="text-xs font-black uppercase text-red-600 dark:text-red-400 mb-1.5">What is Deleted</h4>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Name, username, email & phone
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Coins, rewards & wallet balance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Your social posts, comments & chat history
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Referral logs and referral code connections
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-black uppercase text-slate-650 dark:text-slate-350 mb-1.5">What is Retained</h4>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-450 flex-shrink-0" />
                      Immutable financial/transaction records (strictly for auditing, tax, and anti-fraud regulations)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Compliance FAQ */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-650 dark:text-indigo-400">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-wider">Compliance FAQ</span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-1">How long does deletion take?</h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Requests submitted in-app are processed instantly. Requests submitted via email support are validated and processed within 7 business days.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-1">Can I sign up again?</h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Yes, you can register a new account in the future. However, none of your previous coins, posts, or earnings will be restored.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Request Form Area */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Tab Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
              <button 
                onClick={() => setActiveTab('inapp')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-center transition-all duration-300 cursor-pointer ${activeTab === 'inapp' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Option 1: In-App Deletion
              </button>
              <button 
                onClick={() => setActiveTab('request')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-center transition-all duration-300 cursor-pointer ${activeTab === 'request' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Option 2: External Request Form
              </button>
            </div>

            {/* Tab Contents */}
            <AnimatePresence mode="wait">
              {activeTab === 'inapp' ? (
                <motion.div
                  key="inapp"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant In-App Deletion (Recommended)</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold mt-1">
                        If you still have the Zenivio app installed, you can delete your account instantly yourself without waiting.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4">Follow these simple steps:</h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center justify-center text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Open Settings</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            Launch the Zenivio app on your device, log in, and tap the <strong>Settings (Gear Icon)</strong> in the navigation menu.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center justify-center text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Select "Delete Account"</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            Scroll down to the bottom of the Settings page and select the <strong>Delete Account</strong> option.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center justify-center text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Confirm Deletion</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            Review the warning message, click Continue, and enter your password to permanently delete your profile instantly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/45 text-rose-500 dark:text-rose-455 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Request Generator</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold mt-1">
                        If you cannot access the app or want our compliance team to manually remove your data, generate a pre-filled deletion email request below.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleOpenEmail} className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                          Registered Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. john@example.com"
                          className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner transition-all text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-650 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                          Username or Phone Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. john_doe"
                          className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-650 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                        Reason for Deletion (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please tell us why you wish to delete your account (helps us improve)."
                        className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner transition-all text-sm font-semibold"
                      />
                    </div>

                    {/* Email Template Preview */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Email Request Preview
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyTemplate}
                          className="text-xs font-bold text-indigo-650 dark:text-violet-400 hover:underline cursor-pointer"
                        >
                          {isCopied ? 'Copied! ✅' : 'Copy Template'}
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap select-all font-semibold leading-relaxed max-h-[160px] overflow-y-auto">
                        {getEmailBody()}
                      </pre>
                    </div>

                    {/* Confirmation Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                      />
                      <span className="text-xs text-slate-505 dark:text-slate-400 leading-normal font-semibold">
                        I confirm that I want to delete my Zenivio account and erase my records. I understand that my coins, earnings, and referrals will be deleted permanently.
                      </span>
                    </label>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={!confirmed}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-500 font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 disabled:scale-100 disabled:shadow-none cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        Send Deletion Request Email
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCopyTemplate}
                        className="py-3.5 px-6 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold rounded-xl transition-all active:scale-95 text-xs text-center"
                      >
                        Copy Text to Clipboard
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PublicDeleteAccountPage;
