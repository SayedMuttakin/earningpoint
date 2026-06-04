import React from 'react';

const NewsTicker = ({ posts, onCardClick }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-2.5 shadow-2xs border-b border-slate-100 dark:border-slate-850 select-none overflow-hidden w-full">
      <div className="max-w-xl mx-auto px-4 flex items-center">
        {/* Red pulsating active dot */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-black text-[#7C3AED] dark:text-indigo-400 uppercase tracking-widest text-[10px]">
            LATEST NEWS
          </span>
        </div>
        
        {/* Scrolling text marquee container */}
        <div className="flex-1 overflow-hidden ml-4 relative h-5 flex items-center">
          <div
            className="flex whitespace-nowrap absolute left-0 will-change-transform hover:[animation-play-state:paused] cursor-pointer"
            style={{ animation: 'marquee 30s linear infinite' }}
          >
            {/* Render posts twice for a seamless continuous loop */}
            {[...posts, ...posts].map((post, idx) => (
              <span
                key={`${post._id}-${idx}`}
                onClick={() => onCardClick && onCardClick(post._id)}
                className="mx-6 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <span className="text-slate-300 dark:text-slate-700 font-black">•</span>
                {post.title || post.content.substring(0, 60) + "..."}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
