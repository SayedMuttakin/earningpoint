import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Loader2, MinusCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminChatWindow = ({ session, onClose, API_BASE }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState(session.messages || []);
  const [messageInput, setMessageInput] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUserTyping]);

  useEffect(() => {
    const newSocket = io(API_BASE.replace('/api/admin', '')); // Base URL for socket
    setSocket(newSocket);

    newSocket.emit('admin_join', { sessionId: session._id });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('typing', (data) => {
      if (data.sender === 'user') {
        setIsUserTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsUserTyping(false), 2000);
      }
    });

    newSocket.on('session_closed', () => {
      onClose();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [session._id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    socket.emit('send_message', {
      sessionId: session._id,
      sender: 'admin',
      content: messageInput
    });
    setMessageInput('');
  };

  const handleKeyPress = () => {
    if (socket) {
      socket.emit('typing', { sessionId: session._id, sender: 'admin' });
    }
  };

  const closeSession = () => {
    if (window.confirm('Are you sure you want to close this session?')) {
      socket.emit('close_session', { sessionId: session._id });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#111827] border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{session.name}</h3>
              <p className="text-slate-500 text-xs">{session.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={closeSession}
              title="Close Session"
              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex justify-center mb-4">
            <span className="bg-slate-800 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Live Session Started
            </span>
          </div>

          {messages.map((msg, i) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isAdmin ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    {isAdmin ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${isAdmin ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isUserTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 items-center bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-2xl rounded-tl-sm">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="text-[10px] font-bold text-slate-500 ml-2">User is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your reply to user..."
              className="flex-1 bg-slate-800 border-slate-700 border rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChatWindow;
