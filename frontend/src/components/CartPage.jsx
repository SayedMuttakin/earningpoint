import React, { useState } from 'react';
import { ShoppingCart, Flame } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const STORE_PRODUCTS = [
  {
    id: 1,
    title: 'Premium VIP Membership',
    price: 1470,
    originalPrice: 1550,
    image: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=500',
    badge: 'Best Selling'
  },
  {
    id: 2,
    title: 'Pro Earning Guide eBook',
    price: 450,
    originalPrice: 500,
    image: 'https://images.unsplash.com/photo-1580893246395-52aead8960dc?auto=format&fit=crop&q=80&w=500',
    badge: 'Best Selling'
  },
  {
    id: 3,
    title: 'Ad-Free Experience 1 Year',
    price: 2200,
    originalPrice: 2500,
    image: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=500',
    badge: 'Offered Items'
  },
  {
    id: 4,
    title: 'Zenvio Exclusive Merch T-Shirt',
    price: 1710,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500',
    badge: 'Best Selling'
  }
];

const CartPage = ({ onBuyNow }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - in a real app, you might fetch updated products
    setTimeout(() => {
      setRefreshing(false);
      // Optionally show a toast or update state
    }, 1000);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 bg-[#F9FAFB] min-h-screen">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Zenvio Store</h1>
          </div>
        <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
          Purchase exclusive memberships, tools, and merchandise directly using your earning balance or cash on delivery.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {STORE_PRODUCTS.map((product, index) => {
          const savings = product.originalPrice ? product.originalPrice - product.price : 0;
          return (
            <div
              key={product.id}
              className="group bg-white rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative border border-slate-100 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Section */}
              <div className="relative h-40 sm:h-52 w-full flex items-center justify-center overflow-hidden border-b border-slate-50">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <div className="absolute top-0 right-0 bg-[#FF3B30] text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm font-sans tracking-wide">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 fill-white flex-shrink-0" /> {product.badge}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex flex-col flex-1 p-4 sm:p-5 pt-3 sm:pt-4">
                <h3 className="text-[15px] sm:text-lg font-semibold text-slate-800 mb-2 leading-tight line-clamp-2">
                  {product.title}
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-1.5">
                    <span className="text-lg sm:text-xl font-bold text-brand-500 tracking-tight">৳{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through mb-[3px]">৳{product.originalPrice}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Save ৳{savings}
                    </span>
                  )}
                </div>
                
                {/* Footer / Action */}
                <div className="mt-auto">
                  <button
                    onClick={() => onBuyNow(product)}
                    className="w-full bg-white border-[1.5px] border-brand-500 hover:bg-brand-50 text-brand-600 font-bold py-2 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[13px] sm:text-sm active:scale-95 shadow-sm hover:shadow"
                  >
                    <ShoppingCart className="w-4 h-4" strokeWidth={2.5} /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </PullToRefresh>
  );
};

export default CartPage;
