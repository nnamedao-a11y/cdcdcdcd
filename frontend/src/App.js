/**
 * BIBI Cars - Main Application
 * 
 * Структура:
 * / - Публічний сайт (каталог, VIN перевірка)
 * /admin - CRM панель (з авторизацією)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'sonner';

// Public pages
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import VehiclesPage from './pages/public/VehiclesPage';
import VinCheckPage from './pages/public/VinCheckPage';
import VehicleDetailPage from './pages/public/VehicleDetailPage';
import CalculatorPage from './pages/public/CalculatorPage';
import CustomerLoginPage, { CustomerAuthProvider, CustomerProtectedRoute } from './pages/public/CustomerAuth';
import { CollectionsPage, CollectionDetailPage } from './pages/public/CollectionsPage';

// Admin pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Deposits from './pages/Deposits';
import Tasks from './pages/Tasks';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import Documents from './pages/Documents';
import ProxySettings from './pages/ProxySettings';
import ParserControl from './pages/ParserControl';
import ProxyManager from './pages/ProxyManager';
import ParserLogs from './pages/ParserLogs';
import ParserSettings from './pages/ParserSettings';
import Vehicles from './pages/Vehicles';
import VinSearch from './pages/VinSearch';
import CalculatorAdmin from './pages/CalculatorAdmin';
import QuoteAnalytics from './pages/QuoteAnalytics';
import Customer360 from './pages/Customer360';
import AdminAnalyticsDashboard from './components/AdminAnalyticsDashboard';
import MarketingControlPanel from './components/MarketingControlPanel';
import {
  CabinetLayout,
  CabinetDashboard,
  CabinetOrders,
  CabinetOrderDetails,
  CabinetRequests,
  CabinetDeposits,
  CabinetTimeline,
  CabinetProfile,
  CabinetNotifications
} from './pages/CustomerCabinet';
import Layout from './components/Layout';

// Analytics
import { initAnalytics } from './utils/analytics';

import './App.css';

// Initialize analytics tracking
if (typeof window !== 'undefined') {
  initAnalytics();
}

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Setup axios interceptor for auth errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only logout on explicit 401 from auth endpoints
        if (error.response?.status === 401 && error.config?.url?.includes('/api/auth/me')) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      setUser(res.data);
    } catch (err) {
      // Only logout if it's an auth error
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const { access_token, user } = res.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F7F7F8]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#0A0A0B] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-[#71717A]">Завантаження...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            {/* ====== PUBLIC SITE ====== */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="cars" element={<VehiclesPage />} />
              <Route path="vehicle/:id" element={<VehicleDetailPage />} />
              <Route path="cars/:slug" element={<VehicleDetailPage />} />
              <Route path="vin-check" element={<VinCheckPage />} />
              <Route path="vin-check/:vin" element={<VinCheckPage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="collections/:slug" element={<CollectionDetailPage />} />
            </Route>

            {/* ====== CUSTOMER AUTH ====== */}
            <Route path="/cabinet/login" element={<CustomerLoginPage />} />
            <Route path="/cabinet" element={<Navigate to="/cabinet/login" replace />} />

            {/* ====== ADMIN CRM ====== */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id/360" element={<Customer360 />} />
              <Route path="deals" element={<Deals />} />
              <Route path="deposits" element={<Deposits />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="staff" element={<Staff />} />
              <Route path="documents" element={<Documents />} />
              <Route path="settings" element={<Settings />} />
              <Route path="proxy-settings" element={<ProxySettings />} />
              <Route path="parser" element={<ParserControl />} />
              <Route path="parser/proxies" element={<ProxyManager />} />
              <Route path="parser/logs" element={<ParserLogs />} />
              <Route path="parser/settings" element={<ParserSettings />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vin" element={<VinSearch />} />
              <Route path="calculator" element={<CalculatorAdmin />} />
              <Route path="analytics/quotes" element={<QuoteAnalytics />} />
              <Route path="analytics" element={<AdminAnalyticsDashboard />} />
              <Route path="marketing" element={<MarketingControlPanel />} />
            </Route>

            {/* ====== CUSTOMER CABINET (CLIENT PORTAL) ====== */}
            <Route path="/cabinet/:customerId" element={<CabinetLayout />}>
              <Route index element={<CabinetDashboard />} />
              <Route path="notifications" element={<CabinetNotifications />} />
              <Route path="requests" element={<CabinetRequests />} />
              <Route path="orders" element={<CabinetOrders />} />
              <Route path="orders/:dealId" element={<CabinetOrderDetails />} />
              <Route path="deposits" element={<CabinetDeposits />} />
              <Route path="timeline" element={<CabinetTimeline />} />
              <Route path="profile" element={<CabinetProfile />} />
            </Route>

            {/* Legacy redirect: /login -> /admin/login */}
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
export { API_URL };
