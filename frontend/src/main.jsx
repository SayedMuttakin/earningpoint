import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'

const isAdmin = window.location.pathname.startsWith('/admin');

// StrictMode removed — it double-invokes renders and effects in dev,
// which adds noticeable overhead and masks real performance characteristics.
createRoot(document.getElementById('root')).render(
  isAdmin ? <AdminApp /> : <App />
);
