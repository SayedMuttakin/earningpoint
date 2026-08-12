import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, MoreVertical, Newspaper, Bookmark, Share2 } from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';
import VerifiedBadge from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import NewsTicker from './NewsTicker';
import NewsSlider from './NewsSlider';

const formatRelativeTime = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

const formatExactDateShort = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return 'Recently';
  }
};

const getCleanShortTime = (post) => {
  if (post.createdAt) {
    return formatRelativeTime(post.createdAt);
  }
  return 'Recently';
};

const CompactNewsCard = ({ post, onClick }) => {
  const category = post.category || 'Latest';
  
  const categoryColors = {
    Latest: 'text-indigo-600 dark:text-indigo-400',
    'Top News': 'text-rose-600 dark:text-rose-400',
    National: 'text-[#7C3AED] dark:text-indigo-400',
    International: 'text-purple-600 dark:text-purple-400',
    Politics: 'text-red-600 dark:text-red-400',
    Economy: 'text-blue-600 dark:text-blue-400',
    Technology: 'text-teal-600 dark:text-teal-400',
    Sports: 'text-orange-600 dark:text-orange-400',
    Entertainment: 'text-pink-600 dark:text-pink-400',
    Education: 'text-sky-600 dark:text-sky-400',
    Jobs: 'text-amber-600 dark:text-amber-400',
    Health: 'text-green-600 dark:text-green-400',
  };
  
  const catClass = categoryColors[category] || 'text-[#7C3AED] dark:text-indigo-400';

  return (
    <div
      id={`post-${post._id}`}
      onClick={onClick}
      className="flex items-center gap-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer select-none"
    >
      {/* Thumbnail Image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
        {post.image ? (
          <img
            src={getImageUrl(post.image)}
            alt={post.title || 'News'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-[#7C3AED] font-black text-2xl">
            Z
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28 py-0.5">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
          {post.title || post.content}
        </h3>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className={`font-black flex-shrink-0 ${catClass}`}>
              {category}
            </span>
            <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">•</span>
            <span className="truncate text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {getCleanShortTime(post)}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }} 
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const RelatedNewsSlider = ({ posts, onSelect }) => {
  const sliderRef = React.useRef(null);

  React.useEffect(() => {
    if (!posts || posts.length <= 1) return;

    const interval = setInterval(() => {
      const container = sliderRef.current;
      if (!container) return;

      const cardWidth = 200; // 192px card + 8px gap
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [posts]);

  return (
    <div 
      ref={sliderRef}
      className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x scroll-smooth w-full"
    >
      {posts.map((rel) => (
        <div 
          key={rel._id}
          onClick={() => onSelect(rel)}
          className="w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2.5 flex-shrink-0 snap-start cursor-pointer hover:shadow-md transition-all space-y-2 select-none flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              {rel.image ? (
                <img src={getImageUrl(rel.image)} alt={rel.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center text-[#7C3AED] font-black text-lg">Z</div>
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {rel.title || rel.content}
            </h4>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[#7C3AED] dark:text-indigo-400 font-extrabold truncate max-w-[80px]">
              {rel.category || 'National'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
              {getCleanShortTime(rel)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const UpdatesPage = ({ onBack, selectedPostId, setSelectedPostId }) => {
  const [internalSelectedPostId, setInternalSelectedPostId] = useState(null);
  const activePostId = selectedPostId || internalSelectedPostId;

  const [posts, setPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_admin_updates') || localStorage.getItem('cached_news_posts');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_admin_updates') || localStorage.getItem('cached_news_posts');
      return !cached;
    } catch (e) {
      return true;
    }
  });
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_global_settings');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  // Single News Detail states
  const [detailPost, setDetailPost] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    const handleReclick = (e) => {
      if (e.detail && e.detail.tab === 'Updates') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handleRefresh();
      }
    };
    window.addEventListener('tabReclickRefresh', handleReclick);
    return () => window.removeEventListener('tabReclickRefresh', handleReclick);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/posts?adminOnly=true`);
      if (response.ok) {
        const data = await response.json();
        const adminPosts = data.filter(post => !post.authorId);
        setPosts(adminPosts);
        localStorage.setItem('cached_admin_updates', JSON.stringify(adminPosts));
      }
    } catch (err) {
      console.error('Failed to fetch updates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/earning/settings`);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
        localStorage.setItem('cached_global_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    // Try to load cached data for instant renders
    const cachedUpdates = localStorage.getItem('cached_admin_updates');
    const cachedSettings = localStorage.getItem('cached_global_settings');
    let hasCache = false;

    if (cachedUpdates) {
      try {
        setPosts(JSON.parse(cachedUpdates));
        hasCache = true;
      } catch (e) {
        console.error('Failed to parse cached updates:', e);
      }
    }
    if (cachedSettings) {
      try {
        setGlobalSettings(JSON.parse(cachedSettings));
        hasCache = true;
      } catch (e) {
        console.error('Failed to parse cached settings:', e);
      }
    }

    if (hasCache) {
      setLoading(false);
    }

    fetchPosts();
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (activePostId) {
        e.preventDefault();
        handleBackToFeed();
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [activePostId]);

  // Fetch news details if activePostId changes
  useEffect(() => {
    const fetchDetailPost = async () => {
      if (!activePostId) {
        setDetailPost(null);
        return;
      }

      // Try finding in existing posts array
      const found = posts.find(p => p._id === activePostId);
      if (found) {
        setDetailPost(found);
        return;
      }

      setDetailLoading(true);
      setDetailError(false);
      try {
        const res = await fetch(`${API_BASE}/api/posts/${activePostId}`);
        if (res.ok) {
          const data = await res.json();
          setDetailPost(data);
        } else {
          setDetailError(true);
        }
      } catch (err) {
        console.error('Failed to fetch news details:', err);
        setDetailError(true);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetailPost();
  }, [activePostId, posts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
    fetchGlobalSettings();
  };

  const handleSelectPost = (postId) => {
    setInternalSelectedPostId(postId);
    if (setSelectedPostId) setSelectedPostId(postId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setInternalSelectedPostId(null);
    if (setSelectedPostId) {
      setSelectedPostId(null);
    }
    setDetailPost(null);
  };

  const formatDateLong = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'Official Update';
    }
  };

const RelatedNewsSlider = ({ posts, onSelect }) => {
  const sliderRef = React.useRef(null);

  React.useEffect(() => {
    if (!posts || posts.length <= 1) return;

    const interval = setInterval(() => {
      const container = sliderRef.current;
      if (!container) return;

      const cardWidth = 200; // 192px card + 8px gap
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [posts]);

  return (
    <div 
      ref={sliderRef}
      className="flex gap-3.5 overflow-x-auto pb-2.5 no-scrollbar snap-x scroll-smooth w-full"
    >
      {posts.map((rel) => (
        <div 
          key={rel._id}
          onClick={() => onSelect(rel)}
          className="w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 rounded-2xl p-3 flex-shrink-0 snap-start cursor-pointer hover:shadow-md transition-all select-none flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              {rel.image ? (
                <img src={getImageUrl(rel.image)} alt={rel.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center text-[#7C3AED] font-black text-lg">Z</div>
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {rel.title || rel.content}
            </h4>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold gap-1.5 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[#7C3AED] dark:text-indigo-400 font-extrabold truncate max-w-[85px]">
              {rel.category || 'National'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap flex-shrink-0">
              {formatRelativeTime(rel.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

  // Render news detail view
  if (selectedPostId) {
    if (detailLoading || (!detailPost && !detailError)) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <span className="text-slate-400 font-bold text-xs animate-pulse">Loading news details...</span>
        </div>
      );
    }

    if (detailError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-4">Failed to load news article details.</p>
          <button 
            onClick={handleBackToFeed}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-900/30 transition-transform active:scale-95"
          >
            Go Back
          </button>
        </div>
      );
    }

    if (detailPost) {
      const rawParagraphs = detailPost.content ? detailPost.content.split('\n\n').filter(p => p.trim()) : [];
      const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : [detailPost.content || ''];
      
      const relatedNews = [...posts]
        .filter(p => p._id !== detailPost._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

      // Determine 3 even positions for Ad Banners inside the article body
      const mid1Index = Math.max(0, Math.floor(paragraphs.length / 3));
      const mid2Index = Math.max(mid1Index + 1, Math.floor((paragraphs.length * 2) / 3));

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col animate-fade-in select-none">
          {/* Top Sticky Header Bar matching screenshot */}
          <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
            <button 
              onClick={handleBackToFeed}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Zenivio News</span>
            <div className="w-9" /> {/* Spacer */}
          </div>

          <div className="max-w-xl mx-auto px-4 w-full pt-4 space-y-4">
            {/* Category Tag */}
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/10 text-[#7C3AED] dark:text-indigo-400 rounded-lg text-xs font-black tracking-wide">
                {detailPost.category || 'National'}
              </span>
            </div>

            {/* Headline Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {detailPost.title}
            </h1>

            {/* Author & Verification Card (Zenivio News with verified badge, clean time display, NO view count) */}
            <div className="flex items-center gap-3 py-2.5 border-y border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white border border-slate-100 dark:border-slate-800 shadow-xs p-[1px]">
                <img src="/zenivio-logo.png" alt="Zenivio News" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm">Zenivio News</span>
                  <VerifiedBadge iconClassName="w-[14px] h-[14px] fill-blue-500 text-white" />
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold block truncate">
                  {detailPost.customTime || `${formatExactDateShort(detailPost.createdAt)} · ${formatRelativeTime(detailPost.createdAt)}`}
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {detailPost.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-[300px]">
                <img 
                  src={getImageUrl(detailPost.image)} 
                  alt={detailPost.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Paragraphs with Exactly 3 Evenly-Spaced Real AdMob Banner Ads */}
            <div className="space-y-4 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal select-text pt-2">
              {paragraphs.map((p, idx) => (
                <React.Fragment key={idx}>
                  <p className="whitespace-pre-wrap">{p}</p>
                  
                  {/* Ad #1: After 1st Section */}
                  {idx === mid1Index && (
                    <div className="my-5">
                      <BannerAd size="big" />
                    </div>
                  )}

                  {/* Ad #2: In the Middle Section */}
                  {idx === mid2Index && (
                    <div className="my-5">
                      <BannerAd size="big" />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Ad #3: At the End of Content */}
              <div className="pt-3">
                <BannerAd size="big" />
              </div>
            </div>

            {/* Related News Slider Section with 3-Second Auto Scroll */}
            {relatedNews.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Related News</h3>
                  <span className="text-xs font-black text-[#7C3AED] dark:text-indigo-400">See all</span>
                </div>
                <RelatedNewsSlider 
                  posts={relatedNews} 
                  onSelect={(rel) => handleSelectPost(rel._id)} 
                />
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Normal List View
  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-0 pb-24 flex flex-col">
        {/* Scrolling News Ticker at the top */}
        <NewsTicker 
          posts={posts} 
          onCardClick={(postId) => handleSelectPost(postId)}
        />

        {/* Horizontal News Cards Slider */}
        {posts && posts.length > 0 && (
          <div className="max-w-xl mx-auto px-4 w-full pt-3 pb-1">
            <NewsSlider 
              posts={posts} 
              onSeeAll={() => {}} 
              onCardClick={(postId) => handleSelectPost(postId)}
            />
          </div>
        )}

        <div className="max-w-xl mx-auto px-4 w-full pt-4">
          {/* Section Header matching screenshot */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#7C3AED] dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Latest News</h2>
            </div>
            <button className="text-xs font-black text-[#7C3AED] dark:text-indigo-400 hover:underline">See all</button>
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 animate-pulse">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {[...posts]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map(post => (
                  <CompactNewsCard 
                    key={post._id} 
                    post={post} 
                    onClick={() => handleSelectPost(post._id)}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold text-sm">
              No news updates available.
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default UpdatesPage;
