import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, CheckCircle, Upload, ArrowRight, ShieldCheck, User, Search, ChevronDown } from 'lucide-react';

const VerificationPage = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState({ code: 'BD', name: 'Bangladesh' });
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [docType, setDocType] = useState(null);

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

  const handleNext = () => setStep(prev => prev + 1);

  const handleCapture = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImages(prev => ({ ...prev, [type]: imageUrl }));
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full space-y-6">
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

              <AnimatePresence>
                {isCountryOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col max-h-80"
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
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-auto pt-8">
              <button 
                onClick={handleNext} 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg active:scale-95"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full space-y-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                <FileTextIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Type</h2>
              <p className="text-slate-500 text-sm">Select the type of document you wish to use for verification.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`relative flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${docType === 'NID' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'}`}>
                <input type="radio" name="docType" value="NID" className="sr-only" onChange={(e) => setDocType(e.target.value)} />
                <ShieldCheck className={`w-10 h-10 mb-3 ${docType === 'NID' ? 'text-brand-600' : 'text-slate-400'}`} />
                <span className={`font-bold text-lg ${docType === 'NID' ? 'text-brand-700' : 'text-slate-700'}`}>National ID</span>
              </label>
              <label className={`relative flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${docType === 'Passport' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'}`}>
                <input type="radio" name="docType" value="Passport" className="sr-only" onChange={(e) => setDocType(e.target.value)} />
                <GlobeIcon className={`w-10 h-10 mb-3 ${docType === 'Passport' ? 'text-brand-600' : 'text-slate-400'}`} />
                <span className={`font-bold text-lg ${docType === 'Passport' ? 'text-brand-700' : 'text-slate-700'}`}>Passport</span>
              </label>
            </div>
            
            <div className="mt-auto pt-8">
              <button 
                onClick={handleNext} 
                disabled={!docType}
                className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg ${docType ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );
      case 3:
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
      case 4:
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
      case 5:
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
      case 6:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-sm mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Verification Submitted!</h2>
            <p className="text-slate-500 text-base max-w-sm leading-relaxed">
              Your identity verification documents have been successfully uploaded securely. Our team will review them shortly.
            </p>
            <button onClick={onBack} className="w-full max-w-sm mt-8 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md active:scale-95 text-lg">
              Return to Profile
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col relative pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center relative">
          <button onClick={onBack} className="absolute left-4 sm:left-6 lg:left-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 mx-auto">Verify Identity</h1>
        </div>
      </div>

      {/* Progress Bar */}
      {step < 6 && (
        <div className="w-full bg-slate-200 h-1.5">
          <motion.div 
            className="h-full bg-brand-500"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 py-8 sm:py-12 flex-1 flex justify-center">
        <div className="w-full max-w-xl flex flex-col h-full">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Reusable Subcomponent for Camera Capture Steps
const CaptureStep = ({ title, description, image, onCapture, onNext, inputRef, captureMode, isSelfie }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full space-y-6">
    <div className="text-center mb-2">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 shadow-sm">
        {isSelfie ? <User className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">{description}</p>
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
        className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-sm ${image ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95 shadow-brand-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
      >
        Confirm & Continue <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
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
