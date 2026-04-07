import React, { useState } from 'react';
import { 
  ChevronLeft, ScrollText, ShieldAlert, CheckCircle2, UserX, 
  UserCheck, AlertTriangle, RefreshCcw, HandMetal, Smartphone, 
  Search, Database, Fingerprint, Cookie, HelpCircle, Baby 
} from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const termsData = [
  { id: 1, title: 'Acceptance of Terms', desc: 'By using our app, you confirm that you accept these Terms & Conditions and agree to comply with them.', icon: CheckCircle2 },
  { id: 2, title: 'User Responsibilities', desc: 'You agree to use the app only for lawful purposes. You must not misuse, hack, or attempt to disrupt the app.', icon: UserX },
  { id: 3, title: 'Account Registration', desc: 'You are responsible for maintaining the confidentiality of your account. Providing false information may result in account suspension.', icon: UserCheck },
  { id: 4, title: 'Earnings & Rewards', desc: 'Any earning, reward, or bonus is subject to our system validation. Fraudulent activities (fake clicks, bots, manipulation) will result in termination and cancellation of earnings.', icon: AlertTriangle },
  { id: 5, title: 'Content & Services', desc: 'The app may provide news, shopping, and earning opportunities. We do not guarantee accuracy or reliability of third-party content.', icon: Smartphone },
  { id: 6, title: 'Modifications', desc: 'We reserve the right to update, modify, or discontinue any part of the app at any time without prior notice.', icon: RefreshCcw },
  { id: 7, title: 'Termination', desc: 'We may suspend or terminate your access if you violate any of these terms.', icon: HandMetal },
];

const privacyData = [
  { id: 1, title: 'Information We Collect', desc: 'Personal Information (Name, Email, Phone Number). Device Information (Device type, OS, IP address). Usage Data (App activity, interactions).', icon: Search },
  { id: 2, title: 'How We Use Information', desc: 'To improve app performance and user experience. To send updates, offers, and notifications. To ensure security and prevent fraud.', icon: ShieldAlert },
  { id: 3, title: 'Data Sharing', desc: 'We do not sell your personal data. Data may be shared with trusted third-party services (Ads, Payments, Analytics).', icon: Database },
  { id: 4, title: 'Data Security', desc: 'We implement appropriate security measures to protect your data, but no system is 100% secure.', icon: Fingerprint },
  { id: 5, title: 'Cookies & Tracking', desc: 'We may use cookies or similar technologies to enhance user experience.', icon: Cookie },
  { id: 6, title: 'User Rights', desc: 'You can request to update or delete your data. You may opt out of notifications anytime.', icon: HelpCircle },
  { id: 7, title: 'Children’s Privacy', desc: 'Our app is not intended for children under 13. We do not knowingly collect data from children.', icon: Baby },
];

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="mb-8 flex flex-col items-center text-center max-w-2xl mx-auto animate-fade-in-up">
    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
      <Icon className="w-8 h-8 text-indigo-600" />
    </div>
    <h2 className="text-3xl font-black text-slate-900 mb-3">{title}</h2>
    <p className="text-slate-500 font-medium text-lg leading-relaxed">{description}</p>
  </div>
);

const InfoCard = ({ item, index }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 animate-fade-in-up">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 group-hover:-translate-y-1 transition-all">
      <item.icon className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{item.id}. {item.title}</h3>
      <p className="text-slate-500 text-sm sm:text-base leading-relaxed">{item.desc}</p>
    </div>
  </div>
);

const TermsPrivacyPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('terms');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-slate-50 flex flex-col pb-24 font-sans relative">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors mr-4 flex-shrink-0">
                <ChevronLeft className="w-6 h-6 text-slate-700" />
              </button>
              <h1 className="text-xl font-bold text-slate-900 truncate">Legal Information</h1>
            </div>
            
            <div className="flex items-center bg-slate-100 p-1.5 rounded-full w-full md:w-auto overflow-x-auto">
              <button 
                onClick={() => setActiveTab('terms')}
                className={`flex-1 whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'terms' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Terms & Conditions
              </button>
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
            {activeTab === 'terms' && (
              <div key="terms" className="animate-fade-in-up">
                <SectionHeader 
                  title="Terms & Conditions" 
                  icon={ScrollText}
                  description="By accessing and using this application, you agree to the following terms to ensure a safe community." 
                />
                <div className="grid gap-4 sm:gap-6 mt-8">
                  {termsData.map((item, i) => <InfoCard key={item.id} item={item} index={i} />)}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div key="privacy" className="animate-fade-in-up">
                <SectionHeader 
                  title="Privacy Policy" 
                  icon={ShieldAlert}
                  description="Your privacy is important to us. This policy explains how we thoughtfully collect, use, and protect your data." 
                />
                <div className="grid gap-4 sm:gap-6 mt-8">
                  {privacyData.map((item, i) => <InfoCard key={item.id} item={item} index={i} />)}
                </div>
              </div>
            )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default TermsPrivacyPage;
