import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Support from './pages/Support';
import Referrals from './pages/Referrals';
import PremiumOrders from './pages/PremiumOrders';
import PremiumIpSettings from './pages/PremiumIpSettings';
import Settings from './pages/Settings';
import Posts from './pages/Posts';
import Articles from './pages/Articles';
import Missions from './pages/Missions';
import Products from './pages/Products';
import Announcements from './pages/Announcements';
import Verifications from './pages/Verifications';
import Badges from './pages/Badges';

import { API_BASE as GlobalApiBase } from '../config';
export const API_BASE = GlobalApiBase;
export const ADMIN_API = `${API_BASE}/api/admin`;

const AdminApp = () => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  if (!adminToken) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const pageProps = { authHeaders, ADMIN_API };

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} ADMIN_API={ADMIN_API} authHeaders={authHeaders}>
      {activePage === 'dashboard' && <Dashboard {...pageProps} />}
      {activePage === 'users' && <Users {...pageProps} />}
      {activePage === 'transactions' && <Transactions {...pageProps} />}
      {activePage === 'support' && <Support {...pageProps} />}
      {activePage === 'referrals' && <Referrals {...pageProps} />}
      {activePage === 'premium' && <PremiumOrders {...pageProps} />}
      {activePage === 'ip-settings' && <PremiumIpSettings {...pageProps} />}
      {activePage === 'posts' && <Posts {...pageProps} />}
      {activePage === 'articles' && <Articles {...pageProps} />}
      {activePage === 'missions' && <Missions {...pageProps} />}
      {activePage === 'products' && <Products {...pageProps} />}
      {activePage === 'announcements' && <Announcements {...pageProps} />}
      {activePage === 'verifications' && <Verifications {...pageProps} />}
      {activePage === 'badges' && <Badges {...pageProps} />}
      {activePage === 'settings' && <Settings {...pageProps} onLogout={handleLogout} />}
    </AdminLayout>
  );
};

export default AdminApp;
