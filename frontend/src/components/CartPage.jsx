import React, { useState, useEffect } from 'react';
import { ShoppingCart, Flame, Loader2 } from 'lucide-react';
import PullToRefresh from './PullToRefresh';
import { API_BASE } from '../config';

import BannerAd from './BannerAd';

const CartPage = ({ onBuyNow }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        localStorage.setItem('cached_store_products', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/earning/settings`);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
        localStorage.setItem('cached_global_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    // Try to load cached data for instant renders
    const cachedProducts = localStorage.getItem('cached_store_products');
    const cachedSettings = localStorage.getItem('cached_global_settings');
    let hasCache = false;

    if (cachedProducts) {
      try {
        setProducts(JSON.parse(cachedProducts));
        hasCache = true;
      } catch (e) {
        console.error('Failed to parse cached store products:', e);
      }
    }
    if (cachedSettings) {
      try {
        setGlobalSettings(JSON.parse(cachedSettings));
        hasCache = true;
      } catch (e) {
        console.error('Failed to parse cached settings:', e);
      }
    }

    if (hasCache) {
      setLoading(false);
    }

    fetchProducts();
    fetchGlobalSettings();

    const handleReclick = (e) => {
      if (e.detail && e.detail.tab === 'Cart') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handleRefresh();
      }
    };
    window.addEventListener('tabReclickRefresh', handleReclick);
    return () => window.removeEventListener('tabReclickRefresh', handleReclick);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    fetchGlobalSettings();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="bg-slate-50 dark:bg-slate-950 min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none animate-fade-in">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
          
          {/* Animated Icon Header */}
          <div className="relative mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#7C3AED]/20 to-indigo-500/10 border border-[#7C3AED]/30 flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-[#7C3AED] animate-bounce" />
            </div>
            <span className="absolute -bottom-2 bg-gradient-to-r from-[#7C3AED] to-pink-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
              Marketplace
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Coming Soon!
          </h1>

          {/* Body Paragraphs */}
          <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Cart &amp; Marketplace are currently unavailable.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              A new update is coming very soon.
            </p>
            <p className="text-[#7C3AED] dark:text-indigo-400 font-bold text-xs sm:text-sm">
              Stay tuned for the latest update!
            </p>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default CartPage;
