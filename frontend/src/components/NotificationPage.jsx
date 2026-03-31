import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Trash2, 
  Clock,
  ArrowLeft,
  Info
} from 'lucide-react';
import { API_BASE } from '../config';

const NotificationPage = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from the backend
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'earning': return <DollarSign className="w-5" />;
      case 'withdrawal': return <TrendingUp className="w-5" />;
      case 'premium': return <Star className="w-5" />;
      case 'post': return <Bell className="w-5" />;
      case 'conversion': return <DollarSign className="w-5" />;
      default: return <Bell className="w-5" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
          className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full shadow-lg" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <button 
              onClick={onBack}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-all shadow-sm group"
            >
              <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-indigo-600" /> Notifications
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Your Platform Activity</p>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="text-sm font-black bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <CheckCircle2 size={18} /> Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
              
              <div className="relative z-10 p-8">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 rotate-12">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 -rotate-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No updates yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                  Stay tuned! When you earn coins, complete tasks, or receive updates, they'll appear here beautifully.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {notifications.map((n, idx) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative p-5 sm:p-6 rounded-[2.5rem] border transition-all flex gap-4 sm:gap-6 ${
                    n.isRead 
                      ? 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-80' 
                      : 'bg-white dark:bg-slate-800 border-indigo-600/10 dark:border-indigo-600/20 shadow-xl shadow-indigo-600/5 ring-1 ring-indigo-600/5'
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                      <motion.div 
                        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-indigo-600 rounded-full"
                      />
                    </div>
                  )}
                  
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    n.isRead 
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-400' 
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shadow-inner'
                  }`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 py-1" onClick={() => !n.isRead && markAsRead(n._id)}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className={`text-base sm:text-lg font-black tracking-tight truncate pr-6 ${
                        n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full self-start">
                        <Clock size={12} /> {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      n.isRead ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-300 font-medium'
                    }`}>
                      {n.message}
                    </p>
                  </div>

                  <button 
                    onClick={() => deleteNotification(n._id)}
                    className="p-3 text-slate-200 hover:text-rose-500 transition-all rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center self-center"
                    title="Delete notification"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-16 text-center pb-12">
          <div className="w-16 h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6" />
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
             Zenvio Notifications Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
