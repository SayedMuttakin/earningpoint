import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, Printer, Search, Shield, Lock, Scale, MessageSquare, 
  Coins, Ban, ShoppingBag, Newspaper, UserX, Copyright, RefreshCw, 
  Database, Cpu, Users, Share2, UserCheck, Baby, Moon, Sun, 
  Info, ExternalLink, ArrowRight, HelpCircle, Check, FileText,
  Truck, RotateCcw, DollarSign, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updatePageSEO } from '../utils/seo';

const aboutSections = [
  {
    id: 'what-is-zenivio',
    number: 1,
    title: 'What is Zenivio?',
    icon: Info,
    description: 'Zenivio is a next-generation social networking platform created to bring people together through authentic conversations, creative text posts, and meaningful community engagement.',
    bullets: [
      'More Than a Social Network: A clutter-free space focused on real interactions rather than distracting algorithms.',
      'Text-First Social Expression: Share your thoughts, life updates, stories, and ideas with rich gradient cards.',
      'Worldwide Connections: Follow friends, creators, and interesting individuals across the globe.',
      'Complete Privacy Control: You own your content, manage your visibility, and control your digital presence.'
    ]
  },
  {
    id: 'how-zenivio-works',
    number: 2,
    title: 'How Zenivio Works',
    icon: Cpu,
    description: 'Getting started on Zenivio is seamless, intuitive, and designed for instant community participation.',
    bullets: [
      '1. Create Your Profile: Sign up in seconds, customize your avatar, bio, and verification badge.',
      '2. Share Your World: Write expressive text posts with color gradients, attach photos or videos, and express your mood with emoji feelings.',
      '3. Discover & Interact: Browse the global community feed, follow intriguing voices, like, and join real-time discussions.',
      '4. Connect Privately: Direct message friends with fast, secure, real-time messaging.',
      '5. Multi-Account Flexibility: Switch between personal and project profiles effortlessly on the same device.'
    ]
  },
  {
    id: 'text-based-networking',
    number: 3,
    title: 'Text-Based Social Networking & Digital Communication',
    icon: FileText,
    description: 'In an era overwhelmed by short attention spans, Zenivio celebrates the clarity, depth, and impact of text-based communication.',
    bullets: [
      'Thoughtful Conversations: Words allow for deeper expression, storytelling, and mutual understanding.',
      'Visual Emphasis: Beautiful gradient backgrounds turn simple thoughts into eye-catching social cards.',
      'Inclusive & Accessible: Text-based posts load instantly on any network speed and device.'
    ]
  },
  {
    id: 'online-communities',
    number: 4,
    title: 'Building Positive Online Communities',
    icon: Users,
    description: 'Zenivio provides the foundation for interest-driven social circles where members support, inspire, and learn from one another.',
    bullets: [
      'Shared Interests: Connect with people who share your passions, hobbies, and creative goals.',
      'Constructive Engagement: Our community guidelines encourage respectful, uplifting, and safe interactions.',
      'Global Reach: Discover international perspectives and broaden your worldview.'
    ]
  },
  {
    id: 'social-media-safety',
    number: 5,
    title: 'Social Media Safety & User Protection',
    icon: Shield,
    description: 'Your safety, security, and mental well-being are paramount at Zenivio.',
    bullets: [
      'Zero Tolerance for Harassment: Strong automated and community-led moderation protects against abuse and spam.',
      'Granular Privacy Controls: Choose who can see your posts (Public, Friends, or Private).',
      'Data Integrity: We do not sell your personal information to third-party data brokers.'
    ]
  }
];

const featuresSections = [
  {
    id: 'text-posts-feature',
    number: 1,
    title: 'Text-Based Posts & Custom Gradient Cards',
    icon: FileText,
    description: 'Create and share text-based posts on Zenivio with custom color gradients, photos, and expressive formatting.',
    bullets: [
      'Gradient Cards: Choose vibrant backgrounds to make your text posts stand out.',
      'Photo Attachments: Add high-resolution photos to accompany your thoughts.',
      'Interactive Reactions: Like, react, and comment in real-time.'
    ]
  },
  {
    id: 'social-network-feature',
    number: 2,
    title: 'Global Social Network & Community Feed',
    icon: Users,
    description: 'Explore the global community feed, discover trending discussions, and follow users worldwide.',
    bullets: [
      'Community Feed: Real-time public timeline featuring posts from across the platform.',
      'Profile Customization: Display verified badges, biography, and personalized avatar.',
      'Multi-Account Switcher: Instantly switch between accounts on the same device.'
    ]
  },
  {
    id: 'messaging-feature',
    number: 3,
    title: 'Direct Messaging & Real-Time Chat',
    icon: MessageSquare,
    description: 'Chat directly with friends, share thoughts, and communicate in real time with high reliability.',
    bullets: [
      'Real-time text delivery with online presence indicators.',
      'Secure direct 1-on-1 conversations.'
    ]
  },
  {
    id: 'news-feature',
    number: 4,
    title: 'Curated News & Daily Headlines',
    icon: Newspaper,
    description: 'Stay updated with curated international news stories and global headlines directly from your home feed.',
    bullets: [
      'Top Stories: Curated headlines updated daily.',
      'Direct Read: Clean, readable layout for discovering current events.'
    ]
  }
];

const contactSections = [
  {
    id: 'official-contact',
    number: 1,
    title: 'Official Support & Inquiries',
    icon: Phone,
    description: 'Contact Zenivio for questions, support, feedback and information about the platform.',
    bullets: [
      'Official Email: support@zenivio.com',
      'Help Desk: Open a real-time ticket via the in-app Help & Support desk.',
      'Feedback: We welcome user feedback to continually improve your social networking experience.'
    ]
  }
];

const privacySections = [
  {
    id: 'collect',
    number: 1,
    title: 'Information We Collect',
    icon: Database,
    description: 'When you use Zenivio, we may collect various types of information to provide and improve our service.',
    bullets: [
      'Full Name',
      'Username',
      'Email Address',
      'Phone Number (if provided)',
      'Profile Photo',
      'Date of Birth (optional)',
      'Device Information',
      'IP Address',
      'App Usage Data',
      'Posts, Comments, Likes & Reactions',
      'Messages exchanged within the app',
      'Wallet and transaction records (if applicable)'
    ]
  },
  {
    id: 'use',
    number: 2,
    title: 'How We Use Your Information',
    icon: Cpu,
    description: 'Your information is utilized to operate the Zenivio platform, customize your experience, and maintain a secure environment.',
    bullets: [
      'Create and manage your account',
      'Provide social networking features',
      'Enable messaging between users',
      'Display your public profile',
      'Improve app performance',
      'Personalize content',
      'Prevent spam, fraud and abuse',
      'Provide customer support',
      'Process rewards and wallet-related features',
      'Send important account notifications'
    ]
  },
  {
    id: 'community',
    number: 3,
    title: 'Community Content',
    icon: Users,
    description: 'Any content you publish, including posts, comments, profile information, photos, and videos, may be visible to other users depending on your privacy settings.',
    bullets: []
  },
  {
    id: 'messaging',
    number: 4,
    title: 'Messaging Privacy',
    icon: MessageSquare,
    description: 'Private messages are intended only for communication between users. Zenivio does not publicly display private conversations. However, we may review reported conversations when necessary to investigate abuse, fraud, harassment, or violations of our policies.',
    bullets: []
  },
  {
    id: 'news',
    number: 5,
    title: 'News Content',
    icon: Newspaper,
    description: 'News displayed within Zenivio may be created by us or obtained from authorized sources. News is provided for informational purposes only. We do not guarantee the complete accuracy of third-party news content.',
    bullets: []
  },
  {
    id: 'wallet',
    number: 6,
    title: 'Wallet & Rewards',
    icon: Coins,
    description: 'If you use the Wallet, Refer & Earn, Daily Rewards, Coins, or Cashback features, your activity is processed securely to maintain account balance, prevent fraud, and manage rewards. Our wallet operates under the following criteria:',
    bullets: [
      'Wallet Terms: Use of the Wallet features and reward redemption is subject to user account validation and anti-manipulation rules.',
      'Transaction History: All wallet points, rewards, and transfers are logged in an immutable transaction history to protect account security.',
      'Payment Security: All payments, withdrawals, and top-ups are processed using secure, industry-standard encrypted gateways.',
      'Refund Policy: Earned rewards, coins, and purchases are subject to specific withdrawal and refund guidelines outlined in our Terms.'
    ]
  },
  {
    id: 'security',
    number: 7,
    title: 'Data Security',
    icon: Lock,
    description: 'We use reasonable security measures to protect your personal information. However, no online platform can guarantee 100% security.',
    bullets: []
  },
  {
    id: 'sharing',
    number: 8,
    title: 'Sharing Information',
    icon: Share2,
    description: 'We do not sell your personal information. We may share information only:',
    bullets: [
      'When required by law',
      'To investigate abuse or fraud',
      'With trusted service providers who help operate the app'
    ]
  },
  {
    id: 'rights',
    number: 9,
    title: 'Your Rights',
    icon: UserCheck,
    description: 'You have full control over your presence on Zenivio. You can:',
    bullets: [
      'Edit your profile',
      'Delete your posts',
      'Block users',
      'Report users',
      'Delete your account',
      'Request removal of your personal data (subject to applicable laws and our retention requirements)'
    ]
  },
  {
    id: 'children',
    number: 10,
    title: 'Children’s Privacy',
    icon: Baby,
    description: 'Zenivio is not intended for children under 18 years of age (or the minimum age required in your jurisdiction).',
    bullets: []
  },
  {
    id: 'permissions',
    number: 11,
    title: 'Device Permissions',
    icon: Shield,
    description: 'To provide full social networking and messaging features, Zenivio requests only necessary device permissions. We do not access unnecessary permissions:',
    bullets: [
      'Camera: Required to capture profile photos, create posts or stories, and send real-time photos in chat.',
      'Notification: Required to send instant push notifications for chat messages, comments, likes, and profile updates.',
      'Storage: Required to select and upload images or videos from your gallery for profile pictures, stories, or posts.'
    ]
  }
];

const termsSections = [
  {
    id: 'eligibility',
    number: 1,
    title: 'Eligibility',
    icon: Scale,
    description: 'You must be legally eligible to use this application under the laws applicable to you.',
    bullets: []
  },
  {
    id: 'responsibilities',
    number: 2,
    title: 'User Responsibilities',
    icon: UserCheck,
    description: 'You agree to maintain a safe, respectful environment. Specifically, you agree not to:',
    bullets: [
      'Share false information',
      'Create fake accounts',
      'Harass other users',
      'Upload illegal content',
      'Violate copyrights or intellectual property rights',
      'Spread malware or spam',
      'Attempt unauthorized access to the platform'
    ]
  },
  {
    id: 'community-rules',
    number: 3,
    title: 'Community Rules',
    icon: Ban,
    description: 'The following content is strictly prohibited on Zenivio:',
    bullets: [
      'Hate speech',
      'Violence or threats',
      'Terrorist content',
      'Pornographic or sexually explicit content',
      'Child exploitation',
      'Drug trafficking',
      'Gambling promotion where prohibited',
      'Fraud or scams',
      'Fake giveaways',
      'Impersonating another person or organization'
    ],
    prohibited: true
  },
  {
    id: 'posts',
    number: 4,
    title: 'Posts & User Content',
    icon: FileText,
    description: 'Users are responsible for the content they publish. Zenivio reserves the right to remove content that violates these Terms or applicable laws. Repeated violations may lead to temporary suspension or permanent account termination.',
    bullets: []
  },
  {
    id: 'messaging-terms',
    number: 5,
    title: 'Messaging',
    icon: MessageSquare,
    description: 'Users must not use private messaging for harassment, threats, fraud, spam, or illegal activities. Reported conversations may be reviewed for policy enforcement.',
    bullets: []
  },
  {
    id: 'wallet-rewards',
    number: 6,
    title: 'Wallet & Rewards',
    icon: Coins,
    description: 'Rewards, referral bonuses, coins, or cashback may be modified, suspended, or discontinued at any time. Any attempt to exploit bugs, create fake accounts, automate activities, or manipulate the reward system may result in forfeiture of rewards and account suspension.',
    bullets: []
  },
  {
    id: 'marketplace',
    number: 7,
    title: 'Marketplace',
    icon: ShoppingBag,
    description: 'Buyers and sellers must provide accurate product information. Zenivio may facilitate the marketplace but is not automatically responsible for disputes between buyers and sellers unless otherwise stated.',
    bullets: []
  },
  {
    id: 'news-terms',
    number: 8,
    title: 'News',
    icon: Newspaper,
    description: 'News content is provided for informational purposes. Users should verify important information independently before relying on it.',
    bullets: []
  },
  {
    id: 'suspension',
    number: 9,
    title: 'Account Suspension',
    icon: UserX,
    description: 'Zenivio may suspend or permanently terminate accounts that violate these Terms or applicable laws.',
    bullets: []
  },
  {
    id: 'ip',
    number: 10,
    title: 'Intellectual Property',
    icon: Copyright,
    description: 'The Zenivio name, logo, design, software, and other platform assets are the property of Zenivio unless otherwise stated. Users may not copy, modify, or redistribute them without permission.',
    bullets: []
  },
  {
    id: 'changes',
    number: 11,
    title: 'Changes to These Terms',
    icon: RefreshCw,
    description: 'We may update these Terms from time to time. Continued use of the app after changes means you accept the updated Terms.',
    bullets: []
  },
  {
    id: 'return-policy',
    number: 12,
    title: 'Return Policy',
    icon: RotateCcw,
    description: 'We strive to ensure your complete satisfaction with any products purchased via the Zenivio Marketplace. If you receive a product that is damaged, defective, or incorrect, you may request a return within 7 calendar days of delivery. The item must be unused, in its original packaging, and include all tags and accessories.',
    bullets: []
  },
  {
    id: 'refund-policy',
    number: 13,
    title: 'Refund Policy',
    icon: DollarSign,
    description: 'Upon receiving and inspecting your returned item, we will notify you of the approval or rejection of your refund. Approved refunds are processed to your original payment method (Mobile Wallet / Bank Transfer) or credited back as Coins to your Zenivio Wallet within 5 to 7 business days.',
    bullets: []
  },
  {
    id: 'shipping-delivery',
    number: 14,
    title: 'Shipping & Delivery',
    icon: Truck,
    description: 'We process physical marketplace orders within 24 to 48 business hours. Deliveries typically take 2 to 4 business days within metropolitan areas and 5 to 7 business days for regional areas. Delivery charges (if applicable) are displayed at checkout and are non-refundable.',
    bullets: []
  },
  {
    id: 'contact-details',
    number: 15,
    title: 'Contact Support',
    icon: Phone,
    description: 'For any queries, disputes, refund requests, or feedback, you can contact the Zenivio support desk at support@zenivio.com or call us directly at +8801900000000. We are available Sunday to Thursday, 10 AM to 6 PM.',
    bullets: []
  }
];

const TermsPrivacyPage = ({ onBack, initialTab = 'terms', standalone = false, darkMode = false, onToggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('');

  // Sync initialTab when it changes externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const sections = useMemo(() => {
    if (activeTab === 'about') return aboutSections;
    if (activeTab === 'features') return featuresSections;
    if (activeTab === 'contact') return contactSections;
    if (activeTab === 'privacy') return privacySections;
    return termsSections;
  }, [activeTab]);

  useEffect(() => {
    if (['about', 'features', 'contact'].includes(activeTab)) {
      updatePageSEO(activeTab);
    }
  }, [activeTab]);

  // Search logic
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(sec => 
      sec.title.toLowerCase().includes(query) ||
      sec.description.toLowerCase().includes(query) ||
      sec.bullets.some(b => b.toLowerCase().includes(query))
    );
  }, [sections, searchQuery]);

  // Handle section clicking and scroll
  const scrollToSection = (id) => {
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-300 overflow-y-auto pb-20">
      {/* Dynamic Print CSS Injection */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            color: #000 !important;
          }
          .print-section-card {
            border: 1px solid #e2e8f0 !important;
            page-break-inside: avoid;
            margin-bottom: 1.5rem !important;
            background: #fff !important;
            color: #000 !important;
          }
          .dark .print-section-card {
            color: #000 !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* 1. TOP BAR / HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800/80 transition-all duration-300 no-print pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-slate-700 dark:text-slate-250 cursor-pointer active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span 
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent cursor-pointer transform hover:scale-105 transition-all duration-300 select-none"
              onClick={() => {
                if (standalone) {
                  window.location.href = '/';
                } else {
                  onBack();
                }
              }}
            >
              Zenivio
            </span>
          </div>

          {/* Center Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl relative gap-1">
            <button 
              onClick={() => { setActiveTab('about'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'about' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-violet-400 shadow-sm scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              About
            </button>
            <button 
              onClick={() => { setActiveTab('features'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'features' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-violet-400 shadow-sm scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Features
            </button>
            <button 
              onClick={() => { setActiveTab('terms'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'terms' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-violet-400 shadow-sm scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Terms
            </button>
            <button 
              onClick={() => { setActiveTab('privacy'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'privacy' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-violet-400 shadow-sm scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Privacy
            </button>
            <button 
              onClick={() => { setActiveTab('contact'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'contact' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-violet-400 shadow-sm scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Contact
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {standalone && onToggleDarkMode && (
              <button 
                onClick={onToggleDarkMode}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>
            )}

            {standalone && (
              <a 
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-650 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold transition-all duration-300 shadow-md shadow-indigo-650/10 hover:shadow-indigo-650/20 active:scale-95"
              >
                Launch App
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tab Selector */}
      <div className="md:hidden px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/60 no-print flex gap-1.5 overflow-x-auto">
        <button 
          onClick={() => { setActiveTab('about'); setSearchQuery(''); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'about' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          About
        </button>
        <button 
          onClick={() => { setActiveTab('features'); setSearchQuery(''); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'features' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Features
        </button>
        <button 
          onClick={() => { setActiveTab('terms'); setSearchQuery(''); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'terms' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Terms
        </button>
        <button 
          onClick={() => { setActiveTab('privacy'); setSearchQuery(''); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Privacy
        </button>
        <button 
          onClick={() => { setActiveTab('contact'); setSearchQuery(''); }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Contact
        </button>
      </div>

      {/* 2. DYNAMIC HEADER SECTION */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-slate-50 dark:from-slate-900/30 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/40 dark:border-slate-900/80">
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.01] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-100/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black tracking-wide uppercase mb-6"
          >
            <Shield className="w-3.5 h-3.5" />
            {activeTab === 'about' ? 'Platform Overview' : (activeTab === 'features' ? 'Feature Showcase' : (activeTab === 'contact' ? 'Support Desk' : 'Legal Documentation'))}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4"
          >
            {activeTab === 'about' && 'About Zenivio'}
            {activeTab === 'features' && 'Explore Zenivio Features'}
            {activeTab === 'contact' && 'Contact Zenivio'}
            {activeTab === 'privacy' && 'Zenivio Privacy Policy'}
            {activeTab === 'terms' && 'Zenivio Terms & Conditions'}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400"
          >
            {activeTab === 'about' && 'More Than a Social Network — Built to Bring People Together'}
            {activeTab === 'features' && 'Social Networking, Creative Text Posts & Community Connection'}
            {activeTab === 'contact' && 'We are here to answer your questions and provide official assistance'}
            {activeTab === 'privacy' && 'Effective Date: July 2026'}
            {activeTab === 'terms' && 'Effective Date: July 2026'}
          </motion.p>

          {/* Quick Search */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 max-w-lg mx-auto no-print"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'privacy' ? "Search privacy policy clauses..." : "Search terms & conditions..."}
                className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 print-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print-full">
          
          {/* Side Sticky Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 no-print max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 pl-1">
              Table of Contents
            </h4>
            <nav className="space-y-1">
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${activeSection === sec.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 shadow-sm border-l-3 border-indigo-600 dark:border-violet-500' : 'text-slate-500 hover:bg-slate-105 dark:text-slate-400 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 border-l-3 border-transparent'}`}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-[11px] font-black rounded-lg bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                    {sec.number}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
              {filteredSections.length === 0 && (
                <p className="text-xs text-slate-400 pl-2 italic">No matches found</p>
              )}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 pl-1">
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900/40 dark:to-slate-800/40 p-4 rounded-2xl border border-indigo-100/50 dark:border-slate-800/60">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Need Help?</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  For legal inquiries or account data request, reach our support.
                </p>
                <a 
                  href="/?tab=Support"
                  onClick={(e) => {
                    if (!standalone) {
                      e.preventDefault();
                      onBack();
                      setTimeout(() => {
                        const supportBtn = document.querySelector('[title="Support"]');
                        if (supportBtn) supportBtn.click();
                      }, 100);
                    }
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 dark:text-violet-400 hover:underline"
                >
                  Contact Support
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Legal Text Area */}
          <main className="lg:col-span-9 space-y-6 print-full">
            
            {/* Quick Summary / At a Glance Panel */}
            {!searchQuery && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-5 items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                    Legal Summary
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Quick Read</span>
                  </h3>
                  <p className="text-slate-505 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                    {activeTab === 'privacy' 
                      ? 'Welcome to Zenivio. We are fully committed to protecting your personal information and privacy. This document outlines the categories of data we gather (e.g. email, profile details, device metrics, messaging data), how we leverage it to enable social features and prevent abuse, how your rights allow you control over your account, and how we handle rewards or daily cashback metrics securely.'
                      : 'By using the Zenivio platform, you accept these terms. Our guidelines clarify account eligibility (minimum age 18), user obligations, and strictly prohibit malicious behaviors, fake accounts, harassment, or scam activities. This document also governs content ownership, messaging policies, marketplace transactions, rewards system criteria, and account suspension protocols.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Document Content Sections */}
            <div className="space-y-6 print-full">
              {filteredSections.map((sec) => (
                <article
                  key={sec.id}
                  id={`sec-${sec.id}`}
                  className={`bg-white dark:bg-slate-900 border ${sec.prohibited ? 'border-rose-100 dark:border-rose-950/40' : 'border-slate-200/70 dark:border-slate-800/65'} rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative group scroll-mt-20 print-section-card`}
                >
                  {/* Floating index decoration */}
                  <span className="absolute top-6 right-6 text-3xl font-black text-slate-100 dark:text-slate-800 select-none group-hover:scale-110 transition-transform duration-300">
                    {String(sec.number).padStart(2, '0')}
                  </span>

                  <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${sec.prohibited ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-650 dark:text-slate-350 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`}>
                      <sec.icon className="w-5.5 h-5.5" />
                    </div>

                    <div className="flex-1 w-full">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                        {sec.number}. {sec.title}
                      </h3>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-semibold">
                        {sec.description}
                      </p>

                      {/* Render Bullets if present */}
                      {sec.bullets.length > 0 && (
                        <ul className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sec.bullets.map((bullet, idx) => (
                            <li 
                              key={idx} 
                              className={`flex items-start gap-2.5 p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-colors ${
                                sec.prohibited 
                                  ? 'bg-rose-50/40 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300 border border-rose-100/30' 
                                  : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-750 dark:text-slate-300 border border-slate-100/10'
                              }`}
                            >
                              {sec.prohibited ? (
                                <span className="text-rose-500 font-bold flex-shrink-0">❌</span>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450 flex-shrink-0">
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                              )}
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {filteredSections.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Matching Clauses Found</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                    We couldn't find any results matching "{searchQuery}". Try searching for keywords like "wallet", "messages", or "prohibited".
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-5 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Info Banner */}
            <div className="mt-8 bg-gradient-to-r from-indigo-650 via-indigo-700 to-violet-650 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg no-print">
              <div className="absolute inset-0 bg-grid-white/[0.04] pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-xl font-black mb-2 tracking-tight">Need to delete your data or account?</h3>
                  <p className="text-slate-100 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed">
                    You can manage profile edits, block users, or initiate account erasure from settings. If you require manual personal data extraction, email our compliance team.
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <a 
                    href="/?tab=Support"
                    onClick={(e) => {
                      if (!standalone) {
                        e.preventDefault();
                        onBack();
                        setTimeout(() => {
                          const supportBtn = document.querySelector('[title="Support"]');
                          if (supportBtn) supportBtn.click();
                        }, 100);
                      }
                    }}
                    className="flex-1 md:flex-none text-center px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 dark:text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <p className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 pt-8 print-full">
              Zenivio Social Network platform. All rights reserved. &copy; 2026.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyPage;
