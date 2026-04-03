import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Trash2, 
  ChevronRight, 
  Moon, 
  Sun,
  Database,
  HelpCircle,
  FileText,
  LogOut,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';
import { API_BASE } from '../config';

const SettingsPage = ({ 
  darkMode, 
  onToggleDarkMode, 
  onLogout, 
  onBack, 
  onPasswordClick, 
  onLanguageClick, 
  onTermsClick, 
  onDeleteClick, 
  onNotificationClick,
  onSupportClick
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditName(data.name || '');
        setEditEmail(data.phoneOrEmail || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, email: editEmail })
      });
      if (res.ok) {
        setShowProfileModal(false);
        fetchProfile();
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const sections = [
    {
      id: 'account',
      title: 'Account Settings',
      items: [
        { id: 'profile', icon: User, label: 'Personal Information', sub: 'Update your name and email', action: () => setShowProfileModal(true) },
        { id: 'device', icon: Smartphone, label: 'Linked Devices', sub: 'Manage your active sessions', action: () => alert('Currently limited to this device.') },
      ]
    },
    {
      id: 'security',
      title: 'Security',
      items: [
        { id: 'password', icon: Lock, label: 'Change Password', sub: 'Update your account password', action: onPasswordClick },
        { id: '2fa', icon: Shield, label: 'Two-Factor Auth', sub: 'Enhanced security for your account', action: () => alert('2FA is being prepared for the next update!') },
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      items: [
        { id: 'appearance', icon: darkMode ? Moon : Sun, label: 'Dark Mode', isToggle: true, value: darkMode, onToggle: onToggleDarkMode },
        { id: 'language', icon: Globe, label: 'Language', sub: 'English (US)', action: onLanguageClick },
        { id: 'notifications', icon: Bell, label: 'Notifications', sub: 'Manage your alerts', action: () => onNotificationClick && onNotificationClick() },
      ]
    },
    {
      id: 'others',
      title: 'Others',
      items: [
        { id: 'terms', icon: FileText, label: 'Terms of Service', sub: 'Read our usage guidelines', action: onTermsClick },
        { id: 'help', icon: HelpCircle, label: 'Help & Support', sub: 'Contact our support team', action: onSupportClick },
        { id: 'data', icon: Database, label: 'Data Management', sub: 'Download or clear your data', action: () => alert('Data management feature is coming soon!') },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Settings</h1>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 mb-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4"
        >
          <div className="relative">
            <img 
              src={user?.profilePic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full border-2 border-indigo-500"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{user?.phoneOrEmail}</p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {sections.map((group) => (
            <div key={group.id}>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-2">
                {group.title}
              </h3>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {group.items.map((item, iIdx) => (
                  <button 
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left ${
                      iIdx !== group.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300`}>
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{item.label}</p>
                        {item.sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>}
                      </div>
                    </div>

                    {item.isToggle ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onToggle();
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${item.value ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${item.value ? 'left-7' : 'left-1'}`} />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500/60 dark:text-red-400/60 mb-4 px-2">
              Danger Zone
            </h3>
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-all text-left"
                onClick={onDeleteClick}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm sm:text-base">Delete Account</p>
                    <p className="text-xs text-red-500/70 dark:text-red-400/70 mt-0.5">Permanently remove your data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-300 dark:text-red-900/40" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Zenvio v2.1.0 • Built with ❤️</p>
        </div>
      </div>

      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Personal Information</h3>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={updateLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
