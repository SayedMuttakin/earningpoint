import React, { useState } from 'react';
import PullToRefresh from './PullToRefresh';
import { CheckCircle, MessageSquare, ArrowLeft, Send } from 'lucide-react';

const PaymentSuccess = ({ paymentMethod, onBack }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const needsReview = ['bkash', 'nagad', 'rocket'].includes(paymentMethod);

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        {/* Success Animation */}
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle size={48} className="text-white" />
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-black mb-4 text-slate-900 dark:text-white animate-fade-in-up">
          {needsReview ? '💳 Payment Completed — Thank you! 🙏' : '🎉 Order Successful!'}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md font-medium animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {paymentMethod === 'cod' ? (
            'Cash on Delivery selected successfully. Please pay when receiving the product.'
          ) : needsReview ? (
            'Your payment has been received and is under review. Admin will verify it shortly.'
          ) : (
            'Your order has been successfully placed and the balance was deducted from your wallet.'
          )}
        </p>

        <div className="space-y-2 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
           <p className="text-slate-600 dark:text-slate-400 font-bold">
            {needsReview ? '🤝 We will process your order shortly.' : '📦 Your order will be processed soon.'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Thank you for staying with us ❤️
          </p>
        </div>

        {/* Back to Home Link */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-brand-500 font-bold transition-all text-sm bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <ArrowLeft size={16} />
          Return to Home Page
        </button>
      </div>
    </PullToRefresh>
  );
};

export default PaymentSuccess;
