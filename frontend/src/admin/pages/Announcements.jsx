import React, { useState } from 'react';
import { Send, Megaphone, Loader2 } from 'lucide-react';

const Announcements = ({ authHeaders, ADMIN_API }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Title and message are required.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${ADMIN_API}/announcements`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', text: data.message || 'Announcement sent successfully!' });
        setTitle('');
        setMessage('');
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to send announcement.' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'An error occurred while sending the announcement.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-indigo-500" />
            Global Announcements
          </h2>
          <p className="text-slate-400 text-sm mt-1">Broadcast a premium notification to all users.</p>
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {feedback && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {feedback.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Announcement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Special Holiday Bonus! \uD83C\uDF89"
              className="w-full bg-[#1E293B] border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement here..."
              rows={5}
              className="w-full bg-[#1E293B] border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-2">This will appear in every user's notification center.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isLoading ? 'Broadcasting...' : 'Send to All Users'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Announcements;
