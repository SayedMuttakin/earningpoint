import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';

const TransactionHistoryPage = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'failed': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-24 font-sans transition-colors duration-300">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-4 group active:scale-95">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Transaction History</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading && transactions.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Transactions Yet</h2>
              <p className="text-slate-500 dark:text-slate-400">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-0.5">{tx.description || (tx.type === 'credit' ? 'Money Added' : 'Withdrawal')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{new Date(tx.createdAt).toLocaleString()}</p>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(tx.status)} uppercase tracking-wider`}>
                          {getStatusIcon(tx.status)}
                          <span>{tx.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-black text-lg sm:text-xl ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={() => {
                      setPage(p => p + 1);
                      fetchTransactions(page + 1);
                    }}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors active:scale-95"
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
