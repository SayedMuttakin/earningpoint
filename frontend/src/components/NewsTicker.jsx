import React from 'react';

const NewsTicker = ({ posts, onCardClick }) => {
  if (!posts || posts.length === 0) return null;

  // Calculate dynamic animation duration so it scrolls slowly and legibly (25s per post, min 60s)
  const animationDuration = Math.max(60, posts.length * 25);

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-3 shadow-2xs border-b border-slate-100 dark:border-slate-850 select-none overflow-hidden w-full">
      <div className="max-w-xl mx-auto px-4 flex items-center">
        {/* Red pulsating active dot */}
        <div className="flex items-center gap-2 pr-3.5 border-r border-slate-200 dark:border-slate-800 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="font-black text-[#7C3AED] dark:text-indigo-400 uppercase tracking-widest text-[11px]">
            LATEST NEWS
          </span>
        </div>
        
        {/* Scrolling text marquee container */}
        <div className="flex-1 overflow-hidden ml-3.5 relative h-6 flex items-center">
          <div
            className="flex whitespace-nowrap absolute left-0 will-change-transform hover:[animation-play-state:paused] active:[animation-play-state:paused] cursor-pointer"
            style={{ animation: `marquee ${animationDuration}s linear infinite` }}
          >
            {/* Render posts twice for a seamless continuous loop */}
            {[...posts, ...posts].map((post, idx) => (
              <span
                key={`${post._id}-${idx}`}
                onClick={() => onCardClick && onCardClick(post._id)}
                className="mx-8 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-2.5 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="text-[#7C3AED] dark:text-indigo-400 font-black text-xs">•</span>
                {post.title || (post.content ? (post.content.length > 70 ? post.content.substring(0, 70) + '...' : post.content) : 'Latest Update')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
