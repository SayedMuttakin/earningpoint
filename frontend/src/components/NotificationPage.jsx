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
  Info,
  Megaphone
} from 'lucide-react';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';
import { playNotificationSound } from '../utils/sound';

const NotificationPage = ({ onBack, setActiveTab, setSelectedNotificationPostId, setActivePublicProfileUserId }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_user_notifications');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_user_notifications');
      return !cached;
    } catch (e) {
      return true;
    }
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications from the backend
  useEffect(() => {
    fetchNotifications();

    const handleReclick = (e) => {
      if (e.detail && e.detail.tab === 'Notification') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchNotifications();
      }
    };
    window.addEventListener('tabReclickRefresh', handleReclick);
    return () => window.removeEventListener('tabReclickRefresh', handleReclick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : [];
        setNotifications(list);
        localStorage.setItem('cached_user_notifications', JSON.stringify(list));
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
      case 'announcement': return <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'badge': return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />;
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
      {/* Header - Premium Minimal (Fixed outside scroll) */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="w-full max-w-3xl mx-auto pt-[max(12px,env(safe-area-inset-top))] px-4 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" /> Notifications
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Your Activity</p>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <CheckCircle2 size={12} /> Mark Read
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto">
        <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
          <div className="w-full max-w-3xl mx-auto px-4 py-4 pb-32">
            {/* Notification List */}
            <div className="animate-fade-in">
              {isLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex gap-4 animate-pulse">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
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
                      className={`group relative p-4 sm:p-5 rounded-3xl border transition-all flex gap-3 sm:gap-4 animate-fade-in ${
                        n.isRead 
                          ? 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-80' 
                          : n.type === 'announcement'
                            ? 'bg-[#FFF7ED] dark:bg-amber-900/20 border-orange-200 dark:border-amber-500/50 shadow-[0_4px_20px_rgba(251,146,60,0.15)] ring-1 ring-orange-400/30'
                            : 'bg-white dark:bg-slate-800 border-indigo-600/10 dark:border-indigo-600/20 shadow-lg shadow-indigo-600/5 ring-1 ring-indigo-600/5'
                      }`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {!n.isRead && (
                        <div className={`absolute top-4 right-4 sm:top-5 sm:right-5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${n.type === 'announcement' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}>
                          <div 
                            className={`absolute inset-0 rounded-full animate-pulse ${n.type === 'announcement' ? 'bg-amber-500' : 'bg-indigo-600'}`}
                          />
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        n.isRead 
                          ? 'bg-slate-50 dark:bg-slate-900 text-slate-400' 
                          : n.type === 'announcement'
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-inner shadow-white/20'
                            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shadow-inner'
                      }`}>
                        {getIcon(n.type)}
                      </div>

                      <div 
                        className="flex-1 min-w-0 py-0.5 sm:py-1 cursor-pointer" 
                        onClick={() => {
                          if (!n.isRead) markAsRead(n._id);
                          if (n.postId && setSelectedNotificationPostId && setActiveTab) {
                            const isCommentNotif = n.type === 'comment' || (n.title && n.title.toLowerCase().includes('comment')) || (n.message && n.message.toLowerCase().includes('commented'));
                            setSelectedNotificationPostId({
                              postId: n.postId,
                              openComment: isCommentNotif
                            });
                            setActiveTab('Home');
                            onBack();
                          } else if ((n.type === 'follow' || n.senderId) && setActivePublicProfileUserId && setActiveTab) {
                            setActivePublicProfileUserId(n.senderId);
                            setActiveTab('PublicProfile');
                            onBack();
                          } else {
                            setSelectedNotification(n);
                          }
                        }}
                      >
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
              <div className="h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6" />
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                 Zenivio Notifications Center
              </p>
            </div>
          </div>
        </PullToRefresh>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        selectedNotification.type === 'badge' ? (
          (() => {
            const isBlue = selectedNotification.title.toLowerCase().includes('public figure') || selectedNotification.title.toLowerCase().includes('blue');
            const badgeColor = isBlue ? '#1d9bf0' : '#EAB308';
            const badgeTitle = isBlue ? 'Verified Public Figure' : 'Verified Individual';
            const badgeDescription = isBlue 
              ? 'This account authentically represents a recognized public figure and has been verified by Zenivio.'
              : 'This account belongs to a real person whose identity has been verified by Zenivio.';

            return (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                  onClick={() => setSelectedNotification(null)}
                />
                <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 animate-fade-in flex flex-col items-center overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none blur-2xl"
                    style={{ backgroundColor: badgeColor }}
                  />
                  
                  {/* Verified Badge SVG */}
                  <div className="w-20 h-20 flex items-center justify-center mb-5 drop-shadow-md">
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                      <g>
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill={badgeColor}/>
                        <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
                      </g>
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 text-center">
                    {isBlue ? 'Blue Tick' : 'Yellow Tick'}
                  </h3>
                  
                  <span 
                    className="text-[11px] font-black uppercase tracking-wider mb-5 px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: badgeColor }}
                  >
                    {badgeTitle}
                  </span>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-6 text-sm text-slate-600 dark:text-slate-350 leading-relaxed text-center font-bold border border-slate-100 dark:border-slate-800">
                    {badgeDescription}
                  </div>
                  
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="w-full py-3.5 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                    style={{ backgroundColor: badgeColor }}
                  >
                    Awesome!
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setSelectedNotification(null)}
            />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 animate-fade-in">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                {getIcon(selectedNotification.type)}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
                {selectedNotification.title}
              </h3>
              
              <div className="flex items-center justify-center gap-1.5 mb-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                <Clock size={12} /> {formatTime(selectedNotification.createdAt)}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-5 mb-6 text-sm sm:text-base text-slate-600 dark:text-slate-350 leading-relaxed text-center font-medium border border-slate-100 dark:border-slate-800">
                {selectedNotification.message}
              </div>
              
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default NotificationPage;
