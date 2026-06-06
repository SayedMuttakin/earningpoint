import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, Loader2, User as UserIcon, WifiOff, Phone, Video, PhoneOff, Image, Mic, Smile, ThumbsUp, ChevronRight, UserPlus, MoreVertical, Star, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';

const getProfilePicUrl = (pic) => {
  if (!pic) return '';
  if (pic.startsWith('http') || pic.startsWith('/api') || pic.startsWith('data:')) {
    return pic;
  }
  return `${API_BASE}/api/image?file=${pic}`;
};

const MessengerPage = ({ onBack, activeChatPartner, setActiveChatPartner }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePartner, setActivePartner] = useState(null); // Selected user object
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'contacts' | 'favorites'
  const [bottomNavTab, setBottomNavTab] = useState('call'); // 'message' | 'call' | 'video'
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('messenger_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showEditFavoritesModal, setShowEditFavoritesModal] = useState(false);
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');

  // Default favorites populator
  useEffect(() => {
    if (chatUsers.length > 0 && favorites.length === 0) {
      const saved = localStorage.getItem('messenger_favorites');
      if (!saved) {
        const defaultIds = chatUsers.slice(0, 4).map(u => u._id);
        setFavorites(defaultIds);
        localStorage.setItem('messenger_favorites', JSON.stringify(defaultIds));
      }
    }
  }, [chatUsers, favorites.length]);

  const toggleFavorite = (userId) => {
    setFavorites(prev => {
      const isFav = prev.includes(userId);
      let updated;
      if (isFav) {
        updated = prev.filter(id => id !== userId);
      } else {
        updated = [...prev, userId];
      }
      localStorage.setItem('messenger_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUserRowClick = (user) => {
    if (bottomNavTab === 'call') {
      handleStartCall('audio', user);
    } else if (bottomNavTab === 'video') {
      handleStartCall('video', user);
    } else {
      handleOpenChat(user);
    }
  };
  
  // Chat States
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (activeChatPartner) {
      handleOpenChat(activeChatPartner);
    }
  }, [activeChatPartner]);

  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (activeCall) {
        e.preventDefault();
        stopRingtone();
        setActiveCall(null);
      } else if (showEditFavoritesModal) {
        e.preventDefault();
        setShowEditFavoritesModal(false);
      } else if (activePartner) {
        e.preventDefault();
        setActivePartner(null);
        if (setActiveChatPartner) setActiveChatPartner(null);
        fetchUsers();
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [activeCall, showEditFavoritesModal, activePartner, setActiveChatPartner]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  // Call States
  const [activeCall, setActiveCall] = useState(null); // 'audio' | 'video' | null

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const ringIntervalRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  // Fetch current user and other users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const profileRes = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setCurrentUser(pData);
      }

      const usersRes = await fetch(`${API_BASE}/api/messages/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setChatUsers(uData);
      }
    } catch (err) {
      console.error('Failed to fetch Messenger data:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Connect socket
  useEffect(() => {
    const newSocket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 3,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setSocketConnected(true);
      setConnectionError(false);
    });

    newSocket.on('connect_error', () => {
      setSocketConnected(false);
      setConnectionError(true);
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      newSocket.disconnect();
      stopRingtone();
    };
  }, []);

  // Setup private socket room on connection
  useEffect(() => {
    if (socketConnected && socket && currentUser?._id) {
      socket.emit('join_user_room', { userId: currentUser._id });
    }
  }, [socketConnected, socket, currentUser]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_direct_message', (message) => {
      if (activePartner && (
        (message.sender === activePartner._id && message.receiver === currentUser?._id) ||
        (message.sender === currentUser?._id && message.receiver === activePartner._id)
      )) {
        setMessages((prev) => [...prev, message]);
      }
      fetchUsers();
    });

    socket.on('direct_typing', (data) => {
      if (activePartner && data.senderId === activePartner._id && data.isTyping) {
        setIsPartnerTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 2000);
      }
    });

    return () => {
      socket.off('receive_direct_message');
      socket.off('direct_typing');
    };
  }, [socket, activePartner, currentUser]);

  // Open Chat Conversation
  const handleOpenChat = async (partner) => {
    setActivePartner(partner);
    setLoadingChat(true);
    setMessages([]);
    setIsPartnerTyping(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/history/${partner._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleFollowToggle = async (e, userId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local chatUsers state dynamically
        setChatUsers(prev => prev.map(user => {
          if (user._id === userId) {
            return { ...user, isFollowing: data.isFollowing };
          }
          return user;
        }));
      }
    } catch (err) {
      console.error('Follow toggle error in messenger:', err);
    }
  };

  // Sound synthesis calling simulator
  const startRingtone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const playRing = () => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 1.8);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

        osc1.start();
        osc2.start();

        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch (e) {}
        }, 2200);
      };

      playRing();
      ringIntervalRef.current = setInterval(playRing, 3000);
    } catch (e) {
      console.error('Failed to play synthetic ringtone:', e);
    }
  };

  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const playBusyTone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playBeep = (delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 480;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + delay + 0.35);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.4);
        osc.start();
        setTimeout(() => {
          try { osc.stop(); } catch(e) {}
        }, (delay + 0.5) * 1000);
      };

      playBeep(0);
      playBeep(0.5);
      playBeep(1.0);
      
      setTimeout(() => {
        try { ctx.close(); } catch(e) {}
      }, 2000);
    } catch (e) {
      console.error('Failed to play busy tone:', e);
    }
  };

  const handleStartCall = (type, partner) => {
    // If partner is passed, use it, otherwise fall back to activePartner
    const callingUser = partner || activePartner;
    if (!callingUser) return;
    
    setActiveCall(type);
    startRingtone();
    
    setTimeout(() => {
      setActiveCall((currentCall) => {
        if (currentCall) {
          stopRingtone();
          playBusyTone();
          alert(`${callingUser.name} is currently busy. Please leave a text message.`);
          return null;
        }
        return null;
      });
    }, 8000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !activePartner || !currentUser) return;
    
    socket.emit('send_direct_message', {
      senderId: currentUser._id,
      receiverId: activePartner._id,
      content: messageInput.trim()
    });
    setMessageInput('');
  };

  const handleKeyPress = () => {
    if (socket && activePartner && currentUser) {
      socket.emit('direct_typing', {
        senderId: currentUser._id,
        receiverId: activePartner._id,
        isTyping: true
      });
    }
  };

  const handleSendThumbsUp = () => {
    if (!socket || !activePartner || !currentUser) return;
    socket.emit('send_direct_message', {
      senderId: currentUser._id,
      receiverId: activePartner._id,
      content: '👍'
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  // Filter users by search query
  const filteredUsers = chatUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // List of users that have direct messages (for Recent tab)
  const recentChats = filteredUsers.filter(user => user.lastMessage !== '');

  // Loading indicator
  if (loadingUsers) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm animate-pulse">Loading Messenger...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col bg-gradient-to-tr from-slate-50 via-indigo-50/10 to-violet-50/20 dark:from-slate-950 dark:via-indigo-950/5 dark:to-violet-950/10 relative">
          {/* ────────────────── Inbox / Conversation List Screen ────────────────── */}
      {!activePartner ? (
        <>
          {/* Header */}
          <div className="px-4 pt-5 pb-2 flex items-center justify-between shrink-0 z-10">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white absolute left-1/2 -translate-x-1/2">
              {bottomNavTab === 'message' ? 'Chats' : bottomNavTab === 'video' ? 'Video Call' : 'Call'}
            </h1>
            <button className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>

          {/* Top Pill Tabs */}
          <div className="px-5 py-3 shrink-0">
            <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 w-full max-w-md mx-auto">
              <button 
                onClick={() => setActiveTab('recent')}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'recent' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Recent
              </button>
              <button 
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'contacts' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Add Friend
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'favorites' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Favorites
              </button>
            </div>
          </div>

          {/* Search Contacts Bar */}
          <div className="px-5 py-2 shrink-0">
            <div className="relative max-w-md mx-auto flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white dark:bg-slate-900 rounded-2xl px-4 py-1.5 border border-slate-200/50 dark:border-slate-850 shadow-xs focus-within:border-indigo-500/20">
                <Search className="w-5 h-5 text-slate-450 dark:text-slate-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full bg-transparent border-none py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-[15px] font-medium"
                />
              </div>
              <button className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-[#7C3AED] rounded-2xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0 active:scale-95 transition-transform" title="Add Contact">
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto px-5 pb-24">
            <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
              
              {/* Recent Tab: List of recent chat partners */}
              {activeTab === 'recent' && (
                <div className="mt-4 space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">Recent Chats</h2>
                    <button className="text-xs font-black text-[#7C3AED] hover:underline">See All</button>
                  </div>

                  {recentChats.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-450 shadow-xs">
                      <p className="font-bold text-sm">No recent messages</p>
                      <p className="text-xs text-slate-500 mt-1">Tap 'Contacts' to start messaging.</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-[2rem] p-2.5 space-y-1 shadow-xs">
                      {recentChats.map((user, idx) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all rounded-2xl cursor-pointer group active:scale-[0.98]"
                          onClick={() => handleUserRowClick(user)}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Avatar with Status badge */}
                            <div className="relative flex-shrink-0">
                              {user.profilePic ? (
                                <img
                                  src={getProfilePicUrl(user.profilePic)}
                                  alt={user.name}
                                  className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>
                            
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[15px] truncate">{user.name}</h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">{user.lastMessage}</p>
                            </div>
                          </div>

                          {/* Quick call buttons inside the chat item row (matches call buttons in reference image) */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid row click action
                                handleStartCall('audio', user);
                              }}
                              className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 active:scale-90 rounded-full flex items-center justify-center transition-all border border-emerald-100/50 dark:border-emerald-900/30"
                              title="Voice Call"
                            >
                              <Phone className="w-4.5 h-4.5 fill-emerald-500/10" strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid row click action
                                handleStartCall('video', user);
                              }}
                              className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/70 active:scale-90 rounded-full flex items-center justify-center transition-all border border-blue-100/50 dark:border-blue-900/30"
                              title="Video Call"
                            >
                              <Video className="w-4.5 h-4.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Favorites Horizontal Scroll Row */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-slate-800 dark:text-white">Favorites</h2>
                      <button 
                        onClick={() => setShowEditFavoritesModal(true)}
                        className="text-xs font-black text-[#7C3AED] hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    {filteredUsers.filter(u => favorites.includes(u._id)).length === 0 ? (
                      <div className="py-4 text-center w-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-400">No favorites added yet.</p>
                        <button 
                          onClick={() => setShowEditFavoritesModal(true)}
                          className="text-[10px] font-black text-[#7C3AED] mt-1 hover:underline"
                        >
                          + Add Favorites
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                        {filteredUsers.filter(u => favorites.includes(u._id)).map((user) => (
                          <button
                            key={user._id}
                            onClick={() => handleUserRowClick(user)}
                            className="flex flex-col items-center gap-2 shrink-0 snap-start active:scale-95 transition-transform"
                          >
                            <div className="relative">
                              {user.profilePic ? (
                                <img
                                  src={getProfilePicUrl(user.profilePic)}
                                  alt={user.name}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg border-2 border-white dark:border-slate-800 shadow-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>
                            <span className="text-[11px] font-black text-slate-650 dark:text-slate-350 max-w-[60px] truncate">
                              {user.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contacts Tab: Lists all system users to start a chat with */}
              {activeTab === 'contacts' && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">Add Friend</h2>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-[2rem] p-2.5 space-y-1 shadow-xs">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 text-sm">No users found</p>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleUserRowClick(user)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all rounded-2xl cursor-pointer group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {user.profilePic ? (
                                <img
                                  src={getProfilePicUrl(user.profilePic)}
                                  alt={user.name}
                                  className="w-11 h-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{user.name}</h3>
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px] sm:max-w-none">{user.phoneOrEmail}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Follow Action */}
                            <button
                              onClick={(e) => handleFollowToggle(e, user._id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 ${
                                user.isFollowing 
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500' 
                                  : 'text-[#7C3AED] bg-indigo-50 hover:bg-indigo-100/70 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
                              }`}
                            >
                              {user.isFollowing ? 'Following' : '+ Follow'}
                            </button>
                            
                            {/* Message Action */}
                            <button 
                              onClick={() => handleOpenChat(user)}
                              className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#7C3AED] hover:bg-indigo-100 flex items-center justify-center transition-colors active:scale-90"
                              title="Chat"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Favorites Tab: User's Custom Favorites */}
              {activeTab === 'favorites' && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">My Favorites</h2>
                    <button 
                      onClick={() => setShowEditFavoritesModal(true)}
                      className="text-xs font-black text-[#7C3AED] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 rounded-[2rem] p-2.5 space-y-1 shadow-xs">
                    {filteredUsers.filter(u => favorites.includes(u._id)).length === 0 ? (
                      <div className="py-8 text-center text-slate-450">
                        <p className="font-bold text-sm">No favorites added yet</p>
                        <button 
                          onClick={() => setShowEditFavoritesModal(true)}
                          className="text-xs font-black text-[#7C3AED] mt-2 hover:underline"
                        >
                          + Add Favorites
                        </button>
                      </div>
                    ) : (
                      filteredUsers.filter(u => favorites.includes(u._id)).map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleUserRowClick(user)}
                          className="flex items-center justify-between p-3 hover:bg-slate-55/40 dark:hover:bg-slate-850/60 transition-all rounded-2xl cursor-pointer group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {user.profilePic ? (
                                <img
                                  src={getProfilePicUrl(user.profilePic)}
                                  alt={user.name}
                                  className="w-11 h-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-1.5">
                                {user.name}
                                {user.isPremium && (
                                  <span className="text-[9px] bg-amber-55 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 px-1 py-0.5 rounded-md">VIP</span>
                                )}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleStartCall('audio', user)}
                              className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                              title="Voice Call"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenChat(user)}
                              className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#7C3AED] hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </PullToRefresh>
          </div>

          {/* Bottom Floating Navigation Bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] px-6 py-2 flex items-center justify-between shadow-xl z-20">
            <button 
              onClick={() => setBottomNavTab('message')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                bottomNavTab === 'message' ? 'text-[#7C3AED]' : 'text-slate-450 dark:text-slate-500 hover:text-slate-650'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                bottomNavTab === 'message' ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
                <Smile className={`w-6 h-6 ${bottomNavTab === 'message' ? 'fill-indigo-100/20' : ''}`} />
              </div>
              <span className="text-[10px] font-black">Message</span>
            </button>

            {/* Large Center Call Floating Action Button */}
            <button 
              onClick={() => setBottomNavTab('call')}
              className={`w-14 h-14 hover:scale-105 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg -mt-6 ${
                bottomNavTab === 'call'
                  ? 'bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] text-white shadow-indigo-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-slate-500/10'
              }`}
            >
              <Phone className="w-6 h-6 fill-current" strokeWidth={2.5} />
            </button>

            <button 
              onClick={() => setBottomNavTab('video')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                bottomNavTab === 'video' ? 'text-[#7C3AED]' : 'text-slate-450 dark:text-slate-500 hover:text-slate-650'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                bottomNavTab === 'video' ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
                <Video className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black">Video Call</span>
            </button>
          </div>
        </>
      ) : (
        
        // ────────────────── Active Chat Conversation Screen ────────────────── //
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  setActivePartner(null);
                  if (setActiveChatPartner) setActiveChatPartner(null);
                  fetchUsers(); 
                }} 
                className="p-2 -ml-1 rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              {/* Partner Avatar with green status badge */}
              <div className="relative">
                {activePartner.profilePic ? (
                  <img
                    src={getProfilePicUrl(activePartner.profilePic)}
                    alt={activePartner.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-850"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white border border-indigo-100 dark:border-slate-800 shadow-sm flex-shrink-0 font-black">
                    {activePartner.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-1.5 leading-tight">
                  {activePartner.name}
                </h1>
                <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5 animate-pulse">
                  Active Now
                </p>
              </div>
            </div>

            {/* Header action call icons */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleStartCall('audio')}
                className="p-2 rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all"
                title="Start Audio Call"
              >
                <Phone className="w-5 h-5" strokeWidth={2.2} />
              </button>
              <button 
                onClick={() => handleStartCall('video')}
                className="p-2 rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all"
                title="Start Video Call"
              >
                <Video className="w-5.5 h-5.5" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Conversation Chat Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/40 p-4 space-y-4 pb-32">
            {loadingChat ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-2 shadow-xs">
                  {activePartner.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-black text-slate-800 dark:text-white">{activePartner.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Start your conversation with {activePartner.name} now.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isUser = msg.sender === currentUser?._id;
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}>
                    <div className={`flex gap-2 max-w-[80%] items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isUser && (
                        <div className="relative flex-shrink-0">
                          {activePartner.profilePic ? (
                            <img
                              src={getProfilePicUrl(activePartner.profilePic)}
                              alt="partner"
                              className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[11px] font-black shadow-xs">
                              {activePartner.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Messenger Speech Bubbles */}
                      <div className={`p-3 px-4 rounded-2xl relative shadow-xs ${
                        isUser 
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200/40 dark:border-slate-700/40 shadow-xs'
                      }`}>
                        <p className="text-[14px] leading-relaxed break-words font-medium">{msg.content}</p>
                        <span className={`text-[9px] block mt-1.5 font-bold ${isUser ? 'text-purple-200/90 text-right' : 'text-slate-450'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Partner Typing indicator */}
            {isPartnerTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-2 items-end">
                  {activePartner.profilePic ? (
                    <img
                      src={getProfilePicUrl(activePartner.profilePic)}
                      alt="typing"
                      className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black shadow-xs">
                      {activePartner.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 p-3.5 px-4 rounded-2xl rounded-bl-sm flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Bottom Chat Input form */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 shrink-0 pb-safe pb-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
              {/* Decorative Buttons */}
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                <button type="button" className="p-2 rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 hover:text-indigo-600 active:scale-95 transition-all" title="Share Photo">
                  <Image className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 hover:text-indigo-600 active:scale-95 transition-all" title="Record Voice note">
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              {/* Pill Input box */}
              <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-0.5 border border-transparent focus-within:bg-white dark:focus-within:bg-slate-850 focus-within:border-slate-200 dark:focus-within:border-slate-700 transition-all duration-200 shadow-inner">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none py-2.5 text-slate-800 dark:text-white placeholder-slate-450 focus:ring-0 outline-none text-[15px] font-medium"
                />
                <button type="button" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-[#7C3AED] transition-colors" title="Emojis">
                  <Smile className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Send or ThumbsUp button toggle */}
              {messageInput.trim() ? (
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendThumbsUp}
                  className="w-10 h-10 hover:bg-slate-105 dark:hover:bg-slate-850 text-[#7C3AED] active:scale-90 rounded-full flex items-center justify-center shrink-0 transition-all"
                  title="Send Like"
                >
                  <ThumbsUp className="w-5 h-5 fill-[#7C3AED]" />
                </button>
              )}
            </form>
          </div>
        </>
      )}

      {/* Calling Simulator Screens */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-lg flex flex-col items-center justify-between py-20 px-6 text-white animate-fade-in">
          <div className="flex flex-col items-center gap-2 mt-12">
            <span className="text-emerald-500 font-black tracking-widest text-xs uppercase animate-pulse">
              Zenivio Secure Call
            </span>
            <h2 className="text-3xl font-black mt-4">{activePartner?.name}</h2>
            <p className="text-slate-450 text-sm font-medium animate-pulse mt-1">
              Ringing...
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#7C3AED]/20 rounded-full scale-125 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 bg-[#7C3AED]/30 rounded-full scale-150 animate-pulse" />
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] flex items-center justify-center relative border-4 border-[#7C3AED]/50 shadow-2xl overflow-hidden">
              {activePartner?.profilePic ? (
                <img
                  src={getProfilePicUrl(activePartner.profilePic)}
                  alt="partner"
                  className="w-full h-full object-cover animate-pulse"
                />
              ) : (
                activeCall === 'video' ? (
                  <Video className="w-14 h-14 text-white animate-pulse" strokeWidth={1.5} />
                ) : (
                  <Phone className="w-14 h-14 text-white" strokeWidth={1.5} />
                )
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-xs">
            {activeCall === 'video' && (
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-550 animate-pulse" />
                <span className="text-xs font-bold text-slate-350">Front Camera Activated</span>
              </div>
            )}
            <button 
              onClick={() => {
                stopRingtone();
                setActiveCall(null);
              }}
              className="w-16 h-16 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ══════ Edit Favorites Modal overlay ══════ */}
      {showEditFavoritesModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-800 dark:text-white">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[70vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Edit Favorites</h3>
              <button 
                onClick={() => {
                  setShowEditFavoritesModal(false);
                  setFavoritesSearchQuery('');
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 dark:text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search contacts input */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center bg-slate-55/60 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200/50 dark:border-slate-700/60 shadow-inner">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input 
                  type="text"
                  placeholder="Search contacts..."
                  value={favoritesSearchQuery}
                  onChange={(e) => setFavoritesSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-1 text-xs text-slate-705 dark:text-white outline-none focus:ring-0"
                />
              </div>
            </div>
            
            {/* Contacts list with Star toggles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {chatUsers
                .filter(u => u.name.toLowerCase().includes(favoritesSearchQuery.toLowerCase()))
                .map(user => {
                  const isFav = favorites.includes(user._id);
                  return (
                    <div key={user._id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 rounded-2xl transition-all">
                      <div className="flex items-center gap-3">
                        {user.profilePic ? (
                          <img src={getProfilePicUrl(user.profilePic)} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{user.name}</p>
                          <p className="text-[10px] text-slate-450 truncate max-w-[150px] mt-0.5">{user.phoneOrEmail}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => toggleFavorite(user._id)}
                        className="p-2 rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400 text-amber-500' : 'text-slate-350 dark:text-slate-600'}`} />
                      </button>
                    </div>
                  );
                })}
              {chatUsers.filter(u => u.name.toLowerCase().includes(favoritesSearchQuery.toLowerCase())).length === 0 && (
                <p className="text-center py-6 text-slate-400 text-xs font-medium">No contacts found</p>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0">
              <button 
                onClick={() => {
                  setShowEditFavoritesModal(false);
                  setFavoritesSearchQuery('');
                }}
                className="px-6 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MessengerPage;
