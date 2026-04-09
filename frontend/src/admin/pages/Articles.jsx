import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, X, Send, AlertCircle, CheckCircle, Clock, Coins } from 'lucide-react';

const Articles = ({ authHeaders, ADMIN_API }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newArticle, setNewArticle] = useState({ 
    title: '', 
    content: '', 
    coins: 15, 
    readingTime: 60,
    category: 'General' 
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/articles`, { headers: authHeaders });
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newArticle.title.trim()) return setError('Title is required');
    if (!newArticle.content.trim()) return setError('Content is required');

    try {
      const res = await fetch(`${ADMIN_API}/articles`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle),
      });

      if (res.ok) {
        setSuccess('Article published successfully!');
        setNewArticle({ 
          title: '', 
          content: '', 
          coins: 15, 
          readingTime: 60,
          category: 'General' 
        });
        setIsAdding(false);
        fetchArticles();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create article');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      const res = await fetch(`${ADMIN_API}/articles/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) fetchArticles();
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Article Management</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Create and manage stories for Level 1 Articles section.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black shadow-xl transition-all w-full sm:w-auto active:scale-95 ${
            isAdding 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/20'
          }`}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Add Article'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full blur-3xl" />
          
          <form onSubmit={handleCreateArticle} className="space-y-6 relative z-10">
            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Article Title</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-600"
                placeholder="Enter a catchy title..."
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Coins Reward</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                    value={newArticle.coins}
                    onChange={(e) => setNewArticle({ ...newArticle, coins: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Reading Time (Seconds)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                    value={newArticle.readingTime}
                    onChange={(e) => setNewArticle({ ...newArticle, readingTime: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Article Content</label>
              <p className="text-[10px] text-slate-500 mb-2 ml-1 italic">* Use double new lines for paragraphs. Ads will be shown between paragraphs.</p>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[300px] transition-all text-base leading-relaxed placeholder:text-slate-600 font-serif"
                placeholder="Write your story here in English..."
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-amber-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(217,119,6,0.5)] hover:bg-amber-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              Publish Article
            </button>
          </form>
        </div>
      )}

      {/* Article List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse" />
          ))
        ) : (
          articles.map(article => (
            <div
              key={article._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-500 font-black shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                      <Coins className="w-3 h-3" /> +{article.coins} Coins
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                      <Clock className="w-3 h-3" /> {article.readingTime}s
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteArticle(article._id)}
                className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {!loading && articles.length === 0 && (
        <div className="py-24 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] animate-fade-in">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No articles discovered</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">Start by writing your first story for the Level 1 earners.</p>
        </div>
      )}
    </div>
  );
};

export default Articles;
