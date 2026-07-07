import React, { useState, useEffect, useCallback } from 'react';
import { Search, Send, Share2, Check, Loader2, X, Link } from 'lucide-react';
import { API_BASE } from '../config';
import { Share } from '@capacitor/share';

const ShareModal = ({ isOpen, onClose, shareUrl, title, text, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingStates, setSendingStates] = useState({}); // { [userId]: 'idle' | 'sending' | 'sent' }

  // Load default users (recent chats / followed friends)
  const loadDefaultUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map recent chat list format
        const mapped = data.map(chat => ({
          _id: chat._id,
          name: chat.name,
          username: chat.phoneOrEmail ? chat.phoneOrEmail.split('@')[0] : 'user',
          profilePic: chat.profilePic,
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error('Failed to load default users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users when query changes
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery.trim()) {
      loadDefaultUsers();
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/profile/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadDefaultUsers, isOpen]);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSendingStates({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendToUser = async (userId) => {
    setSendingStates(prev => ({ ...prev, [userId]: 'sending' }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: userId,
          content: `${text || 'Check this out'}: ${shareUrl}`,
          messageType: 'text'
        })
      });

      if (res.ok) {
        setSendingStates(prev => ({ ...prev, [userId]: 'sent' }));
        if (showToast) {
          showToast('Sent successfully! 💬');
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to send message');
        setSendingStates(prev => ({ ...prev, [userId]: 'idle' }));
      }
    } catch (err) {
      console.error('Error sending message via share modal', err);
      alert('Error sending message');
      setSendingStates(prev => ({ ...prev, [userId]: 'idle' }));
    }
  };

  const handleExternalShare = async () => {
    try {
      const canShare = await Share.canShare();
      if (canShare.value) {
        await Share.share({
          title: title || 'Zenivio Share',
          text: text || '',
          url: shareUrl,
          dialogTitle: 'Share via',
        });
        return;
      }
    } catch (err) {
      console.log('Capacitor share not available, trying navigator.share', err);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Zenivio Share',
          text: text || '',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Navigator share failed/cancelled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        if (showToast) {
          showToast('Link copied to clipboard! 🔗');
        } else {
          alert('Link copied to clipboard!');
        }
      } catch (clipboardErr) {
        console.error('Clipboard copy failed', clipboardErr);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (showToast) {
        showToast('Link copied to clipboard! 🔗');
      } else {
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-850 dark:text-slate-100">Send to Friends</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-50/50 dark:border-slate-850">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 text-slate-850 dark:text-slate-100 rounded-2xl text-sm border-0 focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 transition-all font-semibold outline-none"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-3 min-h-[250px] max-h-[40vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-xs font-semibold mt-2">Searching users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <span className="text-sm font-bold">No users found</span>
              <span className="text-xs mt-1 text-slate-400">Try searching for another name</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {users.map((user) => {
                const userState = sendingStates[user._id] || 'idle';
                const avatarUrl = user.profilePic 
                  ? (user.profilePic.startsWith('http') ? user.profilePic : `${API_BASE}/api/image?file=${encodeURIComponent(user.profilePic)}`)
                  : null;

                return (
                  <div 
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                          onError={(e) => { e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{user.name}</span>
                        {user.username && (
                          <span className="text-xs text-slate-400 line-clamp-1">@{user.username}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendToUser(user._id)}
                      disabled={userState !== 'idle'}
                      className={`px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 flex items-center gap-1 ${
                        userState === 'sent'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : userState === 'sending'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25'
                      }`}
                    >
                      {userState === 'sent' && (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Sent</span>
                        </>
                      )}
                      {userState === 'sending' && (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending</span>
                        </>
                      )}
                      {userState === 'idle' && (
                        <>
                          <Send className="w-3 h-3 -rotate-12" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExternalShare}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-200/40 dark:border-slate-800"
            >
              <Share2 className="w-4 h-4 text-indigo-500" />
              <span>Share via Apps</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-200/40 dark:border-slate-800"
            >
              <Link className="w-4 h-4 text-emerald-500" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
