import React from 'react';
import { API_BASE } from '../config';

const NewsSlider = ({ posts, onSeeAll, onCardClick }) => {
  const categories = ['World', 'Technology', 'Sports', 'Business', 'Platform'];
  
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '2h ago';
    }
  };

  return (
    <div className="space-y-3.5 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-850 dark:text-white">Latest News</h2>
        <button onClick={onSeeAll} className="text-xs font-black text-[#7C3AED] hover:underline transition-colors">See All</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x w-full">
        {posts.map((post, idx) => {
          const category = post.category || categories[idx % categories.length];
          const badgeColors = {
            World: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            Technology: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            Sports: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            Business: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            Platform: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
            Announcement: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            News: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
            Update: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
            General: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          };
          const badgeStyle = badgeColors[category] || 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
          
          return (
            <div 
              key={post._id}
              onClick={() => onCardClick && onCardClick(post._id)}
              className="w-52 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-2xl p-3 shrink-0 snap-start active:scale-98 transition-transform cursor-pointer space-y-2.5 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Cover Image */}
                <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex-shrink-0">
                  {post.image ? (
                    <img 
                      src={post.image.startsWith('http') || post.image.startsWith('/api') || post.image.startsWith('data:') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
                      alt="News" 
                      className="w-full h-full object-cover"
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
