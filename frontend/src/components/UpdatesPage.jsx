import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';
import VerifiedBadge from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import NewsTicker from './NewsTicker';
import NewsSlider from './NewsSlider';

const UpdateCard = ({ post, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textThreshold = 180;
  const shouldTruncate = post.content.length > textThreshold;
  
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Today';
    }
  };

  return (
    <article
      id={`post-${post._id}`}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs animate-fade-in p-4 space-y-3 cursor-pointer active:scale-[0.99] hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white border border-slate-100 dark:border-slate-800 shadow-xs p-[1.5px]">
          <img 
            src="/zenivio-logo.png" 
            alt="Zenivio" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{post.authorName || 'Zenivio'}</span>
          {post.isVerified !== false && (
            <VerifiedBadge iconClassName="w-[14px] h-[14px] fill-blue-500 text-white" />
          )}
          <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">· {post.customTime || formatDate(post.createdAt)}</span>
          {post.category && (
            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-[#7C3AED] dark:text-indigo-400">
              {post.category}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <h2 className="text-base font-black text-slate-950 dark:text-white leading-tight">
          {post.title}
        </h2>
      )}

      {/* Content */}
      {post.content && (
        <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
          {shouldTruncate ? `${post.content.slice(0, textThreshold)}...` : post.content}
          {shouldTruncate && (
            <span className="ml-1 text-indigo-600 font-black text-sm hover:underline">
              Read Details
            </span>
          )}
        </div>
      )}

      {/* Image */}
      {post.image && (
        <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 max-h-[220px]">
          <img 
            src={getImageUrl(post.image)} 
            alt="Attachment"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </article>
  );
};

const UpdatesPage = ({ onBack, selectedPostId, setSelectedPostId }) => {
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
      if (selectedPostId) {
        e.preventDefault();
        handleBackToFeed();
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [selectedPostId]);

  // Fetch news details if selectedPostId changes
  useEffect(() => {
    const fetchDetailPost = async () => {
      if (!selectedPostId) {
        setDetailPost(null);
        return;
      }

      // Try finding in existing posts array
      const found = posts.find(p => p._id === selectedPostId);
      if (found) {
        setDetailPost(found);
        return;
      }

      setDetailLoading(true);
      setDetailError(false);
      try {
        const res = await fetch(`${API_BASE}/api/posts/${selectedPostId}`);
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
  }, [selectedPostId, posts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
    fetchGlobalSettings();
  };

  const handleBackToFeed = () => {
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
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col animate-fade-in select-none">
          {/* Scrolling News Ticker at the top */}
          <NewsTicker 
            posts={posts} 
            onCardClick={(postId) => {
              if (setSelectedPostId) setSelectedPostId(postId);
              setDetailPost(posts.find(p => p._id === postId) || null);
            }}
          />

          <div className="max-w-xl mx-auto px-4 w-full pt-6 flex-1 flex flex-col">
            {/* Back to feed link */}
            <div className="flex items-center gap-3.5 mb-6">
              <button 
                onClick={handleBackToFeed}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 text-slate-700 dark:text-slate-350 shadow-xs"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-black text-slate-400">Back to Updates</span>
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xs">
              <span className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-[#7C3AED] dark:text-indigo-400 rounded-lg text-[10px] font-black tracking-wide">
                {detailPost.category || 'Zenivio News'}
              </span>

              <h1 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white leading-tight">
                {detailPost.title}
              </h1>

              {/* Author & Verification Card */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white border border-slate-100 dark:border-slate-800 shadow-xs p-[1px]">
                  <img src="/zenivio-logo.png" alt="Zenivio" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-850 dark:text-slate-200 text-xs sm:text-sm">{detailPost.authorName || 'Zenivio Official'}</span>
                    {detailPost.isVerified !== false && (
                      <VerifiedBadge iconClassName="w-[14px] h-[14px] fill-blue-500 text-white" />
                    )}
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">{detailPost.customTime || formatDateLong(detailPost.createdAt)}</span>
                </div>
              </div>

              {/* Full News Image Cover */}
              {detailPost.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-xs max-h-[280px]">
                  <img 
                    src={getImageUrl(detailPost.image)} 
                    alt="News Details" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Full news text */}
              <div className="text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-normal select-text">
                {detailPost.content}
              </div>
            </div>
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
          onCardClick={(postId) => {
            if (setSelectedPostId) setSelectedPostId(postId);
            setDetailPost(posts.find(p => p._id === postId) || null);
          }}
        />

        {/* Horizontal News Cards Slider */}
        {posts && posts.length > 0 && (
          <div className="max-w-xl mx-auto px-4 w-full pt-3 pb-1">
            <NewsSlider 
              posts={posts} 
              onSeeAll={() => {}} 
              onCardClick={(postId) => {
                if (setSelectedPostId) setSelectedPostId(postId);
                setDetailPost(posts.find(p => p._id === postId) || null);
              }}
            />
          </div>
        )}

        <div className="max-w-xl mx-auto px-4 w-full pt-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-150 dark:border-slate-800">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-350" />
            </button>
            <h1 className="text-xl font-black text-slate-850 dark:text-white">Official Updates</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                  <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <UpdateCard 
                  key={post._id} 
                  post={post} 
                  onClick={() => setSelectedPostId && setSelectedPostId(post._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold text-sm">
              No official updates available.
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default UpdatesPage;
