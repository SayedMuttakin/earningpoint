import React, { useState, useEffect } from 'react';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';

const BannerAd468x60 = ({ globalSettings }) => {
  const bannerId = globalSettings?.admobConfig?.bannerAdUnitId;
  if (bannerId && bannerId.trim()) {
    return (
      <div className="sticky top-[158px] sm:top-[166px] md:top-[68px] z-20 w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden my-1">
        <span className="text-xs text-slate-500">AdMob Banner: {bannerId}</span>
      </div>
    );
  }
  return (
    <div className="sticky top-[158px] sm:top-[166px] md:top-[68px] z-20 w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden my-1">
      <span className="absolute top-0 right-0 bg-slate-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-blue-500 font-bold text-xs sm:text-sm">SPONSORED</span>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
        <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-medium">468x60 Banner</span>
      </div>
    </div>
  );
};

const PostAd = ({ index }) => {
  const isLarge = index > 1; // 1st is 320x50, 2nd and 3rd are 320x250
  const sizeText = isLarge ? "320 x 250 Medium Rectangle" : "320 x 50 Responsive Banner";
  
  return (
    <div className="my-6 relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 overflow-hidden group">
      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
        Sponsored
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`w-full ${isLarge ? 'h-64 sm:h-72' : 'h-32 sm:h-20'} bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden transition-all duration-500`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent" />
          <div className="flex flex-col items-center">
            <span className="text-slate-400 font-black text-sm tracking-tight group-hover:scale-105 transition-transform">
              NICE JOB! TEST AD {index}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">{sizeText}</span>
          </div>
        </div>
        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
          Learn More
        </button>
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
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

  const renderContentWithAds = () => {
    if (!isExpanded) {
      return (
        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content.slice(0, textThreshold)}{shouldTruncate ? '...' : ''}
        </p>
      );
    }

    // Split content into paragraphs
    const paragraphs = post.content.split('\n').filter(p => p.trim() !== '');
    
    // If not many paragraphs, just show content
    if (paragraphs.length < 3) {
      return (
        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      );
    }

    // Logic to insert 3 ads
    const adPositions = [
      Math.floor(paragraphs.length / 4),
      Math.floor(paragraphs.length / 2),
      Math.floor((3 * paragraphs.length) / 4)
    ];

    return (
      <div className="space-y-4">
        {paragraphs.map((para, idx) => (
          <React.Fragment key={idx}>
            <p className="text-slate-800 text-[15px] leading-relaxed">
              {para}
            </p>
            {adPositions.includes(idx + 1) && (
              <PostAd index={adPositions.indexOf(idx + 1) + 1} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <article
      id={`post-${post._id}`}
      className="bg-white scroll-mt-24 sm:rounded-2xl border-y sm:border border-slate-100 overflow-hidden shadow-sm animate-fade-in"
    >
      {/* Post Header */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white border border-slate-100 shadow-sm p-[1.5px]">
          <img 
            src="/zenvio-logo.png" 
            alt="Zenvio" 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-[16px] tracking-tight">{post.authorName || 'Zenvio'}</span>
            {post.isVerified !== false && (
              <BadgeCheck className="w-[18px] h-[18px] fill-blue-500 text-white flex-shrink-0" />
            )}
          </div>
          <span className="text-slate-500 text-sm font-medium">· {formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* Post Heading (Title) */}
      {post.title && (
        <div className="px-4 pb-4 pt-1">
          <h2 className="text-2xl sm:text-[32px] font-black text-slate-900 leading-[1.1] tracking-tight decoration-indigo-500/30 underline-offset-8">
            {post.title}
          </h2>
        </div>
      )}

      {/* Post Attachment */}
      {post.image && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl overflow-hidden border border-slate-50 relative group bg-slate-50">
            <img 
              src={post.image} 
              alt="Post attachment"
              className="w-full h-auto object-cover max-h-[500px]"
              loading="lazy"
            />
          </div>
        </div>
      )}
      
      {/* Footer / Interaction - Hidden as requested previously */}
    </article>
  );
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`);
      if (!response.ok) throw new Error('Failed to fetch updates');
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
    fetchGlobalSettings();
  }, []);

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

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="min-h-screen bg-slate-50 sm:bg-transparent flex flex-col">
        {/* Headlines News Ticker */}
        {!loading && !error && posts.length > 0 && (
          <div className="bg-white text-slate-800 py-2.5 sticky top-[132px] sm:top-[140px] md:top-16 z-30 shadow-sm border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="flex items-center gap-2 pr-4 border-r border-slate-200 shrink-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="font-black text-brand-600 uppercase tracking-widest text-xs hidden sm:inline-block">LATEST NEWS</span>
                <span className="font-black text-brand-600 uppercase tracking-widest text-xs sm:hidden">LATEST</span>
              </div>
              <div className="flex-1 overflow-hidden ml-4 relative h-8 flex items-center">
                <div
                  className="flex whitespace-nowrap absolute left-0 will-change-transform animate-marquee"
                  style={{ animation: 'marquee 50s linear infinite' }}
                >
                  {/* Render posts twice for a seamless continuous loop */}
                  {[...posts, ...posts].map((post, idx) => (
                    <a
                      key={`${post._id}-${idx}`}
                      href={`#post-${post._id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`post-${post._id}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mx-10 hover:text-brand-600 transition-colors inline-flex items-center gap-2 text-[15px] font-bold text-slate-700"
                    >
                      {idx > 0 && <span className="text-slate-300 font-black px-4">•</span>}
                      {post.title || post.content.substring(0, 60) + "..."}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner Ad after Latest News */}
        <BannerAd468x60 globalSettings={globalSettings} />

        {/* Main Column Feed */}
        <main className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 py-3 sm:py-8 w-full flex-1">
          <div className="flex flex-col gap-3 sm:gap-6">
            
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="text-slate-400 font-medium text-sm">Loading feed...</span>
                </div>
              ) : error ? (
                <div className="py-20 text-center px-4">
                  <div className="text-slate-500 text-sm">{error}. Please try again later.</div>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <div className="py-20 text-center text-slate-500">
                  No updates available yet.
                </div>
              )}
            </>

            {/* End of Feed */}
            {!loading && !error && posts.length > 0 && (
              <div className="py-12 text-center text-slate-400 text-[13px] font-semibold tracking-wide uppercase">
                You Have Caught Up With All Updates!
              </div>
            )}

          </div>
        </main>
      </div>
    </PullToRefresh>
  );
};

export default HomePage;
