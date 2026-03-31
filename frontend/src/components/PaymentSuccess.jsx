import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MessageSquare, ArrowLeft, Send } from 'lucide-react';

const PaymentSuccess = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20"
      >
        <CheckCircle size={48} className="text-white" />
      </motion.div>

      {/* Main Message */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black mb-4 text-slate-900 dark:text-white"
      >
        💳 পেমেন্ট সম্পন্ন হয়েছে — ধন্যবাদ! 🙏
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md font-medium"
      >
        আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে। <br />
        অনুগ্রহ করে নিচের নাম্বারে হোয়াটসঅ্যাপে যোগাযোগ করুন 📲
      </motion.p>

      {/* 3D WhatsApp Logo Animation */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotateZ: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-12"
      >
        <div 
          className="w-32 h-32 bg-[#25D366] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,211,102,0.3)] border-b-8 border-[#1DA851] relative overflow-hidden group cursor-pointer"
          onClick={() => window.open('https://Wa.me/+447476591257', '_blank')}
        >
          <MessageSquare size={64} className="text-white fill-current" />
          
          {/* 3D Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -40],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut"
            }}
            className="absolute top-0 left-1/2 w-4 h-4 bg-[#25D366] rounded-full blur-sm"
          />
        ))}
      </motion.div>

      {/* Action Button */}
      <motion.a
        href="https://Wa.me/+447476591257"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#25D366] text-white px-8 py-4 rounded-[2rem] font-black text-xl flex items-center gap-3 shadow-xl hover:shadow-[#25D366]/40 transition-all mb-8"
      >
        <Send size={24} />
        WhatsApp এ যোগাযোগ করুন
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2 mb-10"
      >
        <p className="text-slate-600 dark:text-slate-400 font-bold">
          🤝 আমরা দ্রুত আপনাকে সহায়তা করার জন্য প্রস্তুত আছি।
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          ধন্যবাদ আমাদের সাথে থাকার জন্য ❤️
        </p>
      </motion.div>

      {/* Back to Home Link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-brand-500 font-bold transition-all text-sm bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <ArrowLeft size={16} />
        হোম পেজে ফিরে যান
      </button>
    </div>
  );
};

export default PaymentSuccess;
