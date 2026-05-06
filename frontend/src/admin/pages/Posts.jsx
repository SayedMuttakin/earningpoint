import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';

const Posts = ({ authHeaders, ADMIN_API }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', title: '', image: null, authorName: 'Zenivio', isVerified: true });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/posts`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // Increased to 15MB since we compress
        setError('Image too large. Max 15MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 70% quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(dataUrl);
          setNewPost({ ...newPost, image: dataUrl });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPost.content.trim()) return setError('Content is required');

    try {
      const res = await fetch(`${ADMIN_API}/posts`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        setSuccess('Post published successfully!');
        setNewPost({ content: '', title: '', image: null, authorName: 'Zenivio', isVerified: true });
        setImagePreview(null);
        setIsAdding(false);
        fetchPosts();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${ADMIN_API}/posts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Home Page Posts</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Manage updates and announcements for the user feed.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black shadow-xl transition-all w-full sm:w-auto active:scale-95 ${
            isAdding 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {isAdding && (
        <div
          className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto relative overflow-hidden animate-fade-in"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl" />
          
          <form onSubmit={handleCreatePost} className="space-y-6 relative z-10">
            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Post Heading (Title)</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                placeholder="Enter post heading..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Post Content</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[150px] transition-all text-base leading-relaxed placeholder:text-slate-600"
                placeholder="What's happening? (supports emojis 🚀)"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Author Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  value={newPost.authorName}
                  onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                />
              </div>
              <div className="flex items-center sm:pt-6">
                <div 
                  onClick={() => setNewPost({...newPost, isVerified: !newPost.isVerified})}
                  className="flex items-center gap-4 cursor-pointer group bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-2xl hover:bg-slate-950 transition-all w-full"
                >
                  <div className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${newPost.isVerified ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${newPost.isVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-white text-sm font-black uppercase tracking-wider">Verified</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Attachment (Image)</label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-3 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-2xl cursor-pointer transition-all border border-slate-700 active:scale-95 group">
                  <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black uppercase tracking-wider">Pick Media</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setNewPost({ ...newPost, image: null }); }}
                    className="px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
                {imagePreview && (
                  <div 
                    className="mt-6 relative rounded-[2rem] overflow-hidden border-2 border-slate-800 group shadow-2xl max-h-[300px] animate-fade-in"
                  >
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                  </div>
                )}
            </div>

            {error && (
              <div 
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-3 animate-fade-in"
              >
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            
            {success && (
              <div 
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold flex items-center gap-3 animate-fade-in"
              >
                <CheckCircle className="w-5 h-5 shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              Publish Update
            </button>
          </form>
        </div>
      )}

      {/* Post List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] animate-pulse relative overflow-hidden" />
          ))
        ) : (
          posts.map(post => (
              <div
                key={post._id}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden group hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-500 flex flex-col h-full animate-fade-in"
              >
              {post.image && (
                <div className="h-48 overflow-hidden relative">
                  <img src={post.image} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black text-lg shadow-inner">
                      {post.authorName?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-black text-sm">{post.authorName}</span>
                        {post.isVerified && (
                          <VerifiedBadge iconClassName="w-3.5 h-3.5 fill-blue-500 text-white flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
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
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-95 translate-x-1"
                    title="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && posts.length === 0 && (
          <div 
            className="py-32 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] animate-fade-in"
          >
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600">
            <ImageIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No posts discovered</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">Start by creating your first announcement to the platform users.</p>
        </div>
      )}
    </div>
  );
};

export default Posts;
