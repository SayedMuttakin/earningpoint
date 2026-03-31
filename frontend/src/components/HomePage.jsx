import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';

const PostCard = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textThreshold = 180;
  const shouldTruncate = post.content.length > textThreshold;
  
  const displayContent = isExpanded 
    ? post.content 
    : post.content.slice(0, textThreshold) + (shouldTruncate ? '...' : '');

  // Format date correctly (e.g., Mar 17)
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Today';
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white sm:rounded-2xl border-y sm:border border-slate-100 overflow-hidden shadow-sm"
    >
      {/* Post Header */}
      <div className="p-4 flex items-center gap-2">
        {/* Zenvio Logo */}
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white border border-slate-100 shadow-sm p-[1.5px]">
          <img 
            src="/zenvio-logo.png" 
            alt="Zenvio" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Name & Verified Badge */}
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

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>
        
        {shouldTruncate && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-blue-500 font-bold text-sm mt-1 hover:underline underline-offset-2 transition-all"
          >
            See more
          </button>
        )}
      </div>

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
    </motion.article>
  );
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/posts`);
        if (!response.ok) throw new Error('Failed to fetch updates');
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 sm:bg-transparent">
      {/* Main Column Feed */}
      <main className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 py-3 sm:py-8">
        <div className="flex flex-col gap-3 sm:gap-6">
          
          <AnimatePresence mode="popLayout">
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
          </AnimatePresence>

          {/* End of Feed */}
          {!loading && !error && posts.length > 0 && (
            <div className="py-12 text-center text-slate-400 text-[13px] font-semibold tracking-wide uppercase">
              You Have Caught Up With All Updates!
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default HomePage;
