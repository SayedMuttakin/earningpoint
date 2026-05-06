import React, { useState, useEffect } from 'react';
import PullToRefresh from './PullToRefresh';
import { ArrowLeft, Wallet, CreditCard, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../config';

const CheckoutPage = ({ product, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [refreshing, setRefreshing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/earning/settings`);
        if (!res.ok) return;
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };
  
  // Mock auto-filled user data
  const [formData, setFormData] = useState({
    name: 'Muttakin Rhaman',
    phone: '01XXXXXXXXX',
    address: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedClick = (e) => {
    e.preventDefault();
    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
      setStep(2); // Go to instruction page
    } else {
      submitOrder(); // Direct purchase
    }
  };

  const submitOrder = async (e) => {
    if (e) e.preventDefault();
    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod) && !transactionId) {
      alert('Please enter the Transaction ID to confirm your payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/premium-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: product._id || 'store-item',
          packageName: product.title,
          amount: product.price,
          paymentMethod,
          transactionId,
          country: formData.name,      // Map to schema
          division: formData.phone,    // Map to schema
          district: formData.address   // Map to schema
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment failed');
      onSuccess(paymentMethod);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl text-slate-500 font-medium">No product selected for checkout.</h2>
        <button onClick={onBack} className="mt-4 text-brand-600 font-bold">Go Back to Store</button>
      </div>
    );
  }

  if (step === 2) {
    const adminNumber = paymentMethod === 'bkash' ? settings?.bkashNumber : 
                        paymentMethod === 'nagad' ? settings?.nagadNumber : 
                        settings?.rocketNumber;

    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-medium mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center capitalize">{paymentMethod} Payment</h2>
          <p className="text-slate-600 text-center mb-6">
            Please send exact <b className="text-brand-600">৳{product.price}</b> to the following {paymentMethod} number using <b>Send Money</b>.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center mb-6">
             <span className="text-sm text-slate-500 mb-1">Admin {paymentMethod} Number</span>
             <span className="text-2xl font-bold tracking-wider text-slate-800">{adminNumber || 'Unavailable'}</span>
          </div>

          <form onSubmit={submitOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">Transaction ID</label>
              <input 
                type="text" 
                placeholder="e.g. 9J1A2B3C" 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-center font-mono text-lg font-bold uppercase tracking-widest" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Store
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Order Summary & Info Form */}
        <div className="flex-1 space-y-6">
          
          {/* Product Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{product.title}</h3>
              <p className="text-brand-600 font-black text-xl">৳{product.price}</p>
            </div>
          </div>

          {/* Delivery Information Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserIcon /> Delivery Information
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your registered profile details have been auto-filled.
            </p>
            
            <form id="checkout-form" onSubmit={handleProceedClick} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number (Registered)</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Delivery Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address for physical delivery"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none h-24 font-medium text-slate-900"
                  required
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Payment Methods & Final CTA */}
        <div className="lg:w-[400px]">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-500" /> Payment Options
            </h2>
            
            <div className="space-y-3 mb-8">
              {/* Earning Balance */}
              <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'earning' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-brand-200'}`}>
                <input type="radio" name="payment" value="earning" checked={paymentMethod === 'earning'} onChange={() => setPaymentMethod('earning')} className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'earning' ? 'border-brand-600' : 'border-slate-300'}`}>
                  {paymentMethod === 'earning' && <div className="w-2.5 h-2.5 bg-brand-600 rounded-full" />}
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-slate-900">Earning Balance</span>
                  <span className="block text-xs text-brand-600 font-medium mt-0.5">Use your Zenivio wallet</span>
                </div>
                <Wallet className="w-6 h-6 text-slate-400" />
              </label>

              {/* bKash */}
              <div className={`border rounded-2xl transition-all overflow-hidden ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'bkash' ? 'border-pink-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'bkash' && <div className="w-2.5 h-2.5 bg-pink-600 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-slate-900">bKash</span>
                  </div>
                  <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm py-1 px-2">
                     <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash Logo" className="w-full h-full object-contain" />
                  </div>
                </label>
              </div>

              {/* Nagad */}
              <div className={`border rounded-2xl transition-all overflow-hidden ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'nagad' ? 'border-orange-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'nagad' && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-slate-900">Nagad</span>
                  </div>
                  <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm p-1.5">
                     <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad Logo" className="w-full h-full object-contain scale-150" />
                  </div>
                </label>
              </div>

              {/* Rocket */}
              <div className={`border rounded-2xl transition-all overflow-hidden ${paymentMethod === 'rocket' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="payment" value="rocket" checked={paymentMethod === 'rocket'} onChange={() => setPaymentMethod('rocket')} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'rocket' ? 'border-purple-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'rocket' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-slate-900">Rocket</span>
                  </div>
                  <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm p-1">
                     <img src="https://freelogopng.com/images/all_img/1679747124rocket-logo-png.png" alt="Rocket Logo" className="w-full h-full object-contain scale-125" />
                  </div>
                </label>
              </div>

              {/* Cash on Delivery */}
              <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'cod' ? 'border-brand-600' : 'border-slate-300'}`}>
                  {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-brand-600 rounded-full" />}
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-slate-900">Cash on Delivery</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Pay when you receive it</span>
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : <ShieldCheck className="w-5 h-5" />} {!isSubmitting && (['bkash', 'nagad', 'rocket'].includes(paymentMethod) ? 'Proceed to Pay' : 'Confirm Order')}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
               <ShieldCheck className="w-3.5 h-3.5" /> 100% Secured and Encrypted
            </p>
          </div>
        </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

// Helper User Icon
const UserIcon = () => (
  <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default CheckoutPage;
