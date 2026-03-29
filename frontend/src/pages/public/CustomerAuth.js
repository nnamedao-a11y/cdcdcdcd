/**
 * Customer Auth Context and Login Page
 * 
 * Native Google OAuth with original Google popup
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
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

// Google OAuth Client ID - user needs to provide this
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// ============ AUTH CONTEXT ============

const CustomerAuthContext = createContext(null);

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try Google session first (cookie-based)
      const res = await axios.get(`${API_URL}/api/customer-auth/google/me`, {
        withCredentials: true,
      });
      setCustomer(res.data);
    } catch (err) {
      // Try legacy JWT token
      const token = localStorage.getItem('customer_token');
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/api/customer-auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCustomer(res.data);
        } catch {
          localStorage.removeItem('customer_token');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Process Google OAuth credential (from native popup)
  const processGoogleCredential = async (credential) => {
    const res = await axios.post(`${API_URL}/api/customer-auth/google/verify`, 
      { credential },
      { withCredentials: true }
    );
    setCustomer(res.data);
    return res.data;
  };

  // Legacy email/password login
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/customer-auth/login`, {
      email,
      password
    });
    localStorage.setItem('customer_token', res.data.accessToken);
    setCustomer(res.data);
    return res.data;
  };

  // Legacy register
  const register = async (email, password, name) => {
    const res = await axios.post(`${API_URL}/api/customer-auth/register`, {
      email,
      password,
      name,
      customerId: ''
    });
    localStorage.setItem('customer_token', res.data.accessToken);
    setCustomer(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/customer-auth/google/logout`, {}, {
        withCredentials: true
      });
    } catch {}
    localStorage.removeItem('customer_token');
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ 
      customer, 
      loading, 
      login, 
      register, 
      logout, 
      processGoogleCredential,
      checkAuth
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

// ============ PROTECTED ROUTE ============

export const CustomerProtectedRoute = ({ children }) => {
  const { customer, loading } = useCustomerAuth();
  const location = useLocation();

  if (location.state?.user) {
    return children;
  }

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

// ============ AUTH CALLBACK (for legacy Emergent flow - kept for compatibility) ============

export const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login - this is legacy flow
    navigate('/cabinet/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <SpinnerGap size={48} className="animate-spin text-zinc-400" />
    </div>
  );
};

// ============ LOGIN PAGE ============

const LoginPageContent = () => {
  const navigate = useNavigate();
  const { customer, processGoogleCredential } = useCustomerAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const auth = useCustomerAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (customer?.customerId) {
      navigate(`/cabinet/${customer.customerId}`);
    }
  }, [customer, navigate]);

  // Handle Google OAuth success
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const data = await processGoogleCredential(credentialResponse.credential);
      navigate(`/cabinet/${data.customerId}`, { 
        replace: true,
        state: { user: data }
      });
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Помилка авторизації через Google. Спробуйте ще раз.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Не вдалося увійти через Google. Спробуйте інший метод.');
  };

  const handleEmailSubmit = async (e) => {
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

  const hasGoogleClientId = !!GOOGLE_CLIENT_ID;

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
              Особистий кабінет
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              Увійдіть для доступу до замовлень та збережених авто
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <Warning size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Google Loading */}
          {googleLoading && (
            <div className="mb-6 p-4 bg-zinc-50 rounded-lg flex items-center justify-center gap-3">
              <SpinnerGap size={24} className="animate-spin text-zinc-500" />
              <span className="text-zinc-600">Авторизація...</span>
            </div>
          )}

          {/* Native Google Sign-In Button */}
          {hasGoogleClientId ? (
            <div className="flex justify-center mb-6" data-testid="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="352"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>
          ) : (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm text-center">
              <p className="font-medium mb-1">Google Sign-In не налаштовано</p>
              <p className="text-xs">Додайте REACT_APP_GOOGLE_CLIENT_ID в .env</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-zinc-400">або</span>
            </div>
          </div>

          {/* Email Form Toggle */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full text-zinc-500 hover:text-zinc-900 py-2 text-sm transition-colors"
            >
              Увійти через email
            </button>
          ) : (
            <>
              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-5">
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
            </>
          )}

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

// Wrap with GoogleOAuthProvider
export const CustomerLoginPage = () => {
  if (!GOOGLE_CLIENT_ID) {
    // Show page without Google provider if no client ID
    return <LoginPageContent />;
  }
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
};

export default CustomerLoginPage;
