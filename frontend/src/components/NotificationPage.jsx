import React, { useState, useEffect } from 'react';
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
import PullToRefresh from './PullToRefresh';

const NotificationPage = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
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
      case 'earning': return <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 " />;
      case 'withdrawal': return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'premium': return <Star className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'post': return <Bell className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'conversion': return <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <Bell className="w-4 h-4 sm:w-5 sm:h-5" />;
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
        <div 
          className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full shadow-lg animate-spin" 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-900 flex flex-col">
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="w-full h-full pb-32">
          <div className="max-w-4xl mx-auto pt-safe px-4 py-8 sm:py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 sm:p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-all shadow-sm group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-6 h-6 text-indigo-600" /> Notifications
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Your Platform Activity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] sm:text-xs font-black bg-indigo-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-indigo-700 transition-all shadow shadow-indigo-600/20 active:scale-95"
                >
                  <CheckCircle2 size={14} /> Mark all read
                </button>
              )}
            </div>
          </div>

        {/* Notification List */}
        <div className="animate-fade-in">
          {notifications.length === 0 ? (
            <div 
              className="text-center py-16 sm:py-20 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-lg overflow-hidden relative animate-fade-in-up"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
              
              <div className="relative z-10 p-6 sm:p-8">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 rotate-12">
                  <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 -rotate-12" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-2">No updates yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-xs sm:text-sm font-medium leading-relaxed">
                  Stay tuned! When you earn coins, complete tasks, or receive updates, they'll appear here beautifully.
                </p>
              </div>
              </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notifications.map((n, idx) => (
                <div
                  key={n._id}
                  className={`group relative p-4 sm:p-5 rounded-3xl border transition-all flex gap-3 sm:gap-4 animate-fade-in-up ${
                    n.isRead 
                      ? 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-80' 
                      : 'bg-white dark:bg-slate-800 border-indigo-600/10 dark:border-indigo-600/20 shadow-lg shadow-indigo-600/5 ring-1 ring-indigo-600/5'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {!n.isRead && (
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                    <div 
                      className="absolute inset-0 bg-indigo-600 rounded-full animate-pulse"
                    />
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    n.isRead 
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-400' 
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shadow-inner'
                  }`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 py-0.5 sm:py-1" onClick={() => !n.isRead && markAsRead(n._id)}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                      <h4 className={`text-[15px] sm:text-base font-black tracking-tight truncate pr-6 sm:pr-8 ${
                        n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {n.title}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full self-start">
                        <Clock size={10} className="sm:w-3 sm:h-3" /> {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className={`text-[13px] sm:text-sm leading-relaxed ${
                      n.isRead ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-300 font-medium'
                    }`}>
                      {n.message}
                    </p>
                  </div>

                  <button 
                    onClick={() => deleteNotification(n._id)}
                    className="p-2 sm:p-2.5 text-slate-200 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center self-center"
                    title="Delete notification"
                  >
                    <Trash2 size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center pb-12">
          <div className="w-16 h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6" />
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
             Zenivio Notifications Center
          </p>
        </div>
        </div>
      </div>
    </PullToRefresh>
  </div>
  );
};

export default NotificationPage;
