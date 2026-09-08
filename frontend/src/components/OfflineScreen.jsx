import React, { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { API_BASE } from '../config';

const OfflineScreen = ({ onRetrySuccess }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Auto-dismiss if connection is restored in background
  useEffect(() => {
    const handleOnline = async () => {
      const isAlive = await testConnection();
      if (isAlive && onRetrySuccess) {
        onRetrySuccess();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [onRetrySuccess]);

  const testConnection = async () => {
    if (!navigator.onLine) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Quick ping to backend health endpoint or local origin
      const pingUrl = API_BASE ? `${API_BASE}/api/health` : '/favicon.png';
      const res = await fetch(pingUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 500;
    } catch (e) {
      return Boolean(navigator.onLine);
    }
  };

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    setShowErrorToast(false);

    try {
      const isConnected = await testConnection();
      if (isConnected) {
        if (onRetrySuccess) {
          onRetrySuccess();
        } else {
          window.location.reload();
        }
      } else {
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } catch (err) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="flex flex-col items-center max-w-sm w-full mx-auto">
        {/* Cute Astronaut Offline Illustration */}
        <div className="w-56 sm:w-64 max-w-full mb-3 flex items-center justify-center">
          <img 
            src="/offline-astronaut.png" 
            alt="No Internet Connection" 
            className="w-full h-auto object-contain pointer-events-none drop-shadow-sm"
            onError={(e) => {
              e.target.src = '/no-internet.jpg';
            }}
          />
        </div>

        {/* Heading */}
        <h1 className="text-xl sm:text-2xl font-black text-[#151350] dark:text-white tracking-tight mb-2">
          No Internet Connection
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-[280px] sm:max-w-xs leading-relaxed mb-7">
          It seems you're offline. Please check your network connection and try again.
        </p>

        {/* Try Again Button (Identical purple pill matching screenshot) */}
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-[#5542bf] hover:bg-[#4837ab] active:scale-95 text-white font-bold text-sm sm:text-base px-9 py-3 rounded-full flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-75 disabled:scale-100"
        >
          <RotateCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5] ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking...' : 'Try Again'}</span>
        </button>

        {/* Feedback Message if Still Offline */}
        {showErrorToast && (
          <div className="mt-4 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-4 py-2 rounded-xl animate-fade-in">
            Still offline. Please connect to Wi-Fi or Mobile Data and try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineScreen;
