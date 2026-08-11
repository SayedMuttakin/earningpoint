import React from 'react';
import { Rocket, Sparkles, Download, X } from 'lucide-react';

const AppUpdateModal = ({ updateConfig, onClose }) => {
  if (!updateConfig) return null;
  const { latestAppVersion, forceUpdate, updateNotes } = updateConfig;

  const handleUpdateClick = () => {
    window.location.href = 'https://play.google.com/store/apps/details?id=com.zenivio.app';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !forceUpdate && onClose && onClose()} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-brand-100 dark:border-brand-900 animate-scale-pulse-glow flex flex-col items-center text-center">
        {!forceUpdate && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 mb-4 animate-bounce">
          <Rocket className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-black mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          New Update Available (v{latestAppVersion || '1.0.4'})
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
          Update Zenivio App 🚀
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
          {updateNotes || 'A new update is available on Google Play Store with new features, speed improvements and bug fixes!'}
        </p>

        <div className="w-full space-y-2">
          <button
            onClick={handleUpdateClick}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-xl shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Update Now on Google Play
          </button>

          {!forceUpdate && (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppUpdateModal;
