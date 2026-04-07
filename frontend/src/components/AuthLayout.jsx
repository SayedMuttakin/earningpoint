import React from 'react';

const AuthLayout = ({ children, isLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] sm:min-h-[700px] relative">
        
        {/* Left Side: SVG Illustration */}
        <div className="lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-900 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          <div className="z-10 relative">
            <h1 className="text-4xl font-bold mb-4">
              {isLogin ? 'Welcome Back!' : 'Start Your Journey'}
            </h1>
            <p className="text-brand-100 text-lg">
              {isLogin 
                ? 'Sign in to access your dashboard, settings, and more.' 
                : 'Join us today and discover a world of exclusive benefits.'}
            </p>
          </div>
          
          {/* Abstract SVG Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-20">
             <svg width="404" height="404" fill="none" viewBox="0 0 404 404"><defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" fill="currentColor"></rect></pattern></defs><rect width="404" height="404" fill="url(#dots)"></rect></svg>
          </div>
          
          <div className="z-10 relative flex-1 flex items-center justify-center mt-12">
            {/* An animated SVG illustration */}
            <svg 
              className="w-full h-auto max-w-sm animate-fade-in-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3" fill="currentColor" fillOpacity="0.2"/>
            </svg>
          </div>

          <div className="z-10 relative">
            <p className="text-sm text-brand-200">© 2026 Zenvio. All rights reserved.</p>
          </div>

          {/* Decorative Blob */}
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex items-center justify-center relative bg-white">
          <div className="w-full max-w-md">
              <div
                key={isLogin ? 'login' : 'register'}
                className="animate-fade-in-up"
              >
                {children}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
