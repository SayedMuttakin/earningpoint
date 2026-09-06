import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';

const DesktopSidebarRight = ({ 
  currentUser, 
  setActiveTab, 
  setSelectedNewsId 
}) => {
  const [newsPosts, setNewsPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_admin_updates') || localStorage.getItem('cached_news_posts');
      return cached ? JSON.parse(cached).slice(0, 10) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/posts?adminOnly=true`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.posts || []);
          if (items.length > 0) {
            setNewsPosts(items.slice(0, 10));
            localStorage.setItem('cached_admin_updates', JSON.stringify(items));
          }
        }
      } catch (err) {
        console.error('Failed to fetch sidebar news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleOpenNews = (post) => {
    if (setSelectedNewsId) {
      setSelectedNewsId(post._id);
    }
    if (setActiveTab) {
      setActiveTab('Updates');
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const featuredPost = newsPosts.length > 0 ? newsPosts[0] : null;
  const remainingPosts = newsPosts.length > 1 ? newsPosts.slice(1) : [];

  return (
    <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 sticky top-0 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar space-y-3 pb-6 pt-0">
      {/* Main News Container spanning full sidebar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-850 dark:text-white">Latest News</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-tight">Trending Updates</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('Updates')}
            className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-0.5 active:scale-95 transition-transform"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Skeleton */}
        {newsPosts.length === 0 && loading ? (
          <div className="space-y-3 py-2">
            <div className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-2.5 items-center animate-pulse p-1">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : newsPosts.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500">
            <Newspaper className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="font-semibold">No news published yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Featured Hero News Card */}
            {featuredPost && (
              <div
                onClick={() => handleOpenNews(featuredPost)}
                className="group relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="w-full h-36 overflow-hidden relative bg-slate-200 dark:bg-slate-800">
                  {featuredPost.image ? (
                    <img
                      src={getImageUrl(featuredPost.image, 400)}
                      alt={featuredPost.title || 'Featured News'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl">
                      Zenivio
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  
                  {/* Category Pill Overlay */}
                  <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                    {featuredPost.category || 'Top News'}
                  </span>

                  {/* Headline Overlay */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                    <span className="text-[10px] text-white/80 font-medium block">
                      {formatTimeAgo(featuredPost.createdAt)}
                    </span>
                    <h4 className="text-xs font-bold line-clamp-2 leading-snug group-hover:text-rose-200 transition-colors">
                      {featuredPost.title || featuredPost.caption || 'Top News on Zenivio'}
                    </h4>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Compact News Cards List */}
            <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {remainingPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => handleOpenNews(post)}
                  className="flex items-center gap-2.5 pt-2 pb-1 px-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="w-13 h-13 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative">
                    {post.image ? (
                      <img
                        src={getImageUrl(post.image, 160)}
                        alt={post.title || 'News'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center text-rose-500 font-black text-xs">
                        Z
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 truncate max-w-[85px]">
                        {post.category || 'News'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                        • {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {post.title || post.caption || 'Updates from Zenivio'}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebarRight;

