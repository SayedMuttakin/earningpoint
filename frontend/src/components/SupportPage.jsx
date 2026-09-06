import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, User as UserIcon, WifiOff, Image, Mic, Smile } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { io } from 'socket.io-client';
import { API_BASE } from '../config';
import { updatePageSEO } from '../utils/seo';
import PullToRefresh from './PullToRefresh';

const SupportPage = ({ onBack }) => {
  useEffect(() => {
    updatePageSEO('support');
  }, []);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);

  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isAdminJoined, setIsAdminJoined] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAdminTyping, isAdminJoined]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name || data.phoneOrEmail || 'User');
          setUserEmail(data.phoneOrEmail || 'user@zenivio.com');
          setUserId(data._id || null);
        }
      } catch (err) {
        console.error('Failed to fetch user profile in SupportPage:', err);
      }
    };
    fetchUserProfile();
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
    };
  }, []);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('session_created', (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem('zenivio_support_session', JSON.stringify({ 
        sessionId: data.sessionId, 
        timestamp: Date.now() 
      }));
      setConnectionError(false);
    });

    socket.on('admin_joined', (data) => {
      setIsAdminJoined(true);
    });
    
    socket.on('previous_messages', (msgs) => {
      setMessages(msgs);
    });
    
    socket.on('session_expired', () => {
      localStorage.removeItem('zenivio_support_session');
      setSessionId(null);
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing', (data) => {
      if (data.sender === 'admin') {
        setIsAdminTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsAdminTyping(false);
        }, 2000); 
      }
    });

    return () => {
      socket.off('session_created');
      socket.off('admin_joined');
      socket.off('receive_message');
      socket.off('typing');
      socket.off('previous_messages');
      socket.off('session_expired');
    };
  }, [socket]);

  // Request or rejoin session once profile and socket are ready
  useEffect(() => {
    if (socketConnected && socket && userId) {
      socket.emit('get_or_create_session', {
        userId,
        name: userName,
        email: userEmail
      });
    }
  }, [socketConnected, socket, userId, userName, userEmail]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !sessionId) return;
    
    socket.emit('send_message', { sessionId, sender: 'user', content: messageInput.trim() });
    setMessageInput('');
  };

  const handleKeyPress = () => {
    if (socket && sessionId) {
      socket.emit('typing', { sessionId, sender: 'user' });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessages([]);
    localStorage.removeItem('zenivio_support_session');
    
    if (socket && userId) {
      socket.emit('get_or_create_session', {
        userId,
        name: userName,
        email: userEmail
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  // Wait/Connect screen
  if (!userId || !socketConnected) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <button 
          onClick={onBack} 
          className="absolute top-[max(16px,env(safe-area-inset-top))] left-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 active:scale-90 transition-all shadow-xs cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm animate-pulse">Connecting to Zenivio Messenger...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between shrink-0 shadow-xs z-10 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all active:scale-90 shadow-xs cursor-pointer -ml-1"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          {/* Avatar with Status Badge */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl shadow-xs overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 flex items-center justify-center">
              <img src="/zenivio-logo.png" alt="Zenivio Support" className="w-full h-full object-contain" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5 leading-tight">
              Zenivio Help &amp; Support
              <VerifiedBadge iconClassName="w-[16px] h-[16px] flex-shrink-0" />
            </h1>
            <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
              Active Now
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 space-y-4">
        {/* Chat Session Welcome Info */}
        <div className="flex flex-col items-center justify-center text-center py-6 mb-2">
          <div className="w-16 h-16 rounded-2xl shadow-md overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 flex items-center justify-center mb-2">
            <img src="/zenivio-logo.png" alt="Zenivio Support" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-1.5 text-base">
            Zenivio Support Team
            <VerifiedBadge iconClassName="w-[16px] h-[16px]" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">You are connected to our support desk. How can we help?</p>
        </div>

        {/* Message List */}
        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex gap-2.5 max-w-[82%] items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-1 flex items-center justify-center">
                    <img src="/zenivio-logo.png" alt="Zenivio" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className={`p-3.5 px-4 rounded-2xl relative shadow-xs ${
                  isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50 shadow-xs'
                }`}>
                  <p className="text-[14px] leading-relaxed break-words font-medium">{msg.content}</p>
                  <span className={`text-[9px] block mt-1.5 font-bold ${isUser ? 'text-blue-200/90 text-right' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Admin Typing Indicator */}
        {isAdminTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2.5 items-end">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-1 flex items-center justify-center">
                <img src="/zenivio-logo.png" alt="Zenivio" className="w-full h-full object-contain" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-3.5 px-4 rounded-2xl rounded-bl-xs flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Connection Error Message */}
        {connectionError && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm font-semibold">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>Disconnected from Server. Retrying...</span>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Chat Input Area at bottom */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 sm:px-3 py-2 sm:py-2.5 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lg w-full overflow-hidden">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2 w-full max-w-4xl mx-auto">
          {/* Decorative Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-slate-400 dark:text-slate-500 shrink-0">
            <button type="button" className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer" title="Share Photo">
              <Image className="w-5 h-5" />
            </button>
            <button type="button" className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer" title="Record Voice">
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Pill Input */}
          <div className="flex-1 min-w-0 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 py-0.5 border border-transparent focus-within:bg-white dark:focus-within:bg-slate-850 focus-within:border-slate-200 dark:focus-within:border-slate-700 transition-all duration-200 shadow-inner">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 min-w-0 w-full bg-transparent border-none py-2 sm:py-2.5 text-slate-800 dark:text-white placeholder-slate-450 focus:ring-0 outline-none text-sm sm:text-[15px] font-medium"
            />
            <button type="button" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer" title="Emojis">
              <Smile className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className={`w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              messageInput.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
            }`}
            title="Send Message"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
