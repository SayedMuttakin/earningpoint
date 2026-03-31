import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Search, Earth } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文 (简体)' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'ko', name: 'Korean', native: '한국어' },
];

const LanguagePage = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    // Detect currently selected language from cookies
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match) {
      setActiveLang(match[1]);
    } else {
      setActiveLang('en');
    }
  }, []);

  const handleLanguageSelect = (code) => {
    if (code === 'en') {
      // English is the original, clear the cookie
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    } else {
      // Set the translation cookie
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    }
    // Reloads to apply the translation immediately
    window.location.reload();
  };

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col relative pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors mr-4">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 flex-1">App Language</h1>
          <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
            <Earth className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex justify-center">
        <div className="w-full max-w-xl">
          {/* Search Bar */}
          <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow shadow-sm"
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Language List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {filteredLanguages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full flex items-center justify-between p-4 sm:p-5 transition-colors text-left border-b border-slate-100 last:border-0 ${
                activeLang === lang.code ? 'bg-brand-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-[17px] ${activeLang === lang.code ? 'font-bold text-brand-700' : 'font-semibold text-slate-800'}`}>
                  {lang.native}
                </span>
                <span className={`text-sm mt-0.5 ${activeLang === lang.code ? 'text-brand-600/80' : 'text-slate-500'}`}>
                  {lang.name}
                </span>
              </div>
              
              {activeLang === lang.code ? (
                <CheckCircle className="w-6 h-6 text-brand-600 shadow-sm rounded-full bg-white" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-slate-300 transition-colors" />
              )}
            </button>
          ))}
          
          {filteredLanguages.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No languages found matching "{searchQuery}"
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagePage;
