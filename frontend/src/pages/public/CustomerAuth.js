/**
 * Customer Auth Context and Login Page
 * 
 * Client authentication for customer cabinet
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Lock, 
  Envelope, 
  Eye, 
  EyeSlash, 
  ArrowLeft,
  Warning,
  SpinnerGap
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// ============ AUTH CONTEXT ============

const CustomerAuthContext = createContext(null);

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('customer_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomer(res.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/customer-auth/login`, {
      email,
      password
    });
    localStorage.setItem('customer_token', res.data.accessToken);
    setToken(res.data.accessToken);
    setCustomer(res.data);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await axios.post(`${API_URL}/api/customer-auth/register`, {
      email,
      password,
      name,
      customerId: ''
    });
    localStorage.setItem('customer_token', res.data.accessToken);
    setToken(res.data.accessToken);
    setCustomer(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    setToken(null);
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, token, login, register, logout, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

// ============ PROTECTED ROUTE ============

export const CustomerProtectedRoute = ({ children }) => {
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <SpinnerGap size={48} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/cabinet/login" replace />;
  }

  return children;
};

// ============ LOGIN PAGE ============

export const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useCustomerAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (customer?.customerId) {
      navigate(`/cabinet/${customer.customerId}`);
    }
  }, [customer, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await auth.login(email, password);
        navigate(`/cabinet/${data.customerId}`);
      } else {
        const data = await auth.register(email, password, name);
        navigate(`/cabinet/${data.customerId}`);
      }
    } catch (err) {
      const detail = err.response?.data?.message || err.response?.data?.detail || err.message;
      setError(typeof detail === 'string' ? detail : 'Помилка авторизації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4" data-testid="customer-login-page">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <User size={32} weight="bold" className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isLogin ? 'Вхід в кабінет' : 'Реєстрація'}
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              {isLogin 
                ? 'Увійдіть для доступу до вашого кабінету' 
                : 'Створіть акаунт для відстеження замовлень'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <Warning size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Ваше ім'я
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Іван Петренко"
                    className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                    data-testid="register-name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Envelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <SpinnerGap size={20} className="animate-spin" />
                  Завантаження...
                </>
              ) : (
                isLogin ? 'Увійти' : 'Зареєструватись'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-500">
              {isLogin ? 'Немає акаунту?' : 'Вже маєте акаунт?'}
            </span>
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-zinc-900 font-semibold hover:underline"
            >
              {isLogin ? 'Зареєструватись' : 'Увійти'}
            </button>
          </div>

          {/* Back to site */}
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <Link
              to="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Повернутись на сайт
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
