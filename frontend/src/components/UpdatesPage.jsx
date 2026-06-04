import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../config';
import VerifiedBadge from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';

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
          <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">· {formatDate(post.createdAt)}</span>
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
        <div className="text-slate-700 dark:text-slate-350 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {shouldTruncate ? `${post.content.slice(0, textThreshold)}...` : post.content}
          {shouldTruncate && (
            <span className="ml-1 text-indigo-600 font-black text-xs hover:underline">
              Read Details
            </span>
          )}
        </div>
      )}

      {/* Image */}
      {post.image && (
        <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 max-h-[220px]">
          <img 
            src={post.image.startsWith('http') || post.image.startsWith('/api') ? post.image : `${API_BASE}/api/image?file=${encodeURIComponent(post.image)}`} 
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);

  // Single News Detail states
  const [detailPost, setDetailPost] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`);
      if (response.ok) {
        const data = await response.json();
        // Only show updates created by admin (authorId is null)
        const adminPosts = data.filter(post => !post.authorId);
        setPosts(adminPosts);
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
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchGlobalSettings();
  }, []);

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
          {/* Banner Ad */}
          <div className="sticky top-[128px] md:top-16 z-35 w-full bg-slate-50 dark:bg-slate-950 pb-2 pt-2 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4">
            <BannerAd globalSettings={globalSettings} />
          </div>

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
                Zenivio News
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
                    <span className="font-black text-slate-850 dark:text-slate-200 text-xs sm:text-sm">Zenivio Official</span>
                    <VerifiedBadge iconClassName="w-[14px] h-[14px] fill-blue-500 text-white" />
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">{formatDateLong(detailPost.createdAt)}</span>
                </div>
              </div>

              {/* Full News Image Cover */}
              {detailPost.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-xs max-h-[280px]">
                  <img 
                    src={detailPost.image.startsWith('http') || detailPost.image.startsWith('/api') ? detailPost.image : `${API_BASE}/api/image?file=${encodeURIComponent(detailPost.image)}`} 
                    alt="News Details" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Full news text */}
              <div className="text-slate-750 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium select-text">
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 flex flex-col">
        {/* Banner Ad */}
        <div className="sticky top-[128px] md:top-16 z-30 w-full bg-slate-50 dark:bg-slate-950 pb-2 pt-2 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4">
          <BannerAd globalSettings={globalSettings} />
        </div>

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
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-slate-400 font-bold text-sm">Loading updates...</span>
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
