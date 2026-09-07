import React, { useState, useRef, useEffect } from 'react';
import PullToRefresh from './PullToRefresh';
import { 
  ChevronLeft, 
  Camera, 
  CheckCircle, 
  Upload, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Search, 
  ChevronDown, 
  HelpCircle, 
  Crown,
  Loader2
} from 'lucide-react';
import { API_BASE } from '../config';

// Custom Gold and Blue Twitter-style Verified Badge SVG Components
const GoldVerifiedBadge = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 24 24" className={`${className} flex-shrink-0`} fill="currentColor">
    <g>
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill="#EAB308"/>
      <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
    </g>
  </svg>
);

const BlueVerifiedBadge = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" className={`${className} flex-shrink-0`} fill="currentColor">
    <g>
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill="#7c3aed"/>
      <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
    </g>
  </svg>
);

const VerificationPage = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState({ code: 'BD', name: 'Bangladesh' });
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [docType, setDocType] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState('not_submitted');
  const [reviewNote, setReviewNote] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({
    front: null,
    back: null,
    selfie: null
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/verification`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setVerificationStatus(data.status || 'not_submitted');
          if (data.verification?.reviewNote) {
            setReviewNote(data.verification.reviewNote);
          }
        }
      } catch (err) {
        console.error('Failed to fetch verification status:', err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          code: c.cca2,
          name: c.name.common
        })).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formatted);
      })
      .catch((err) => {
        setCountries([
          { code: 'BD', name: 'Bangladesh' },
          { code: 'IN', name: 'India' },
          { code: 'US', name: 'United States' },
          { code: 'CA', name: 'Canada' },
          { code: 'GB', name: 'United Kingdom' },
        ]);
      });
  }, []);

  const [images, setImages] = useState({
    front: null,
    back: null,
    selfie: null
  });

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const handleNext = () => {
    if (step === 6) {
      handleSubmit();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleCapture = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImages(prev => ({ ...prev, [type]: imageUrl }));
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const frontBase64 = files.front ? await fileToBase64(files.front) : '';
      const backBase64 = files.back ? await fileToBase64(files.back) : '';
      const selfieBase64 = files.selfie ? await fileToBase64(files.selfie) : '';

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          country: country.name,
          documentType: docType.toLowerCase(),
          frontImage: frontBase64,
          backImage: backBase64,
          selfieImage: selfieBase64
        })
      });

      if (res.ok) {
        setVerificationStatus('pending');
        setStep(7);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit verification.');
      }
    } catch (err) {
      console.error('Submit verification error:', err);
      alert('An error occurred while submitting your verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Intercept the native back button or custom back action to handle sub-navigation safely
  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (showOfficialModal) {
        e.preventDefault();
        setShowOfficialModal(false);
      } else if (isCountryOpen) {
        e.preventDefault();
        setIsCountryOpen(false);
      } else if (step > 1) {
        e.preventDefault();
        setStep(prev => prev - 1);
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [showOfficialModal, isCountryOpen, step]);

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="flex flex-col h-full space-y-6 animate-fade-in-up">
            {/* Promo Banner Card (Gold verified badge left, description right) */}
            <div className="bg-[#FAF7F2] dark:bg-slate-900/50 rounded-3xl p-5 border border-[#F0EAE1] dark:border-slate-800/80 flex items-start gap-4 shadow-3xs">
              <GoldVerifiedBadge className="w-14 h-14 flex-shrink-0" />
              <div className="space-y-1">
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight">Get Verified on Zenevio</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Verification helps people trust your profile. Choose a verification type that best represents you.
                </p>
              </div>
            </div>
            
            {/* Verification Choices List */}
            <div className="space-y-4">
              {/* Card 1: Verified User */}
              <div className="bg-slate-50/40 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-4.5 flex items-center justify-between shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <BlueVerifiedBadge className="w-11 h-11 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-extrabold text-[15px] text-slate-855 dark:text-slate-200 block truncate">Verified User</span>
                    <span className="text-[11px] text-slate-450 dark:text-slate-500 font-bold block truncate mt-0.5">Prove your identity and get verified.</span>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-sm shadow-indigo-650/20"
                >
                  Apply
                </button>
              </div>

              {/* Card 2: Official Account */}
              <div className="bg-slate-50/40 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-4.5 flex items-center justify-between shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 dark:text-amber-400 flex-shrink-0 shadow-3xs">
                    <Crown className="w-6 h-6" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-[15px] text-slate-855 dark:text-slate-200 block truncate">Official Account</span>
                    <span className="text-[11px] text-slate-450 dark:text-slate-500 font-bold block truncate mt-0.5">For brands, organizations & public figures.</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOfficialModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-sm shadow-indigo-650/20"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col h-full space-y-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                <GlobeIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Your Country</h2>
              <p className="text-slate-500 text-sm">Please select the country matching your identity document.</p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="w-full bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} width="24" className="rounded-sm shadow-sm" alt={country.name} />
                  <span className="text-lg font-medium text-slate-800">{country.name}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCountryOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col max-h-80 animate-fade-in-up"
                >
                  <div className="p-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search countries..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full outline-none text-slate-700 placeholder-slate-400"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto scbar-hide">
                    {countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setCountry(c); setIsCountryOpen(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-55 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        <img src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} width="24" className="rounded-sm shadow-sm" alt={c.name} />
                        <span className={`text-[15px] ${country.code === c.code ? 'font-bold text-brand-700' : 'font-medium text-slate-700'}`}>{c.name}</span>
                        {country.code === c.code && <CheckCircle className="w-5 h-5 text-brand-500 ml-auto" />}
                      </button>
                    ))}
                    {countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-slate-500 text-sm">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-8">
              <button 
                onClick={handleNext} 
                className="w-full bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg active:scale-95"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col h-full space-y-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                <FileTextIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Type</h2>
              <p className="text-slate-500 text-sm">Select the type of document you wish to use for verification.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`relative flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${docType === 'NID' ? 'border-[#7C3AED] bg-indigo-50/40' : 'border-slate-200 bg-white hover:border-brand-200'}`}>
                <input type="radio" name="docType" value="NID" className="sr-only" onChange={(e) => setDocType(e.target.value)} />
                <ShieldCheck className={`w-10 h-10 mb-3 ${docType === 'NID' ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
                <span className={`font-bold text-lg ${docType === 'NID' ? 'text-brand-700' : 'text-slate-700'}`}>National ID</span>
              </label>
              <label className={`relative flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${docType === 'Passport' ? 'border-[#7C3AED] bg-indigo-50/40' : 'border-slate-200 bg-white hover:border-brand-200'}`}>
                <input type="radio" name="docType" value="Passport" className="sr-only" onChange={(e) => setDocType(e.target.value)} />
                <GlobeIcon className={`w-10 h-10 mb-3 ${docType === 'Passport' ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
                <span className={`font-bold text-lg ${docType === 'Passport' ? 'text-brand-700' : 'text-slate-700'}`}>Passport</span>
              </label>
            </div>
            
            <div className="mt-auto pt-8">
              <button 
                onClick={handleNext} 
                disabled={!docType}
                className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg ${docType ? 'bg-[#7C3AED] hover:bg-[#5B21B6] text-white active:scale-95 shadow-md shadow-indigo-650/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <CaptureStep 
            title={`Front of ${docType}`}
            description="Take a clear picture of the front of your document. Ensure all text is legible and edges are visible."
            image={images.front}
            onCapture={(e) => handleCapture('front', e)}
            onNext={handleNext}
            inputRef={frontInputRef}
            captureMode="environment"
          />
        );
      case 5:
        return (
          <CaptureStep 
            title={`Back of ${docType}`}
            description="Now, flip your document over and take a clear picture of the back side."
            image={images.back}
            onCapture={(e) => handleCapture('back', e)}
            onNext={handleNext}
            inputRef={backInputRef}
            captureMode="environment"
          />
        );
      case 6:
        return (
          <CaptureStep 
            title="Selfie Verification"
            description="Please take a clear selfie of your face pointing straight at the camera."
            image={images.selfie}
            onCapture={(e) => handleCapture('selfie', e)}
            onNext={handleNext}
            inputRef={selfieInputRef}
            captureMode="user"
            isSelfie={true}
          />
        );
      case 7:
        return (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6 animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-sm mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Verification Submitted!</h2>
            <p className="text-slate-500 text-base max-w-sm leading-relaxed">
              Your identity verification documents have been successfully uploaded securely. Our team will review them shortly.
            </p>
            <button onClick={onBack} className="w-full max-w-sm mt-8 bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md active:scale-95 text-lg">
              Return to Profile
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-955 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <span className="text-slate-400 font-bold text-sm">Loading verification status...</span>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-955 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <span className="text-slate-400 font-bold text-sm">Uploading verification documents...</span>
      </div>
    );
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-slate-955 flex flex-col relative pb-24 select-none">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-900 shadow-3xs pt-[env(safe-area-inset-top,0px)]">
          <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between relative">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300 active:scale-90 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-black text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Verification</h1>
            <div className="w-10 h-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto w-full px-6 pt-16 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-500 shadow-sm mb-4">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verification Under Review</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed font-bold">
            Your verification request has been successfully submitted and is currently being reviewed by our administration team.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed font-medium">
            This process typically takes 24-48 hours. You will be notified once the review is complete.
          </p>
          <button 
            onClick={onBack} 
            className="w-full max-w-xs mt-8 bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md active:scale-95 text-base"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'approved') {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-slate-955 flex flex-col relative pb-24 select-none">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-900 shadow-3xs pt-[env(safe-area-inset-top,0px)]">
          <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between relative">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300 active:scale-90 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-black text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Verification</h1>
            <div className="w-10 h-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto w-full px-6 pt-16 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-955/40 rounded-full flex items-center justify-center text-green-500 shadow-sm mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Profile Verified!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed font-bold">
            Congratulations! Your account identity has been verified. The verified badge is now displayed next to your profile name.
          </p>
          <button 
            onClick={onBack} 
            className="w-full max-w-xs mt-8 bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md active:scale-95 text-base"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-slate-955 flex flex-col relative pb-24 select-none">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-900 shadow-3xs pt-[env(safe-area-inset-top,0px)]">
          <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between relative">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300 active:scale-90 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-black text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Verification</h1>
            <div className="w-10 h-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto w-full px-6 pt-16 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-955/40 rounded-full flex items-center justify-center text-red-500 shadow-sm mb-4">
            <CheckCircle className="w-12 h-12 rotate-180" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verification Rejected</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed font-bold">
            Unfortunately, your verification request was rejected.
          </p>
          {reviewNote && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-left w-full max-w-sm">
              <span className="text-[10px] font-bold text-red-500 block uppercase tracking-wider mb-1">Reason from Admin</span>
              <p className="text-xs text-red-600 dark:text-red-300 font-semibold">{reviewNote}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 w-full max-w-sm pt-4">
            <button 
              onClick={() => {
                setVerificationStatus('not_submitted');
                setStep(1);
                setImages({ front: null, back: null, selfie: null });
                setFiles({ front: null, back: null, selfie: null });
              }}
              className="w-full bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md active:scale-95 text-base"
            >
              Re-Apply
            </button>
            <button 
              onClick={onBack} 
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold py-3.5 rounded-xl transition-colors active:scale-95 text-base"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-white dark:bg-slate-955 flex flex-col relative pb-24 select-none">
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

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-900 shadow-3xs pt-[env(safe-area-inset-top,0px)]">
          <div className="max-w-2xl md:max-w-3xl lg:max-w-xl xl:max-w-2xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between relative">
            <button 
              onClick={() => {
                if (step === 1) {
                  onBack();
                } else {
                  setStep(prev => prev - 1);
                }
              }} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300 active:scale-90 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-black text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Verification</h1>
            <button 
              onClick={() => alert('Verification Guide: Submit your government-issued ID (NID or Passport) to obtain the Verified User badge. Official Accounts are strictly for brands, public entities, or verified public figures.')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 active:scale-90 transition-transform cursor-pointer"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Only visible when user enters the document verification stages) */}
        {step > 1 && step < 7 && (
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 flex-shrink-0">
            <div 
              className="h-full bg-[#7C3AED] transition-all duration-300"
              style={{ width: `${((step - 1) / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-2xl md:max-w-3xl lg:max-w-xl xl:max-w-2xl mx-auto w-full px-2 sm:px-4 pt-6 flex-1 flex flex-col justify-start">
          {renderStepContent()}
        </div>

        {/* Official Account Support Overlay Dialog Modal */}
        {showOfficialModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              onClick={() => setShowOfficialModal(false)}
              className="absolute inset-0 bg-slate-955/75 backdrop-blur-xs animate-fade-in"
            />
            <div className="relative z-10 w-full max-w-xs bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-scale-up text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-3xs">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Apply for Official Badge</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                To apply for an Official Account badge, please contact our support team or send your company registration documentation and brand details to <span className="text-indigo-600 font-extrabold select-text">support@zenevio.com</span>.
              </p>
              <button 
                onClick={() => setShowOfficialModal(false)}
                className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-black rounded-2xl shadow-md shadow-indigo-650/20 active:scale-95 transition-transform"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

// Reusable Subcomponent for Camera Capture Steps
const CaptureStep = ({ title, description, image, onCapture, onNext, inputRef, captureMode, isSelfie }) => (
  <div className="flex flex-col h-full space-y-6 animate-fade-in-up">
    <div className="text-center mb-2">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 shadow-sm">
        {isSelfie ? <User className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{description}</p>
    </div>

    {/* Camera / Preview Box */}
    <div 
      onClick={() => !image && inputRef.current?.click()}
      className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all ${
        image ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-100 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50'
      }`}
    >
      {image ? (
        <>
          <img src={image} alt="Captured preview" className="w-full h-full object-cover" />
          <button 
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-black/80 transition-colors shadow-lg"
          >
            <Camera className="w-4 h-4" /> Retake Photo
          </button>
        </>
      ) : (
        <>
          <Camera className="w-12 h-12 text-slate-400 mb-4" />
          <span className="font-semibold text-slate-600 text-lg">Tap to Open Camera</span>
        </>
      )}
      
      {/* Hidden Mobile Native Camera Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture={captureMode} 
        ref={inputRef} 
        onChange={onCapture} 
        className="hidden" 
      />
    </div>

    <div className="mt-auto pt-8">
      <button 
        onClick={onNext} 
        disabled={!image}
        className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-sm ${image ? 'bg-[#7C3AED] hover:bg-[#5B21B6] text-white active:scale-95 shadow-indigo-650/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
      >
        Confirm & Continue <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// Simple SVG Icons for generic use
const GlobeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const FileTextIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export default VerificationPage;
