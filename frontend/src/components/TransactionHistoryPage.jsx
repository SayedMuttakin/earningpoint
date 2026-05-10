import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';

const CoinIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F59E0B" />
    <circle cx="16" cy="16" r="12" fill="#FBBF24" />
    <text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fill="#92400E" fontFamily="Arial">$</text>
  </svg>
);

const ArrowDownCircle = () => (
  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-none stroke-current stroke-[2.5]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-5-5m5 5l5-5" />
    </svg>
  </div>
);

const ArrowUpCircle = () => (
  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-none stroke-current stroke-[2.5]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-5 5m5-5l5 5" />
    </svg>
  </div>
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const TransactionHistoryPage = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState('history');

  const fetchTransactions = async (pageNum = 1, isRefresh = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/transactions?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (isRefresh) {
          setTransactions(data.transactions);
        } else {
          setTransactions(prev => [...prev, ...data.transactions]);
        }
        setHasMore(data.currentPage < data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, true);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchTransactions(1, true);
  };

  const historyTxs = transactions.filter(tx => tx.status === 'completed' || tx.status === 'failed');
  const requestTxs = transactions.filter(tx => tx.status === 'pending');
  const displayTxs = activeTab === 'history' ? historyTxs : requestTxs;

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-white dark:bg-slate-900 flex flex-col pb-24 font-sans">
        {/* Header */}
        <div className="bg-[#087b7a] dark:bg-[#065f5e] px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-black text-white">My Transactions</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
                activeTab === 'history'
                  ? 'text-[#087b7a] dark:text-[#0ea5a4]'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              History
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#087b7a] dark:bg-[#0ea5a4] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-[#087b7a] dark:text-[#0ea5a4]'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              Requests
              {activeTab === 'requests' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#087b7a] dark:bg-[#0ea5a4] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 px-4 pt-4">
          {loading && transactions.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#087b7a]" />
            </div>
          ) : displayTxs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Transactions Yet</h2>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayTxs.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div
                    key={tx._id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm active:scale-[0.99] transition-transform"
                  >
                    {/* Arrow icon */}
                    {isCredit ? <ArrowDownCircle /> : <ArrowUpCircle />}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {tx.amount || 0} coins {isCredit ? 'received' : 'deducted'}
                      </p>
                      <p className="text-xs text-[#087b7a] dark:text-[#0ea5a4] font-semibold truncate mt-0.5">
                        {tx.description || (isCredit ? 'Coins Added' : 'Coins Deducted')}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>

                    {/* Amount + Coin icon */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <CoinIcon />
                      <div className="flex flex-col items-end">
                        <span className={`text-lg font-black leading-none ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isCredit ? '+' : '-'}{tx.amount || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">coins</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <div className="flex justify-center mt-6 mb-2">
                  <button
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchTransactions(next);
                    }}
                    className="px-8 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors active:scale-95 text-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default TransactionHistoryPage;
