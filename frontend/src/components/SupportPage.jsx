import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, UserCircle, Mail, HelpCircle, ArrowLeft, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE } from '../config';

const SupportPage = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Wait, 3: Chat
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isAdminJoined, setIsAdminJoined] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAdminTyping, isAdminJoined]);

  // Connect socket
  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('session_created', (data) => {
      setSessionId(data.sessionId);
      setStep(2); // Move to waiting screen
      setIsSubmitting(false);
    });

    socket.on('admin_joined', (data) => {
      setIsAdminJoined(true);
      setStep(3); // Move to chat screen
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
        }, 2000); // Admin stopped typing after 2 seconds no activity
      }
    });

    return () => {
      socket.off('session_created');
      socket.off('admin_joined');
      socket.off('receive_message');
      socket.off('typing');
    };
  }, [socket]);

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setIsSubmitting(true);
    socket.emit('request_support', { name, email, userId: null });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !sessionId) return;
    
    // Add locally immediately for better UX
    const newMsg = { sender: 'user', content: messageInput, timestamp: new Date() };
    
    socket.emit('send_message', { sessionId, sender: 'user', content: messageInput });
    setMessageInput('');
  };

  const handleKeyPress = () => {
    if (socket && sessionId) {
      socket.emit('typing', { sessionId, sender: 'user' });
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" /> 
            Live Support
          </h1>
          {step === 3 && isAdminJoined && (
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Online
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto h-full relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Form */}
          {step === 1 && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="p-6 h-full flex flex-col justify-center max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">How can we help?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Please provide your details so our admin can reach out to you.</p>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !name || !email}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
                  ) : (
                    'Start Live Chat'
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Waiting Screen */}
          {step === 2 && (
            <motion.div 
              key="wait"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-6 h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                  <Bot className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-3">Please Wait</h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                আমাদের একজন এডমিন দ্রুত আপনার সাথে যোগাযোগ করছে, দয়া করে একটু অপেক্ষা করুন।
              </p>
            </motion.div>
          )}

          {/* STEP 3: Chat Screen */}
          {step === 3 && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative"
            >
              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 pb-32">
                <div className="flex justify-center mb-6">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    Admin Joined the Chat
                  </span>
                </div>

                {messages.map((msg, i) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} max-w-full`}>
                      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-200 dark:bg-slate-800'}`}>
                          {isUser ? <UserIcon className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                        </div>
                        <div className={`p-3 rounded-2xl ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'}`}>
                          <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                          <span className={`text-[10px] block mt-1 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Admin Typing indicator */}
                {isAdminTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 items-end">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Chat Input */}
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 pb-safe pb-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto pb-4 md:pb-0">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Send className={`w-5 h-5 ${messageInput.trim() ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                </form>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupportPage;
