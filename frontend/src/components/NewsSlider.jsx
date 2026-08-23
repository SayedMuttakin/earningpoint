import React, { useEffect, useRef } from 'react';
import { API_BASE, getImageUrl } from '../config';

const NewsSlider = ({ posts, onSeeAll, onCardClick }) => {
  const sliderRef = useRef(null);
  const categories = ['World', 'Technology', 'Sports', 'Business', 'Platform'];
  
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '2h ago';
    }
  };

  // 3-Second Auto Scroll
  useEffect(() => {
    if (!posts || posts.length <= 1) return;

    const interval = setInterval(() => {
      const container = sliderRef.current;
      if (!container) return;

      const cardWidth = 224; // 208px card + 16px gap
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000); // 3 seconds per card

    return () => clearInterval(interval);
  }, [posts]);

  return (
    <div className="space-y-3.5 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-850 dark:text-white">Top News</h2>
        <button onClick={onSeeAll} className="text-xs font-black text-[#7C3AED] hover:underline transition-colors">See All</button>
      </div>

      <div 
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x w-full scroll-smooth"
      >
        {posts.map((post, idx) => {
          const category = post.category || categories[idx % categories.length];
          const badgeColors = {
            Latest: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
            'Top News': 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
            National: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            International: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            Politics: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            Economy: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            Technology: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
            Sports: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            Entertainment: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
            Education: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
            Jobs: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            Health: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            Religion: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
            Lifestyle: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
            General: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          };
          const badgeStyle = badgeColors[category] || 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
          
          return (
            <div 
              key={post._id}
              onClick={() => onCardClick && onCardClick(post._id)}
              className="w-52 bg-white dark:bg-slate-900/90 rounded-2xl p-3 shrink-0 snap-start active:scale-98 transition-all cursor-pointer space-y-2.5 shadow-sm hover:shadow-md flex flex-col justify-between border border-slate-100 dark:border-slate-800"
            >
              <div className="space-y-2">
                {/* Cover Image */}
                <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 flex-shrink-0">
                  {post.image ? (
                    <img 
                      src={getImageUrl(post.image, 360)} 
                      alt="News" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] font-black text-lg">
                      Z
                    </div>
                  )}
                </div>

                {/* Category Badge */}
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${badgeStyle}`}>
                  {category}
                </span>

                {/* Title */}
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug">
                  {post.title || post.content}
                </h3>
              </div>

              <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                {post.customTime || formatDate(post.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsSlider;
