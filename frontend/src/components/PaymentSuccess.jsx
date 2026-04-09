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
          {needsReview ? '💳 পেমেন্ট সম্পন্ন হয়েছে — ধন্যবাদ! 🙏' : '🎉 অর্ডার সফল হয়েছে!'}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md font-medium animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {needsReview ? (
            <>
              আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে এবং তা রিভিউতে আছে। <br />
              দ্রুত এপ্রুভালের জন্য নিচের নাম্বারে হোয়াটসঅ্যাপে যোগাযোগ করুন 📲
            </>
          ) : paymentMethod === 'cod' ? (
            'ক্যাশ অন ডেলিভারি (Cash on Delivery) সফলভাবে নির্বাচন করা হয়েছে। পণ্য রিসিভ করার সময় মূল্য পরিশোধ করুন।'
          ) : (
            'আপনার অর্ডারটি সফলভাবে প্লেস করা হয়েছে এবং ওয়ালেট থেকে ব্যালেন্স কেটে নেওয়া হয়েছে।'
          )}
        </p>

        {/* Action Button */}
        {needsReview && (
          <a
            href="https://Wa.me/+447476591257"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-8 py-4 rounded-[2rem] font-black text-xl flex items-center gap-3 shadow-xl hover:shadow-[#25D366]/40 transition-all mb-8 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Send size={24} />
            WhatsApp এ যোগাযোগ করুন
          </a>
        )}

        <div className="space-y-2 mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {needsReview ? '🤝 আমরা দ্রুত আপনাকে সহায়তা করার জন্য প্রস্তুত আছি।' : '📦 আপনার অর্ডার শিগগিরই প্রসেস করা হবে।'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            ধন্যবাদ আমাদের সাথে থাকার জন্য ❤️
          </p>
        </div>

        {/* Back to Home Link */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-brand-500 font-bold transition-all text-sm bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <ArrowLeft size={16} />
          হোম পেজে ফিরে যান
        </button>
      </div>
    </PullToRefresh>
  );
};

export default PaymentSuccess;
