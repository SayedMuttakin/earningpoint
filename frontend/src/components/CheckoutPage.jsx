import React, { useState, useEffect } from 'react';
import PullToRefresh from './PullToRefresh';
import { ArrowLeft, Wallet, CreditCard, ShieldCheck, Zap, Truck } from 'lucide-react';
import { API_BASE } from '../config';

const CheckoutPage = ({ product, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('zinipay');
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleProceedClick = async (e) => {
    if (e) e.preventDefault();
    if (!formData.address.trim()) {
      alert('Please enter your full delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // ⚡ ZiniPay Auto Gateway Flow
      if (paymentMethod === 'zinipay') {
        const response = await fetch(`${API_BASE}/api/payment/zinipay/create`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            packageId: product._id || 'store-item',
            packageName: product.title,
            country: `${formData.name} - ${formData.phone} - ${formData.address}`,
            amount: product.price
          })
        });
        const data = await response.json();
        if (response.ok && data.payment_url) {
          window.location.href = data.payment_url;
          return;
        } else {
          alert(data.message || 'ZiniPay gateway error. Please try again.');
        }
        return;
      }

      // COD or Earning Balance Flow
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
          transactionId: paymentMethod === 'cod' ? 'CASH_ON_DELIVERY' : 'EARNING_BALANCE',
          country: formData.name,
          division: formData.phone,
          district: formData.address
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order placement failed');
      onSuccess(paymentMethod);
    } catch (err) {
      alert(err.message || 'Something went wrong');
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
              <img 
                src={(() => {
                  const img = product.image;
                  if (!img) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
                  if (img.startsWith('http')) return img;
                  const filename = img.split('/').pop();
                  return `${API_BASE}/api/image?file=${encodeURIComponent(filename)}`;
                })()} 
                alt={product.title} 
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3EError%3C/text%3E%3C/svg%3E"}
              />
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
              <CreditCard className="w-5 h-5 text-brand-500" /> Payment Method
            </h2>
            
            <div className="space-y-3 mb-8">
              
              {/* ZiniPay Auto Gateway */}
              <div className={`border rounded-2xl transition-all overflow-hidden ${paymentMethod === 'zinipay' ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-amber-300'}`}>
                <label className="flex items-start p-4 cursor-pointer">
                  <input type="radio" name="payment" value="zinipay" checked={paymentMethod === 'zinipay'} onChange={() => setPaymentMethod('zinipay')} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${paymentMethod === 'zinipay' ? 'border-amber-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'zinipay' && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-extrabold text-slate-900 text-sm">ZiniPay Auto Gateway</span>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-sm">⚡ Instant Auto</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                      Pay via bKash, Nagad, Rocket, or Bank Card with 100% automatic verification.
                    </p>
                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/50">
                      <img src="/logos/bkash.png" alt="bKash" className="h-4 object-contain" />
                      <img src="/logos/nagad.png" alt="Nagad" className="h-4 object-contain" />
                      <img src="/logos/rocket.png" alt="Rocket" className="h-4 object-contain" />
                      <span className="text-[10px] text-amber-700 font-bold uppercase ml-auto">+ Cards</span>
                    </div>
                  </div>
                </label>
              </div>

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
                <Truck className="w-6 h-6 text-slate-400" />
              </label>

            </div>

            <div className="mb-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-3.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-left">
              By confirming, you agree to Zenivio's Return & Refund Policy, Shipping Policy, and consent to provide accurate delivery information.
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting Gateway...
                </span>
              ) : (
                paymentMethod === 'zinipay' ? 'Pay via ZiniPay Auto Gateway ⚡' : 'Confirm Order'
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Secured and Encrypted Payment
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
