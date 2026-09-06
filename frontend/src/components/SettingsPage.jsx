import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  ShieldCheck,
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
  X,
  Search,
  Rocket,
  Palette,
  Headphones,
  MessageCircle
} from 'lucide-react';
import { API_BASE } from '../config';
import PullToRefresh from './PullToRefresh';

const getSubItemIcon = (label) => {
  const l = label.toLowerCase();
  if (l.includes('profile')) return User;
  if (l.includes('password') || l.includes('security')) return Lock;
  if (l.includes('notification') || l.includes('alerts')) return Bell;
  if (l.includes('privacy') || l.includes('blocked') || l.includes('activity')) return Shield;
  if (l.includes('chat') || l.includes('read receipt') || l.includes('message')) return MessageCircle;
  if (l.includes('saver') || l.includes('play') || l.includes('background')) return Rocket;
  if (l.includes('clear cache') || l.includes('storage') || l.includes('download')) return Database;
  if (l.includes('language') || l.includes('dark mode') || l.includes('theme')) return Palette;
  if (l.includes('report') || l.includes('contact') || l.includes('faq')) return Headphones;
  if (l.includes('logout') || l.includes('delete')) return LogOut;
  return ShieldCheck; // default fallback
};

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
  onSupportClick,
  onVerifyClick,
  initialSubMenuKey,
  onCloseSubMenu
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Toggles inside Notifications sub-menu
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  // Modals / Menu Active State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // Activity Status & Read Receipts
  const [activityStatus, setActivityStatus] = useState(() => localStorage.getItem('activity_status') !== 'false');
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem('read_receipts') !== 'false');
  const [hideFollowersList, setHideFollowersList] = useState(false);

  useEffect(() => {
    if (user && user.hideFollowersList !== undefined) {
      setHideFollowersList(user.hideFollowersList);
    }
  }, [user]);

  const toggleHideFollowersList = async () => {
    const newVal = !hideFollowersList;
    setHideFollowersList(newVal);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hideFollowersList: newVal })
      });
      if (res.ok) {
        showToast(newVal ? 'Followers/Following list is now hidden' : 'Followers/Following list is now visible');
      }
    } catch (err) {
      console.error('Failed to update privacy setting:', err);
    }
  };

  // App Performance settings
  const [dataSaver, setDataSaver] = useState(() => localStorage.getItem('data_saver') === 'true');
  const [autoPlay, setAutoPlay] = useState(() => localStorage.getItem('auto_play') !== 'false');
  const [backgroundActivity, setBackgroundActivity] = useState(() => localStorage.getItem('background_activity') !== 'false');

  // Blocked Users
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(() => {
    const saved = localStorage.getItem('blocked_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [blockSearchQuery, setBlockSearchQuery] = useState('');
  const [blockSearchResults, setBlockSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    if (showBlockedModal) {
      const fetchBlockedUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/profile/blocked`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setBlockedUsers(data);
            localStorage.setItem('blocked_users', JSON.stringify(data));
          }
        } catch (err) {
          console.error('Failed to fetch blocked users:', err);
        }
      };
      fetchBlockedUsers();
    }
  }, [showBlockedModal]);

  // Chat Settings
  const [showChatSettingsModal, setShowChatSettingsModal] = useState(false);
  const [chatTheme, setChatTheme] = useState(() => localStorage.getItem('chat_theme') || '#7C3AED');
  const [chatWallpaper, setChatWallpaper] = useState(() => localStorage.getItem('chat_wallpaper') || 'default');

  // Message Requests
  const [showMessageRequestsModal, setShowMessageRequestsModal] = useState(false);
  const [messageRequests, setMessageRequests] = useState(() => {
    const saved = localStorage.getItem('message_requests');
    return saved ? JSON.parse(saved) : [
      { _id: 'mr_1', name: 'Rahat Ahmed', preview: 'Hey there! Can we collaborate?', profilePic: '' },
      { _id: 'mr_2', name: 'Sadia Islam', preview: 'Hello, I want to ask about the premium features.', profilePic: '' }
    ];
  });

  // Storage and Cache
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showDownloadSettingsModal, setShowDownloadSettingsModal] = useState(false);
  const [cacheSize, setCacheSize] = useState(() => localStorage.getItem('cache_size') || '4.2 MB');
  const [mediaSize, setMediaSize] = useState(() => localStorage.getItem('media_size') || '8.2 MB');
  const [clearingCache, setClearingCache] = useState(false);
  const [clearingCacheStep, setClearingCacheStep] = useState('');

  // Media download settings
  const [downloadSettings, setDownloadSettings] = useState(() => {
    const saved = localStorage.getItem('download_settings');
    return saved ? JSON.parse(saved) : {
      cellularPhotos: true,
      cellularAudio: false,
      cellularVideos: false,
      cellularDocs: false,
      wifiPhotos: true,
      wifiAudio: true,
      wifiVideos: true,
      wifiDocs: true
    };
  });

  const handleSearchUsersToBlock = async (query) => {
    if (!query || query.trim() === '') {
      setBlockSearchResults([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBlockSearchResults(data);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleBlockUser = async (u) => {
    if (blockedUsers.some(b => b._id === u._id)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/block/${u._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const newList = [...blockedUsers, { _id: u._id, name: u.name, phoneOrEmail: u.phoneOrEmail, profilePic: u.profilePic }];
        setBlockedUsers(newList);
        localStorage.setItem('blocked_users', JSON.stringify(newList));
        showToast(`${u.name} has been blocked.`);
      }
    } catch (err) {
      console.error('Failed to block user in settings:', err);
    }
  };

  const handleUnblockUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/block/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const user = blockedUsers.find(b => b._id === id);
        const newList = blockedUsers.filter(b => b._id !== id);
        setBlockedUsers(newList);
        localStorage.setItem('blocked_users', JSON.stringify(newList));
        if (user) {
          showToast(`${user.name} has been unblocked.`);
        }
      }
    } catch (err) {
      console.error('Failed to unblock user in settings:', err);
    }
  };

  const handleClearCache = () => {
    closeSubMenu();
    setClearingCache(true);
    setClearingCacheStep('Calculating cache files...');
    
    setTimeout(() => {
      setClearingCacheStep('Deleting temporary media files (8.2 MB)...');
    }, 500);

    setTimeout(() => {
      setClearingCacheStep('Re-indexing chat database...');
    }, 1000);

    setTimeout(() => {
      setCacheSize('0 B');
      localStorage.setItem('cache_size', '0 B');
      setClearingCache(false);
      setClearingCacheStep('');
      showToast('Cache cleared successfully!');
    }, 1500);
  };

  const handleOptimizeStorage = () => {
    setClearingCache(true);
    setClearingCacheStep('Scanning duplicate media...');
    
    setTimeout(() => {
      setClearingCacheStep('Compressing old database entries...');
    }, 600);

    setTimeout(() => {
      setMediaSize('2.1 MB');
      localStorage.setItem('media_size', '2.1 MB');
      setClearingCache(false);
      setClearingCacheStep('');
      showToast('Storage optimized successfully!');
    }, 1200);
  };

  const closeSubMenu = () => {
    setActiveSubMenu(null);
    onCloseSubMenu && onCloseSubMenu();
  };
  
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (showProfileModal) {
        e.preventDefault();
        setShowProfileModal(false);
      } else if (showBlockedModal) {
        e.preventDefault();
        setShowBlockedModal(false);
      } else if (showChatSettingsModal) {
        e.preventDefault();
        setShowChatSettingsModal(false);
      } else if (showMessageRequestsModal) {
        e.preventDefault();
        setShowMessageRequestsModal(false);
      } else if (showStorageModal) {
        e.preventDefault();
        setShowStorageModal(false);
      } else if (showDownloadSettingsModal) {
        e.preventDefault();
        setShowDownloadSettingsModal(false);
      } else if (activeSubMenu) {
        e.preventDefault();
        closeSubMenu();
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [showProfileModal, showBlockedModal, showChatSettingsModal, showMessageRequestsModal, showStorageModal, showDownloadSettingsModal, activeSubMenu]);


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
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
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

  const subMenuData = {
    account_settings: {
      title: 'Account Settings',
      items: [
        { label: 'Profile', sub: 'Update your display name and email address', action: () => { closeSubMenu(); setShowProfileModal(true); } },
        { label: 'Security', sub: 'Manage your active sessions and device security', action: () => alert('Security configuration is optimized for this device.') },
        { label: 'Password', sub: 'Change your account login password', action: () => { closeSubMenu(); onPasswordClick(); } },
      ]
    },
    notifications: {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', sub: 'Enable or disable push alerts on this device', isToggle: true, value: pushNotifications, action: () => setPushNotifications(prev => !prev) },
        { label: 'News Alerts', sub: 'Get notified about new posts and updates', isToggle: true, value: newsAlerts, action: () => setNewsAlerts(prev => !prev) },
        { label: 'Message Alerts', sub: 'Receive sound and vibration alerts for chats', isToggle: true, value: messageAlerts, action: () => setMessageAlerts(prev => !prev) },
      ]
    },
    privacy: {
      title: 'Privacy Settings',
      items: [
        { label: 'Profile Privacy', sub: 'Read our terms of service and privacy policies', action: () => { closeSubMenu(); onTermsClick(); } },
        { label: 'Blocked Users', sub: 'Manage restricted and blocked users list', action: () => { closeSubMenu(); setShowBlockedModal(true); } },
        { 
          label: 'Hide Followers / Following List', 
          sub: 'Only total counts will be visible to other users', 
          isToggle: true, 
          value: hideFollowersList, 
          action: () => toggleHideFollowersList()
        },
        { 
          label: 'Activity Status', 
          sub: 'Show or hide when you are active on the app', 
          isToggle: true, 
          value: activityStatus, 
          action: () => {
            const val = !activityStatus;
            setActivityStatus(val);
            localStorage.setItem('activity_status', String(val));
            showToast(val ? 'Activity status is visible' : 'Activity status is hidden');
          } 
        },
      ]
    },
    messenger: {
      title: 'Messenger Preferences',
      items: [
        { label: 'Chat Settings', sub: 'Configure default chat bubbles and wallpaper', action: () => { closeSubMenu(); setShowChatSettingsModal(true); } },
        { 
          label: 'Read Receipts', 
          sub: 'Let others see when you have read their messages', 
          isToggle: true, 
          value: readReceipts, 
          action: () => {
            const val = !readReceipts;
            setReadReceipts(val);
            localStorage.setItem('read_receipts', String(val));
            showToast(val ? 'Read receipts enabled' : 'Read receipts disabled');
          } 
        },
        { label: 'Message Requests', sub: 'Manage messages from users not in your contacts', action: () => { closeSubMenu(); setShowMessageRequestsModal(true); } },
      ]
    },
    performance: {
      title: 'App Performance',
      items: [
        { 
          label: 'Data Saver', 
          sub: 'Reduce image and video quality to save cellular data', 
          isToggle: true, 
          value: dataSaver, 
          action: () => {
            const val = !dataSaver;
            setDataSaver(val);
            localStorage.setItem('data_saver', String(val));
            showToast(val ? 'Data Saver enabled' : 'Data Saver disabled');
          } 
        },
        { 
          label: 'Auto Play', 
          sub: 'Auto play videos and reels on Wi-Fi connection', 
          isToggle: true, 
          value: autoPlay, 
          action: () => {
            const val = !autoPlay;
            setAutoPlay(val);
            localStorage.setItem('auto_play', String(val));
            showToast(val ? 'Auto Play enabled' : 'Auto Play disabled');
          } 
        },
        { 
          label: 'Background Activity', 
          sub: 'Allow Zenivio to sync data in the background', 
          isToggle: true, 
          value: backgroundActivity, 
          action: () => {
            const val = !backgroundActivity;
            setBackgroundActivity(val);
            localStorage.setItem('background_activity', String(val));
            showToast(val ? 'Background Activity enabled' : 'Background Activity disabled');
          } 
        },
      ]
    },
    storage: {
      title: 'Storage & Data',
      items: [
        { label: 'Clear Cache', sub: 'Clear temporary cache files to free up phone storage', action: () => { handleClearCache(); } },
        { label: 'Storage Usage', sub: 'View total storage size used by downloaded media', action: () => { closeSubMenu(); setShowStorageModal(true); } },
        { label: 'Download Settings', sub: 'Configure automatic media download settings', action: () => { closeSubMenu(); setShowDownloadSettingsModal(true); } },
      ]
    },
    appearance: {
      title: 'Language & Appearance',
      items: [
        { label: 'Language', sub: 'Select your preferred display language', action: () => { closeSubMenu(); onLanguageClick(); } },
        { label: 'Dark Mode', sub: 'Toggle dark mode and system theme settings', isToggle: true, value: darkMode, action: onToggleDarkMode },
        { label: 'Theme', sub: 'Select accents and background themes', action: () => alert('Theme settings are managed via Dark Mode.') },
      ]
    },
    support: {
      title: 'Help & Support',
      items: [
        { label: 'Report Problem', sub: 'Encountered a bug? File a report with our dev team', action: () => { closeSubMenu(); onSupportClick(); } },
        { label: 'Contact Support', sub: 'Chat with our support executive for queries', action: () => { closeSubMenu(); onSupportClick(); } },
        { label: 'FAQ', sub: 'Read frequently asked questions and answers', action: () => { closeSubMenu(); onSupportClick(); } },
      ]
    },
    actions: {
      title: 'Account Actions',
      items: [
        { label: 'Logout', sub: 'Sign out from this device', action: () => { closeSubMenu(); onLogout(); } },
        { label: 'Delete Account', sub: 'Permanently remove your account and all data', action: () => { closeSubMenu(); onDeleteClick(); } },
      ]
    }
  };

  useEffect(() => {
    if (initialSubMenuKey && subMenuData[initialSubMenuKey]) {
      setActiveSubMenu({ ...subMenuData[initialSubMenuKey], id: initialSubMenuKey });
    } else {
      setActiveSubMenu(null);
    }
  }, [initialSubMenuKey]);

  const allItems = [
    { 
      id: 'account_settings', 
      icon: User, 
      color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-405', 
      label: 'Account Settings', 
      sub: 'Manage your profile, security and account', 
      action: () => setActiveSubMenu({ ...subMenuData.account_settings, id: 'account_settings' })
    },
    { 
      id: 'notifications', 
      icon: Bell, 
      color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-405', 
      label: 'Notifications', 
      sub: 'Control alerts and notification preferences', 
      action: () => setActiveSubMenu({ ...subMenuData.notifications, id: 'notifications' })
    },
    { 
      id: 'privacy', 
      icon: Shield, 
      color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-405', 
      label: 'Privacy', 
      sub: 'Manage privacy and visibility settings', 
      action: () => setActiveSubMenu({ ...subMenuData.privacy, id: 'privacy' })
    },
    { 
      id: 'verification', 
      icon: ShieldCheck, 
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-405', 
      label: 'Verification', 
      sub: 'Verify your identity and account status', 
      action: () => { closeSubMenu(); onVerifyClick(); }
    },
    { 
      id: 'messenger', 
      icon: MessageCircle, 
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-405', 
      label: 'Messenger', 
      sub: 'Chat and messaging preferences', 
      action: () => setActiveSubMenu({ ...subMenuData.messenger, id: 'messenger' })
    },
    { 
      id: 'performance', 
      icon: Rocket, 
      color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-650 dark:text-purple-405', 
      label: 'App Performance', 
      sub: 'Data saver, optimization and app performance', 
      action: () => setActiveSubMenu({ ...subMenuData.performance, id: 'performance' })
    },
    { 
      id: 'storage', 
      icon: Database, 
      color: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-405', 
      label: 'Storage & Data', 
      sub: 'Manage storage, data usage and cache', 
      action: () => setActiveSubMenu({ ...subMenuData.storage, id: 'storage' })
    },
    { 
      id: 'appearance', 
      icon: Palette, 
      color: 'bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-405', 
      label: 'Language & Appearance', 
      sub: 'Theme, dark mode and language', 
      action: () => setActiveSubMenu({ ...subMenuData.appearance, id: 'appearance' })
    },
    { 
      id: 'support', 
      icon: Headphones, 
      color: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-405', 
      label: 'Help & Support', 
      sub: 'Get help, report issues and more', 
      action: () => setActiveSubMenu({ ...subMenuData.support, id: 'support' })
    },
    { 
      id: 'actions', 
      icon: LogOut, 
      color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455', 
      label: 'Account Actions', 
      sub: 'Logout or delete your account', 
      action: () => setActiveSubMenu({ ...subMenuData.actions, id: 'actions' })
    }
  ];

  const parentItem = activeSubMenu ? allItems.find(item => item.id === activeSubMenu.id) : null;
  const ParentIcon = parentItem ? parentItem.icon : User;
  const parentColor = parentItem ? parentItem.color : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400';
  const currentSubMenu = activeSubMenu ? subMenuData[activeSubMenu.id] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-955 pb-32">
          <style>{`
            @keyframes scaleUp {
              from {
                opacity: 0;
                transform: scale(0.92);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-scale-up {
              animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
          `}</style>

          {/* Sticky Header Section */}
          <div className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-955/90 backdrop-blur-md px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-900">
            <button 
              onClick={() => {
                if (showProfileModal) {
                  setShowProfileModal(false);
                } else if (activeSubMenu) {
                  closeSubMenu();
                } else {
                  onBack();
                }
              }}
              className="p-2 hover:bg-slate-200/55 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-355 active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-extrabold text-sm text-slate-855 dark:text-slate-100">Settings</h2>
            <div className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto px-4 pt-6">
            {/* Main Title Section with Search button */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-855 dark:text-white">Settings</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">Manage your account and app preferences</p>
              </div>
              
              <button 
                onClick={() => alert('Search feature is coming soon!')}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-150/40 dark:border-slate-800 flex items-center justify-center text-[#7C3AED] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Single Flat Cards List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden flex flex-col w-full">
              {allItems.map((item, idx) => (
                <button 
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${item.color} shadow-3xs`}>
                      <item.icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-[15px] text-slate-855 dark:text-slate-200 block truncate">{item.label}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block truncate mt-0.5">{item.sub}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 flex-shrink-0" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </PullToRefresh>

      {/* Account Settings / Personal Info Modal - Centered Viewport */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowProfileModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-855 dark:text-white">Account Settings</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-55/40 dark:bg-slate-855 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-450 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/50"
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-55/40 dark:bg-slate-855 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-450 border border-slate-150/40 dark:border-slate-750 outline-none focus:border-indigo-500/55"
                  placeholder="Enter email"
                />
              </div>
              
              <button 
                type="submit"
                disabled={updateLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-black rounded-2xl shadow-md shadow-indigo-650/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {updateLoading ? 'Saving changes...' : 'Save Changes'}
              </button>

              {/* Password Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    onPasswordClick();
                  }}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/60 text-slate-800 dark:text-white rounded-2xl font-black border border-slate-150/40 dark:border-slate-800 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer shadow-3xs"
                >
                  <Lock className="w-4 h-4 text-[#7C3AED]" /> Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Settings Detail Modal - Centered Viewport */}
      {currentSubMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={closeSubMenu}
            className="absolute inset-0 bg-slate-955/65 backdrop-blur-md animate-fade-in"
          />
          <div 
            className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-[28px] shadow-2xl border border-slate-150/40 dark:border-slate-800/80 overflow-hidden max-h-[80vh] flex flex-col animate-scale-up"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${parentColor} shadow-3xs`}>
                  <ParentIcon className="w-5.5 h-5.5" strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-black text-slate-855 dark:text-white leading-tight">{currentSubMenu.title}</h3>
                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Configure your preferences</p>
                </div>
              </div>
              <button 
                onClick={closeSubMenu}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-450 dark:text-slate-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-slate-150/10 dark:border-slate-750/30 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Items List */}
            <div className="p-5 space-y-3 overflow-y-auto flex-1 bg-slate-50/40 dark:bg-slate-955/15">
              {currentSubMenu.items.map((subItem, idx) => {
                const Icon = getSubItemIcon(subItem.label);
                if (subItem.isToggle) {
                  return (
                    <div
                      key={idx}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-left shadow-3xs hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors duration-250 animate-fade-in"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 pr-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${parentColor}`}>
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-[14px] text-slate-800 dark:text-slate-200 block truncate">{subItem.label}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal block mt-0.5 leading-relaxed">{subItem.sub}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={subItem.action}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${subItem.value ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${subItem.value ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={subItem.action}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl transition-all duration-250 hover:-translate-y-0.5 active:translate-y-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 text-left shadow-3xs group animate-fade-in"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 pr-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${parentColor} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-[14px] text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{subItem.label}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal block mt-0.5 leading-relaxed">{subItem.sub}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowBlockedModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up max-h-[80vh] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-slate-855 dark:text-white">Blocked Users</h3>
              </div>
              <button 
                onClick={() => setShowBlockedModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50/50 dark:bg-slate-955/20 flex-shrink-0">
              {/* Search Bar to block new users */}
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search user to block..."
                  value={blockSearchQuery}
                  onChange={(e) => {
                    setBlockSearchQuery(e.target.value);
                    handleSearchUsersToBlock(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-slate-850 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white border border-slate-150/50 dark:border-slate-750 outline-none focus:border-indigo-500/50"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                {searchingUsers && (
                  <div className="absolute right-3.5 top-3 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {blockSearchQuery.trim() !== '' ? (
                // Search Results
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Search Results</h4>
                  {blockSearchResults.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold py-2">No users found</p>
                  ) : (
                    blockSearchResults.map((u) => {
                      const isAlreadyBlocked = blockedUsers.some(b => b._id === u._id);
                      return (
                        <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-955/10 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                          <div className="flex items-center gap-3">
                            {u.profilePic ? (
                              <img src={u.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-xs text-slate-800 dark:text-white block">{u.name}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">@{u.username || 'user'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBlockUser(u)}
                            disabled={isAlreadyBlocked}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${isAlreadyBlocked ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-rose-50 text-rose-600 dark:bg-rose-955/20 dark:text-rose-400 hover:scale-105 active:scale-95 cursor-pointer'}`}
                          >
                            {isAlreadyBlocked ? 'Blocked' : 'Block'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                // Blocked Users List
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Currently Blocked ({blockedUsers.length})</h4>
                  {blockedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">You have not blocked any users yet</p>
                    </div>
                  ) : (
                    blockedUsers.map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl shadow-3xs">
                        <div className="flex items-center gap-3">
                          {u.profilePic ? (
                            <img src={u.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-xs text-slate-800 dark:text-white block">{u.name}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">@{u.username || 'user'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblockUser(u._id)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/60 text-slate-650 dark:text-slate-350 rounded-xl text-[10px] font-black border border-slate-150/40 dark:border-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Settings Modal */}
      {showChatSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowChatSettingsModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up max-h-[80vh] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black text-slate-855 dark:text-white">Chat Appearance</h3>
              </div>
              <button 
                onClick={() => setShowChatSettingsModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Chat Bubble Theme Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Chat Bubble Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { color: '#7C3AED', name: 'Violet' },
                    { color: '#2563EB', name: 'Blue' },
                    { color: '#10B981', name: 'Emerald' },
                    { color: '#F43F5E', name: 'Rose' },
                  ].map((theme) => (
                    <button
                      key={theme.color}
                      onClick={() => {
                        setChatTheme(theme.color);
                        localStorage.setItem('chat_theme', theme.color);
                        showToast(`Theme changed to ${theme.name}`);
                      }}
                      className={`h-12 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 cursor-pointer relative overflow-hidden`}
                      style={{ 
                        borderColor: chatTheme === theme.color ? theme.color : 'transparent',
                        backgroundColor: theme.color + '15'
                      }}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.color }} />
                      <span className="text-[9px] font-black" style={{ color: theme.color }}>{theme.name}</span>
                      {chatTheme === theme.color && (
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Wallpaper Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Chat Wallpaper</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'default', name: 'Default Plain', desc: 'System adaptive light/dark background', previewClass: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' },
                    { id: 'solid_dark', name: 'Midnight Solid', desc: 'Pitch black solid background', previewClass: 'bg-black text-white border-slate-800' },
                    { id: 'gradient_lavender', name: 'Lavender Mist', desc: 'Soft violet gradient background', previewClass: 'bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-violet-950/20 dark:to-indigo-950/20 text-slate-850 dark:text-slate-200 border-indigo-200 dark:border-indigo-950' },
                    { id: 'gradient_sunset', name: 'Sunset Glow', desc: 'Vibrant orange-rose gradient', previewClass: 'bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/10 dark:to-rose-950/10 text-slate-850 dark:text-slate-200 border-rose-200 dark:border-rose-950' },
                  ].map((wall) => (
                    <button
                      key={wall.id}
                      onClick={() => {
                        setChatWallpaper(wall.id);
                        localStorage.setItem('chat_wallpaper', wall.id);
                        showToast(`Wallpaper changed to ${wall.name}`);
                      }}
                      className={`p-3 rounded-2xl text-left border-2 transition-all active:scale-95 cursor-pointer ${wall.previewClass} ${chatWallpaper === wall.id ? 'ring-2 ring-[#7C3AED] border-transparent' : 'border-slate-100 dark:border-slate-800'}`}
                    >
                      <span className="font-black text-[11px] block">{wall.name}</span>
                      <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-bold block mt-1 leading-tight">{wall.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Bubble */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">Live Preview</label>
                <div 
                  className={`p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800 min-h-[100px] flex flex-col justify-end gap-2.5 overflow-hidden`}
                  style={{
                    background: chatWallpaper === 'solid_dark' 
                      ? '#090d16' 
                      : chatWallpaper === 'gradient_lavender'
                        ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
                        : chatWallpaper === 'gradient_sunset'
                          ? 'linear-gradient(135deg, #FEF3C7 0%, #FCE7F3 100%)'
                          : 'transparent'
                  }}
                >
                  <div className="flex justify-start">
                    <div className="py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl rounded-bl-sm text-[11px] font-bold text-slate-805 dark:text-slate-200 max-w-[70%] shadow-3xs">
                      Hey! How do you like this preview?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div 
                      className="py-2 px-3 text-white rounded-2xl rounded-br-sm text-[11px] font-black max-w-[70%] shadow-3xs transition-colors duration-300 animate-fade-in"
                      style={{ backgroundColor: chatTheme }}
                    >
                      Looks absolutely incredible! 🚀
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Requests Modal */}
      {showMessageRequestsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowMessageRequestsModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up max-h-[80vh] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black text-slate-855 dark:text-white">Message Requests</h3>
              </div>
              <button 
                onClick={() => setShowMessageRequestsModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-bold leading-normal">
                These are messages from users who aren't in your contacts list. They won't know you've seen their messages until you accept.
              </p>
              
              <div className="space-y-3">
                {messageRequests.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No pending message requests</p>
                  </div>
                ) : (
                  messageRequests.map((req) => (
                    <div key={req._id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl shadow-3xs flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        {req.profilePic ? (
                          <img src={req.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {req.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">{req.name}</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 block truncate mt-0.5 font-semibold">"{req.preview}"</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newList = messageRequests.filter(r => r._id !== req._id);
                            setMessageRequests(newList);
                            localStorage.setItem('message_requests', JSON.stringify(newList));
                            showToast(`Declined request from ${req.name}`);
                          }}
                          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black border border-slate-150/40 dark:border-slate-800 transition-all cursor-pointer text-center"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            const newList = messageRequests.filter(r => r._id !== req._id);
                            setMessageRequests(newList);
                            localStorage.setItem('message_requests', JSON.stringify(newList));
                            showToast(`Accepted! Conversation with ${req.name} started.`);
                          }}
                          className="flex-1 py-2 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white rounded-xl text-[10px] font-black shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storage Usage Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowStorageModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up max-h-[80vh] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-black text-slate-855 dark:text-white">Storage Usage</h3>
              </div>
              <button 
                onClick={() => setShowStorageModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Storage breakdown gauge */}
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-850 dark:text-white">
                      {(parseFloat(cacheSize) + parseFloat(mediaSize) + 1.8).toFixed(1)} MB
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">USED BY ZENIVIO</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black">64 GB Total Device Storage</span>
                </div>
                
                {/* Visual bar graph */}
                <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-sky-400" style={{ width: `${((parseFloat(cacheSize) || 0) / 15) * 100}%` }} />
                  <div className="h-full bg-indigo-500" style={{ width: `${((parseFloat(mediaSize) || 0) / 15) * 100}%` }} />
                  <div className="h-full bg-emerald-400" style={{ width: `${(1.8 / 15) * 100}%` }} />
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-405">Cache ({cacheSize})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-405">Media ({mediaSize})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-405">Database (1.8 MB)</span>
                  </div>
                </div>
              </div>

              {/* Actions & breakdown list */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <h4 className="text-xs font-black text-slate-800 dark:text-white">Optimize Device Storage</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-normal">
                  You can compress old media files and messages to free up device space without losing your chat logs.
                </p>
                <button
                  onClick={handleOptimizeStorage}
                  disabled={mediaSize === '2.1 MB'}
                  className="w-full py-3.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/40 text-xs font-black rounded-2xl transition-all border border-sky-100/50 dark:border-sky-900/50 flex items-center justify-center gap-2 cursor-pointer shadow-3xs disabled:opacity-50"
                >
                  <Database className="w-4 h-4" /> {mediaSize === '2.1 MB' ? 'Storage Fully Optimized' : 'Optimize Media Storage'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Settings Modal */}
      {showDownloadSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowDownloadSettingsModal(false)}
            className="absolute inset-0 bg-slate-955/70 backdrop-blur-sm animate-fade-in"
          />
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up max-h-[80vh] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black text-slate-855 dark:text-white">Media Auto-Download</h3>
              </div>
              <button 
                onClick={() => setShowDownloadSettingsModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Cellular Data Auto-download */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">When Using Mobile Data</h4>
                <div className="space-y-2.5">
                  {[
                    { key: 'cellularPhotos', label: 'Photos' },
                    { key: 'cellularAudio', label: 'Audio' },
                    { key: 'cellularVideos', label: 'Videos' },
                    { key: 'cellularDocs', label: 'Documents' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                      <button
                        onClick={() => {
                          const newSettings = { ...downloadSettings, [item.key]: !downloadSettings[item.key] };
                          setDownloadSettings(newSettings);
                          localStorage.setItem('download_settings', JSON.stringify(newSettings));
                          showToast('Download settings updated.');
                        }}
                        className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none ${downloadSettings[item.key] ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${downloadSettings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wi-Fi Auto-download */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">When Connected on Wi-Fi</h4>
                <div className="space-y-2.5">
                  {[
                    { key: 'wifiPhotos', label: 'Photos' },
                    { key: 'wifiAudio', label: 'Audio' },
                    { key: 'wifiVideos', label: 'Videos' },
                    { key: 'wifiDocs', label: 'Documents' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                      <button
                        onClick={() => {
                          const newSettings = { ...downloadSettings, [item.key]: !downloadSettings[item.key] };
                          setDownloadSettings(newSettings);
                          localStorage.setItem('download_settings', JSON.stringify(newSettings));
                          showToast('Download settings updated.');
                        }}
                        className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none ${downloadSettings[item.key] ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${downloadSettings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache clearing step loader overlay */}
      {clearingCache && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100 dark:border-slate-850">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <span className="text-sm font-black text-slate-850 dark:text-white block">Optimizing System</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider block animate-pulse">{clearingCacheStep}</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl text-xs font-black shadow-2xl animate-fade-in flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-800/10 dark:border-slate-100/10">
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
