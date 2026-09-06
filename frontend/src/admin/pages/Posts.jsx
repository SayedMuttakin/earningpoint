import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Image as ImageIcon, X, Send, AlertCircle, CheckCircle,
  Edit3, Clock, Tag, Eye, EyeOff, Search, ShieldAlert, Flag,
  ThumbsUp, MessageSquare, RefreshCw, AlertTriangle
} from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';

const CATEGORY_OPTIONS = [
  'Latest', 'Top News', 'National', 'International', 'Politics',
  'Economy', 'Technology', 'Sports', 'Entertainment', 'Education',
  'Jobs', 'Health', 'Religion', 'Lifestyle'
];

const PRESET_WARNINGS = [
  { label: 'Guidelines Violation', title: 'Community Guidelines Violation', message: 'Your post violates Zenivio community guidelines. Please ensure all shared content remains respectful, lawful, and safe for all members.' },
  { label: 'Inappropriate Media', title: 'Sensitive / Inappropriate Media', message: 'Your post contains media that violates our content standards. Further violations may result in account suspension.' },
  { label: 'Spam & Promotion', title: 'Unsolicited Promotion / Spam', message: 'Unauthorized advertising, spam links, or referral spam are prohibited in community posts.' },
  { label: 'Harassment / Abuse', title: 'Harassment Policy Warning', message: 'Your post was reported for harassment or aggressive behavior. Please treat all community members with respect.' },
  { label: 'Misleading Info', title: 'Misleading / Deceptive Content', message: 'Content promoting false claims, scams, or misleading earnings has been flagged by administration.' }
];

const getFormattedCurrentTime = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${weekday}, ${month} ${day}, ${time}`;
};

const Posts = ({ authHeaders, ADMIN_API }) => {
  const [activeTab, setActiveTab] = useState('community');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [warningPost, setWarningPost] = useState(null);
  const [warningReason, setWarningReason] = useState('Community Guidelines Violation');
  const [warningMessage, setWarningMessage] = useState('');
  const [warningSending, setWarningSending] = useState(false);

  const [previewMediaUrl, setPreviewMediaUrl] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [officialPosts, setOfficialPosts] = useState([]);
  const initialFormState = {
    content: '',
    title: '',
    image: null,
    authorName: 'Zenivio',
    isVerified: true,
    category: 'Latest',
    customTime: ''
  };
  const [postForm, setPostForm] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCommunityPosts = useCallback(async (page = 1, search = '', filter = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search.trim(),
        filter
      });
      const res = await fetch(`${ADMIN_API}/posts/manage?${params.toString()}`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.posts || []);
        setTotalPosts(data.totalPosts || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } else {
        setPosts([]);
        setTotalPosts(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching admin posts:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [ADMIN_API, authHeaders]);

  const fetchOfficialPosts = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/posts?adminOnly=true`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setOfficialPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching official posts:', err);
    }
  }, [ADMIN_API, authHeaders]);

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityPosts(currentPage, searchQuery, filterType);
    } else {
      fetchOfficialPosts();
    }
  }, [activeTab, currentPage, filterType, fetchCommunityPosts, fetchOfficialPosts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCommunityPosts(1, searchQuery, filterType);
  };

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    setCurrentPage(1);
    fetchCommunityPosts(1, searchQuery, newFilter);
  };

  const handleToggleHide = async (postId) => {
    setActionLoadingId(postId);
    try {
      const res = await fetch(`${ADMIN_API}/posts/${postId}/toggle-hide`, {
        method: 'PUT',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(prev => prev.map(p => (p._id === postId ? { ...p, isHidden: !p.isHidden } : p)));
        setSuccess(data.message);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to toggle visibility');
      }
    } catch (err) {
      setError('Network error while toggling hide status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      return;
    }
    setActionLoadingId(postId);
    try {
      const res = await fetch(`${ADMIN_API}/posts/${postId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        setOfficialPosts(prev => prev.filter(p => p._id !== postId));
        setTotalPosts(prev => Math.max(0, prev - 1));
        setSuccess('Post removed successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to delete post');
      }
    } catch (err) {
      setError('Network error while deleting post');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenWarning = (post) => {
    setWarningPost(post);
    setWarningReason(PRESET_WARNINGS[0].title);
    setWarningMessage(PRESET_WARNINGS[0].message);
  };

  const handleApplyPresetWarning = (preset) => {
    setWarningReason(preset.title);
    setWarningMessage(preset.message);
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningPost || !warningMessage.trim()) return;

    setWarningSending(true);
    try {
      const res = await fetch(`${ADMIN_API}/posts/${warningPost._id}/warn`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          reason: warningReason,
          warningMessage: warningMessage.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setWarningPost(null);
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError(data.message || 'Failed to send warning');
      }
    } catch (err) {
      setError('Network error while sending warning');
    } finally {
      setWarningSending(false);
    }
  };

  const resetForm = () => {
    setPostForm(initialFormState);
    setImagePreview(null);
    setEditingPostId(null);
    setError(null);
    setSuccess(null);
  };

  const handleToggleAddEdit = () => {
    if (isAdding) {
      setIsAdding(false);
      resetForm();
    } else {
      resetForm();
      setIsAdding(true);
    }
  };

  const handleEditOfficialClick = (post) => {
    setEditingPostId(post._id);
    setPostForm({
      content: post.content || '',
      title: post.title || '',
      image: post.image || null,
      authorName: post.authorName || 'Zenivio',
      isVerified: post.isVerified !== undefined ? post.isVerified : true,
      category: post.category || 'Latest',
      customTime: post.customTime || ''
    });
    setImagePreview(post.image || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 1200;
          if (width > height && width > MAX) {
            height *= MAX / width;
            width = MAX;
          } else if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(dataUrl);
          setPostForm(prev => ({ ...prev, image: dataUrl }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOfficialPost = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!postForm.content.trim() && !postForm.image) {
      return setError('Content or Image is required');
    }

    const payload = {
      ...postForm,
      customTime: postForm.customTime.trim() ? postForm.customTime.trim() : getFormattedCurrentTime()
    };

    try {
      const url = editingPostId ? `${ADMIN_API}/posts/${editingPostId}` : `${ADMIN_API}/posts`;
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(editingPostId ? 'Announcement updated successfully!' : 'Official announcement published!');
        setTimeout(() => {
          setIsAdding(false);
          resetForm();
          fetchOfficialPosts();
          fetchCommunityPosts(1, searchQuery, filterType);
        }, 800);
      } else {
        const data = await res.json();
        setError(data.message || (editingPostId ? 'Failed to update' : 'Failed to create'));
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <MessageSquare className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Post Management</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Monitor community feeds, moderate user posts, hide violations, and dispatch warnings directly to notifications.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex-shrink-0">
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'community'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Community Posts ({totalPosts})
            </button>
            <button
              onClick={() => setActiveTab('official')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'official'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Official News &amp; Broadcasts
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by post text, title, author name, or email/phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-20 py-2.5 text-white font-medium text-xs sm:text-sm outline-none placeholder:text-slate-500"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                        fetchCommunityPosts(1, '', filterType);
                      }}
                      className="text-slate-400 hover:text-white p-1 text-xs"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </form>

              <button
                onClick={() => fetchCommunityPosts(currentPage, searchQuery, filterType)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All Posts' },
                { id: 'user_only', label: 'User Posts Only' },
                { id: 'hidden', label: 'Hidden / Moderated' },
                { id: 'visible', label: 'Visible in Feed' },
                { id: 'reported', label: 'Reported / Flagged' },
                { id: 'official', label: 'Official Broadcasts' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    filterType === f.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-24 bg-[#111827] border border-slate-800 rounded-2xl text-center flex flex-col items-center justify-center gap-3 shadow-lg">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium">Loading community posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 bg-[#111827] border border-slate-800 rounded-2xl text-center p-6 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No posts found</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                No community posts match your current search or filter criteria. Try adjusting your search query.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => {
                const author = post.authorId;
                const isHidden = post.isHidden;
                const reportsCount = (post.reports || []).length;
                const authorAvatar = author?.profilePic || author?.googleAvatar || author?.facebookAvatar;
                const authorName = author?.name || post.authorName || 'Platform User';
                const authorContact = author?.phoneOrEmail || (author?.email ? author.email : 'No email/phone');
                const isOfficial = !author;

                return (
                  <div
                    key={post._id}
                    className={`bg-[#111827] border rounded-2xl p-5 shadow-lg transition-all ${
                      isHidden
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : reportsCount > 0
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : 'border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow">
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-black text-indigo-400">
                              {authorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-white font-bold text-sm tracking-tight">{authorName}</span>
                            {author?.verificationBadge && author.verificationBadge !== 'none' && (
                              <VerifiedBadge type={author.verificationBadge} size="sm" />
                            )}
                            {isOfficial && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                                Official
                              </span>
                            )}
                            {isHidden ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> Hidden from Feed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Visible
                              </span>
                            )}
                            {reportsCount > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
                                <Flag className="w-3 h-3" /> {reportsCount} Report{reportsCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="font-mono text-[11px] text-slate-400">{authorContact}</span>
                            <span>•</span>
                            <span className="text-[11px] text-slate-500">
                              {post.createdAt ? new Date(post.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown date'}
                            </span>
                            {post.category && (
                              <>
                                <span>•</span>
                                <span className="text-[11px] font-bold text-indigo-400 bg-slate-800/80 px-2 py-0.5 rounded">
                                  {post.category}
                                </span>
                              </>
                            )}
                          </div>

                          {post.title && (
                            <h4 className="text-white font-bold text-sm mt-2.5">{post.title}</h4>
                          )}

                          {post.content && (
                            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                              {post.content}
                            </p>
                          )}

                          {(post.image || post.video) && (
                            <div className="mt-3">
                              {post.image && (
                                <div
                                  onClick={() => setPreviewMediaUrl(post.image)}
                                  className="relative inline-block cursor-pointer group rounded-xl overflow-hidden border border-slate-700/80 shadow-md max-w-xs"
                                >
                                  <img
                                    src={post.image}
                                    alt="Post Media"
                                    className="max-h-36 w-auto object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                    Click to enlarge
                                  </div>
                                </div>
                              )}
                              {post.video && (
                                <video
                                  src={post.video}
                                  controls
                                  className="max-h-48 rounded-xl border border-slate-700/80 mt-2"
                                />
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                              {(post.likes || []).length} Likes
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                              {(post.comments || []).length} Comments
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                        <button
                          onClick={() => handleToggleHide(post._id)}
                          disabled={actionLoadingId === post._id}
                          className={`w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isHidden
                              ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border-emerald-800/40'
                              : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border-amber-800/40'
                          }`}
                          title={isHidden ? 'Unhide post so users can see it' : 'Hide post from users feed'}
                        >
                          {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{isHidden ? 'Unhide' : 'Hide'}</span>
                        </button>

                        {author && (
                          <button
                            onClick={() => handleOpenWarning(post)}
                            className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-800/40 transition-all"
                            title="Send warning message to this user's notifications"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Warn User</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePost(post._id)}
                          disabled={actionLoadingId === post._id}
                          className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40 transition-all"
                          title="Permanently delete this post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="text-xs text-slate-400 font-medium">
                Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> &bull; Total <strong className="text-indigo-400">{totalPosts}</strong> posts (20 per page)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                    fetchCommunityPosts(prev, searchQuery, filterType);
                  }}
                  disabled={currentPage === 1 || loading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
                >
                  &larr; Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pNum;
                  if (totalPages <= 5) {
                    pNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pNum = totalPages - 4 + idx;
                  } else {
                    pNum = currentPage - 2 + idx;
                  }

                  return (
                    <button
                      key={pNum}
                      onClick={() => {
                        setCurrentPage(pNum);
                        fetchCommunityPosts(pNum, searchQuery, filterType);
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pNum
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(next);
                    fetchCommunityPosts(next, searchQuery, filterType);
                  }}
                  disabled={currentPage === totalPages || loading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'official' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Platform News &amp; Announcements</h3>
              <p className="text-slate-400 text-xs">Publish pinned updates and news items directly into users' home feeds.</p>
            </div>
            <button
              onClick={handleToggleAddEdit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                isAdding
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500'
              }`}
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? 'Cancel' : 'New Broadcast'}
            </button>
          </div>

          {isAdding && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
              <h4 className="text-base font-black text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
                {editingPostId ? <Edit3 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                {editingPostId ? 'Edit Announcement' : 'Draft New Broadcast'}
              </h4>

              <form onSubmit={handleSubmitOfficialPost} className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Heading (Optional)</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="Enter heading title..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Post Content</label>
                  <textarea
                    rows={5}
                    value={postForm.content}
                    onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                    placeholder="What would you like to announce to users?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={postForm.category}
                      onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                    >
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Author Label</label>
                    <input
                      type="text"
                      value={postForm.authorName}
                      onChange={e => setPostForm({ ...postForm, authorName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Image Attachment</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl cursor-pointer text-xs font-bold border border-slate-700">
                      <ImageIcon className="w-4 h-4" />
                      Choose Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setPostForm({ ...postForm, image: null }); }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-3 max-h-48 rounded-xl border border-slate-800" />
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleToggleAddEdit}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {editingPostId ? 'Save Changes' : 'Publish Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {officialPosts.map((post) => (
              <div 
                key={post._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {post.image && (
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-5 bg-slate-950">
                      <img src={post.image} alt={post.title || "Post"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                        {post.authorName?.charAt(0) || 'Z'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black text-sm">{post.authorName}</span>
                          {post.isVerified && (
                            <VerifiedBadge iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mt-0.5">
                          {post.customTime || new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {post.category && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {post.category}
                      </span>
                    )}
                  </div>
                  
                  {post.title && (
                    <h3 className="text-white font-black text-xl mb-3 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                      {post.title}
                    </h3>
                  )}

                  <p className="text-slate-300 text-[15px] leading-relaxed mb-6 line-clamp-4 flex-1 font-medium">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-800/50">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Post ID: {post._id?.slice(-6)}</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditOfficialClick(post)}
                        className="p-2.5 text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-2xl transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                        title="Edit post"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-95"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && officialPosts.length === 0 && (
            <div className="py-20 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl animate-fade-in">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">No official posts discovered</h3>
              <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto">Start by drafting your first announcement to the platform users.</p>
            </div>
          )}
        </div>
      )}

      {/* Warning Notification Modal */}
      {warningPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Send Warning to Post Author</h3>
              </div>
              <button
                onClick={() => setWarningPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">
                Target User: <strong className="text-white">{warningPost.authorId?.name || warningPost.authorName || 'User'}</strong>
                {warningPost.authorId?.phoneOrEmail && (
                  <span className="text-slate-500 font-mono ml-2">({warningPost.authorId.phoneOrEmail})</span>
                )}
              </div>
              {warningPost.content && (
                <div className="text-slate-400 truncate">
                  Post snippet: <span className="text-slate-300 italic">"{warningPost.content.slice(0, 70)}..."</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Preset Reason
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
                {PRESET_WARNINGS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPresetWarning(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-left transition-all border ${
                      warningReason === preset.title
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700/60'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={warningReason}
                onChange={e => setWarningReason(e.target.value)}
                placeholder="Warning title / reason..."
                className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-white text-xs outline-none mb-3"
              />

              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Notification Message
              </label>
              <textarea
                rows={4}
                value={warningMessage}
                onChange={e => setWarningMessage(e.target.value)}
                placeholder="Write specific instructions or warning for the user..."
                className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-white text-xs outline-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This warning will be delivered immediately to the user's in-app notification inbox.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setWarningPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendWarning}
                disabled={warningSending || !warningMessage.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                {warningSending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{warningSending ? 'Sending...' : 'Send Warning'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Fullscreen Preview Modal */}
      {previewMediaUrl && (
        <div 
          onClick={() => setPreviewMediaUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewMediaUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
