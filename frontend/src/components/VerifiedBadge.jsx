import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';

const VerifiedBadge = ({ className = "", iconClassName = "w-4 h-4 fill-blue-500 text-white" }) => {
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = (e) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
  };

  return (
    <>
      <button 
        onClick={togglePopup}
        className={`inline-flex items-center justify-center transition-transform active:scale-90 ${className}`}
        aria-label="Verified Account Information"
      >
        <BadgeCheck className={iconClassName} />
      </button>

      {showPopup && createPortal(
        <AnimatePresence>
          {showPopup && (
            <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center p-0 sm:p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowPopup(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" 
              />
              <motion.div 
                initial={{ y: '100%', opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center z-10 mx-auto"
              >
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mb-6 sm:hidden" />
                <BadgeCheck className="w-10 h-10 fill-blue-500 text-white mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3 text-[19px]">Account information</h3>
                <p className="text-[#536471] dark:text-slate-400 text-[15px] text-center mb-8 leading-relaxed">
                  This account is verified because it has an especially large audience or is notable in government, news, entertainment, or another designated category.
                </p>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-[15px] rounded-full transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default VerifiedBadge;
