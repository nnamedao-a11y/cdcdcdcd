import React, { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../App';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  House,
  FileText,
  Car,
  Wallet,
  ClockCounterClockwise,
  User,
  CaretRight,
  Check,
  Clock,
  Truck,
  ShoppingCart,
  ChatCircle,
  ArrowRight,
  Warning,
  Bell
} from '@phosphor-icons/react';

/**
 * Customer Cabinet - Client Process Center
 * 
 * Повний огляд процесу для клієнта
 */

// Sidebar Navigation
const NAV_ITEMS = [
  { path: '', label: 'Dashboard', icon: House },
  { path: 'notifications', label: 'Сповіщення', icon: Bell },
  { path: 'requests', label: 'Мої заявки', icon: FileText },
  { path: 'orders', label: 'Мої замовлення', icon: Car },
  { path: 'deposits', label: 'Депозити', icon: Wallet },
  { path: 'timeline', label: 'Історія', icon: ClockCounterClockwise },
  { path: 'profile', label: 'Профіль', icon: User },
];

// Layout Component
export const CabinetLayout = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const basePath = `/cabinet/${customerId}`;

  const isActive = (path) => {
    const fullPath = path ? `${basePath}/${path}` : basePath;
    return location.pathname === fullPath || (path && location.pathname.startsWith(`${basePath}/${path}`));
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white border border-[#E4E4E7] rounded-2xl p-5 h-fit sticky top-8">
          <div className="mb-6 pb-4 border-b border-[#E4E4E7]">
            <h2 className="text-lg font-semibold text-[#18181B]">Мій кабінет</h2>
            <p className="text-sm text-[#71717A] mt-1">Client Process Center</p>
          </div>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path ? `${basePath}/${item.path}` : basePath}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-[#18181B] text-white'
                      : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                  }`}
                  data-testid={`nav-${item.path || 'dashboard'}`}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Dashboard Page
export const CabinetDashboard = () => {
  const { customerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [customerId]);

  const loadDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/dashboard`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  const { customer, summary, activeDeals, pendingDeposits, latestTimeline, nextAction, manager } = data;

  return (
    <div className="space-y-6" data-testid="cabinet-dashboard">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#E4E4E7] rounded-2xl p-6"
      >
        <h1 className="text-2xl font-bold text-[#18181B]">
          Вітаємо, {customer.firstName || customer.name}!
        </h1>
        <p className="text-[#71717A] mt-2">
          Тут ви можете відстежувати статус ваших замовлень та депозитів
        </p>
      </motion.div>

      {/* Next Action Alert */}
      {nextAction && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-5 flex items-start gap-4 ${
            nextAction.urgency === 'high' 
              ? 'bg-[#FEF2F2] border border-[#FECACA]' 
              : 'bg-[#F0FDF4] border border-[#BBF7D0]'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            nextAction.urgency === 'high' ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
          }`}>
            <Warning size={20} weight="fill" className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#18181B]">{nextAction.title}</h3>
            <p className="text-sm text-[#71717A] mt-1">{nextAction.description}</p>
          </div>
          {nextAction.dealId && (
            <Link 
              to={`/cabinet/${customerId}/orders/${nextAction.dealId}`}
              className="bg-[#18181B] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#27272A] transition-colors"
            >
              Переглянути
            </Link>
          )}
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <SummaryCard label="Активні заявки" value={summary.activeLeads} icon={FileText} />
        <SummaryCard label="Активні замовлення" value={summary.activeDeals} icon={Car} />
        <SummaryCard label="Очікуючі депозити" value={summary.pendingDeposits} icon={Wallet} highlight />
        <SummaryCard label="Завершені угоди" value={summary.completedDeals} icon={Check} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-[#E4E4E7] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#18181B]">Активні замовлення</h2>
            <Link to={`/cabinet/${customerId}/orders`} className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1">
              Всі <CaretRight size={14} />
            </Link>
          </div>
          
          {activeDeals.length > 0 ? (
            <div className="space-y-3">
              {activeDeals.slice(0, 3).map((deal) => (
                <OrderCard key={deal.id} deal={deal} customerId={customerId} />
              ))}
            </div>
          ) : (
            <EmptyState message="Немає активних замовлень" />
          )}
        </motion.section>

        {/* Recent Timeline */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-[#E4E4E7] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#18181B]">Останні події</h2>
            <Link to={`/cabinet/${customerId}/timeline`} className="text-sm text-[#4F46E5] hover:underline flex items-center gap-1">
              Всі <CaretRight size={14} />
            </Link>
          </div>
          
          {latestTimeline.length > 0 ? (
            <div className="space-y-3">
              {latestTimeline.slice(0, 5).map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState message="Немає подій" />
          )}
        </motion.section>
      </div>

      {/* Manager Contact */}
      {manager && (
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#18181B] to-[#27272A] text-white rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Ваш менеджер</p>
              <h3 className="font-semibold text-lg">{manager.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">{manager.phone}</p>
              <p className="text-white/60 text-sm">{manager.email}</p>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

// Orders Page
export const CabinetOrders = () => {
  const { customerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [customerId]);

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/orders`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  return (
    <div className="space-y-6" data-testid="cabinet-orders">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#18181B]">Мої замовлення</h1>
        <p className="text-[#71717A] mt-1">Всього: {data.meta.total} замовлень</p>
      </div>

      {data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((deal) => (
            <OrderCardFull key={deal.id} deal={deal} customerId={customerId} />
          ))}
        </div>
      ) : (
        <EmptyState message="Немає замовлень" />
      )}
    </div>
  );
};

// Order Details Page
export const CabinetOrderDetails = () => {
  const { customerId, dealId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [customerId, dealId]);

  const loadOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/orders/${dealId}`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  const { deal, processState, whatsNext, deposits, depositSummary, timeline, manager } = data;

  return (
    <div className="space-y-6" data-testid="cabinet-order-details">
      {/* Header */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <Link to={`/cabinet/${customerId}/orders`} className="text-sm text-[#71717A] hover:text-[#18181B] mb-2 inline-block">
          ← Назад до замовлень
        </Link>
        <h1 className="text-2xl font-bold text-[#18181B] mt-2">
          {deal.title || deal.vehicleTitle || `VIN: ${deal.vin}`}
        </h1>
        <p className="text-[#71717A] mt-1">VIN: {deal.vin}</p>
      </div>

      {/* Process Stepper */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#18181B] mb-6">Статус процесу</h2>
        <ProcessStepper steps={processState} />
      </div>

      {/* What's Next */}
      {whatsNext && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-6">
          <h3 className="font-semibold text-[#18181B] text-lg">{whatsNext.title}</h3>
          <p className="text-[#71717A] mt-2">{whatsNext.description}</p>
          {whatsNext.steps && whatsNext.steps.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {whatsNext.steps.map((step, idx) => (
                <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-[#18181B] border border-[#E4E4E7]">
                  {idx + 1}. {step}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Info */}
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#18181B] mb-4">Деталі замовлення</h2>
          <div className="space-y-3">
            <InfoRow label="Статус" value={deal.status} />
            <InfoRow label="Ціна" value={`$${(deal.clientPrice || 0).toLocaleString()}`} />
            <InfoRow label="Дата створення" value={new Date(deal.createdAt).toLocaleDateString('uk-UA')} />
            {deal.auctionSource && <InfoRow label="Джерело" value={deal.auctionSource} />}
          </div>
        </div>

        {/* Deposits */}
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#18181B] mb-4">Депозити</h2>
          <div className="space-y-3 mb-4">
            <InfoRow label="Всього" value={depositSummary.total} />
            <InfoRow label="Сума" value={`$${depositSummary.totalAmount.toLocaleString()}`} />
            <InfoRow label="Підтверджено" value={`${depositSummary.confirmed} ($${depositSummary.confirmedAmount.toLocaleString()})`} />
          </div>
          {deposits.length > 0 && (
            <div className="border-t border-[#E4E4E7] pt-4 space-y-2">
              {deposits.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#71717A]">{new Date(dep.createdAt).toLocaleDateString('uk-UA')}</span>
                  <span className="font-medium">${(dep.amount || 0).toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    dep.status === 'confirmed' || dep.status === 'completed'
                      ? 'bg-[#D1FAE5] text-[#059669]'
                      : 'bg-[#FEF3C7] text-[#D97706]'
                  }`}>
                    {dep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#18181B] mb-4">Історія</h2>
        {timeline.length > 0 ? (
          <div className="space-y-3">
            {timeline.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState message="Немає подій" />
        )}
      </div>
    </div>
  );
};

// Requests Page
export const CabinetRequests = () => {
  const { customerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [customerId]);

  const loadRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/requests`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  return (
    <div className="space-y-6" data-testid="cabinet-requests">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#18181B]">Мої заявки</h1>
        <p className="text-[#71717A] mt-1">Всього: {data.meta.total} заявок</p>
      </div>

      {data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((lead) => (
            <div key={lead.id} className="bg-white border border-[#E4E4E7] rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#18181B]">{lead.firstName} {lead.lastName}</h3>
                  <p className="text-sm text-[#71717A] mt-1">VIN: {lead.vin || '—'}</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    {new Date(lead.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lead.status === 'converted' ? 'bg-[#D1FAE5] text-[#059669]' :
                  lead.status === 'new' ? 'bg-[#DBEAFE] text-[#2563EB]' :
                  'bg-[#F4F4F5] text-[#71717A]'
                }`}>
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Немає заявок" />
      )}
    </div>
  );
};

// Deposits Page
export const CabinetDeposits = () => {
  const { customerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, [customerId]);

  const loadDeposits = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/deposits`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  return (
    <div className="space-y-6" data-testid="cabinet-deposits">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#18181B]">Депозити та платежі</h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-[#F4F4F5] rounded-xl p-4">
            <p className="text-sm text-[#71717A]">Всього</p>
            <p className="text-xl font-bold text-[#18181B]">${data.summary.totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-[#D1FAE5] rounded-xl p-4">
            <p className="text-sm text-[#059669]">Підтверджено</p>
            <p className="text-xl font-bold text-[#059669]">{data.summary.confirmed}</p>
          </div>
          <div className="bg-[#FEF3C7] rounded-xl p-4">
            <p className="text-sm text-[#D97706]">Очікують</p>
            <p className="text-xl font-bold text-[#D97706]">{data.summary.pending}</p>
          </div>
        </div>
      </div>

      {data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((deposit) => (
            <div key={deposit.id} className="bg-white border border-[#E4E4E7] rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#18181B] text-lg">
                    ${(deposit.amount || 0).toLocaleString()}
                  </h3>
                  {deposit.dealInfo && (
                    <p className="text-sm text-[#71717A] mt-1">
                      VIN: {deposit.dealInfo.vin || '—'}
                    </p>
                  )}
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    {new Date(deposit.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  deposit.status === 'confirmed' || deposit.status === 'completed'
                    ? 'bg-[#D1FAE5] text-[#059669]'
                    : 'bg-[#FEF3C7] text-[#D97706]'
                }`}>
                  {deposit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Немає депозитів" />
      )}
    </div>
  );
};

// Timeline Page
export const CabinetTimeline = () => {
  const { customerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [customerId]);

  const loadTimeline = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/timeline`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  return (
    <div className="space-y-6" data-testid="cabinet-timeline">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#18181B]">Історія подій</h1>
        <p className="text-[#71717A] mt-1">Всього: {data.meta.total} подій</p>
      </div>

      {data.data.length > 0 ? (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
          <div className="space-y-4">
            {data.data.map((event) => (
              <TimelineItem key={event.id} event={event} expanded />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState message="Немає подій" />
      )}
    </div>
  );
};

// Notifications Page
export const CabinetNotifications = () => {
  const { customerId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [customerId, filter]);

  const loadNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unread', 'true');
      params.append('limit', '50');
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/notifications?${params.toString()}`);
      setNotifications(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/customer-cabinet/${customerId}/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Помилка');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'auction_soon': return <Clock size={20} weight="fill" className="text-amber-500" />;
      case 'price_drop': return <Wallet size={20} weight="fill" className="text-green-500" />;
      case 'deal_status_changed': return <Car size={20} weight="fill" className="text-blue-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6" data-testid="cabinet-notifications">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#18181B] flex items-center gap-3">
              <Bell size={28} />
              Сповіщення
            </h1>
            <p className="text-[#71717A] mt-1">
              Сповіщення про аукціони, ціни та замовлення
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'all' ? 'bg-[#18181B] text-white' : 'bg-[#F4F4F5] text-[#71717A]'}`}
            >
              Всі
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'unread' ? 'bg-[#18181B] text-white' : 'bg-[#F4F4F5] text-[#71717A]'}`}
            >
              Непрочитані
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Banner */}
      <div className="bg-gradient-to-r from-[#0088cc] to-[#229ED9] text-white rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Отримуйте сповіщення в Telegram</h3>
            <p className="text-white/80 text-sm">Миттєві сповіщення про аукціони та зниження цін</p>
          </div>
          <a href="https://t.me/BIBICarsBot" target="_blank" rel="noopener noreferrer" className="bg-white text-[#0088cc] px-5 py-2 rounded-xl font-medium hover:bg-white/90">
            Підключити
          </a>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border rounded-2xl p-5 ${notification.isRead ? 'border-[#E4E4E7]' : 'border-[#4F46E5] bg-[#F5F3FF]'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-xl flex items-center justify-center">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${notification.isRead ? 'text-[#71717A]' : 'text-[#18181B]'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-[#71717A] mt-1">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <button onClick={() => markAsRead(notification.id)} className="text-[#71717A] hover:text-[#18181B] p-1">
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-2">
                    {new Date(notification.createdAt).toLocaleString('uk-UA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Немає сповіщень" />
      )}
    </div>
  );
};

// Profile Page
export const CabinetProfile = () => {
  const { customerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [customerId]);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer-cabinet/${customerId}/profile`);
      setData(res.data);
    } catch (error) {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  const { customer, stats, manager } = data;

  return (
    <div className="space-y-6" data-testid="cabinet-profile">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#18181B] text-white rounded-2xl flex items-center justify-center text-xl font-bold">
            {(customer.firstName?.[0] || customer.name?.[0] || 'C').toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#18181B]">
              {customer.firstName} {customer.lastName || customer.name}
            </h1>
            <p className="text-[#71717A]">{customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#18181B] mb-4">Контактна інформація</h2>
          <div className="space-y-3">
            <InfoRow label="Email" value={customer.email || '—'} />
            <InfoRow label="Телефон" value={customer.phone || '—'} />
            <InfoRow label="Компанія" value={customer.company || '—'} />
            <InfoRow label="Місто" value={customer.city || '—'} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#18181B] mb-4">Статистика</h2>
          <div className="space-y-3">
            <InfoRow label="Заявок" value={stats.totalLeads} />
            <InfoRow label="Замовлень" value={stats.totalDeals} />
            <InfoRow label="Депозитів" value={stats.totalDeposits} />
            <InfoRow label="Завершено" value={stats.completedDeals} />
            <InfoRow label="Клієнт з" value={new Date(stats.memberSince).toLocaleDateString('uk-UA')} />
          </div>
        </div>
      </div>

      {/* Manager */}
      {manager && (
        <div className="bg-gradient-to-r from-[#18181B] to-[#27272A] text-white rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Ваш менеджер</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-semibold">{manager.name}</h3>
              <p className="text-white/60 text-sm">{manager.phone}</p>
              <p className="text-white/60 text-sm">{manager.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ COMPONENTS ============

const ProcessStepper = ({ steps }) => (
  <div className="flex items-center justify-between overflow-x-auto pb-2">
    {steps.map((step, idx) => (
      <div key={step.code} className="flex items-center">
        <div className={`flex flex-col items-center min-w-[80px]`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            step.completed ? 'bg-[#16A34A] text-white' :
            step.current ? 'bg-[#18181B] text-white ring-4 ring-[#18181B]/20' :
            'bg-[#F4F4F5] text-[#A1A1AA]'
          }`}>
            {step.completed ? <Check size={20} /> : idx + 1}
          </div>
          <span className={`text-xs mt-2 text-center ${
            step.current ? 'text-[#18181B] font-semibold' : 'text-[#71717A]'
          }`}>
            {step.label}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`w-8 h-0.5 mx-1 ${
            step.completed ? 'bg-[#16A34A]' : 'bg-[#E4E4E7]'
          }`} />
        )}
      </div>
    ))}
  </div>
);

const SummaryCard = ({ label, value, icon: Icon, highlight }) => (
  <div className={`rounded-2xl p-5 ${
    highlight ? 'bg-[#FEF3C7] border border-[#FCD34D]' : 'bg-white border border-[#E4E4E7]'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        highlight ? 'bg-[#F59E0B]' : 'bg-[#F4F4F5]'
      }`}>
        <Icon size={20} className={highlight ? 'text-white' : 'text-[#71717A]'} />
      </div>
      <div>
        <p className="text-sm text-[#71717A]">{label}</p>
        <p className="text-2xl font-bold text-[#18181B]">{value}</p>
      </div>
    </div>
  </div>
);

const OrderCard = ({ deal, customerId }) => (
  <Link 
    to={`/cabinet/${customerId}/orders/${deal.id}`}
    className="block border border-[#E4E4E7] rounded-xl p-4 hover:border-[#18181B] transition-colors"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-[#18181B]">{deal.title || deal.vehicleTitle || deal.vin}</h3>
        <p className="text-sm text-[#71717A]">VIN: {deal.vin || '—'}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[#18181B]">${(deal.clientPrice || 0).toLocaleString()}</p>
        <span className="text-xs px-2 py-0.5 rounded bg-[#F4F4F5] text-[#71717A]">
          {deal.status}
        </span>
      </div>
    </div>
  </Link>
);

const OrderCardFull = ({ deal, customerId }) => (
  <Link 
    to={`/cabinet/${customerId}/orders/${deal.id}`}
    className="block bg-white border border-[#E4E4E7] rounded-2xl p-5 hover:border-[#18181B] transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-lg text-[#18181B]">{deal.title || deal.vehicleTitle || deal.vin}</h3>
        <p className="text-sm text-[#71717A] mt-1">VIN: {deal.vin || '—'}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-xl text-[#18181B]">${(deal.clientPrice || 0).toLocaleString()}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          deal.status === 'completed' ? 'bg-[#D1FAE5] text-[#059669]' :
          deal.status === 'in_delivery' ? 'bg-[#DBEAFE] text-[#2563EB]' :
          'bg-[#F4F4F5] text-[#71717A]'
        }`}>
          {deal.status}
        </span>
      </div>
    </div>
    
    {/* Mini Process Stepper */}
    <div className="flex items-center gap-1 mt-3">
      {deal.processState?.slice(0, 4).map((step, idx) => (
        <div key={step.code} className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${
            step.completed ? 'bg-[#16A34A]' :
            step.current ? 'bg-[#18181B]' :
            'bg-[#E4E4E7]'
          }`} />
          {idx < 3 && <div className={`w-4 h-0.5 ${step.completed ? 'bg-[#16A34A]' : 'bg-[#E4E4E7]'}`} />}
        </div>
      ))}
    </div>
  </Link>
);

const TimelineItem = ({ event, expanded }) => {
  const getIcon = () => {
    switch (event.type) {
      case 'lead_created': return FileText;
      case 'deal_created': return Car;
      case 'deposit_created': return Wallet;
      case 'deposit_confirmed': return Check;
      case 'deal_status_changed': return Clock;
      default: return ClockCounterClockwise;
    }
  };
  
  const Icon = getIcon();

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-[#F4F4F5] rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[#71717A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#18181B] text-sm">{event.title || event.type}</p>
        {event.description && (
          <p className="text-xs text-[#71717A] mt-0.5 truncate">{event.description}</p>
        )}
        <p className="text-xs text-[#A1A1AA] mt-1">
          {new Date(event.createdAt).toLocaleString('uk-UA')}
        </p>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#F4F4F5] last:border-0">
    <span className="text-sm text-[#71717A]">{label}</span>
    <span className="font-medium text-[#18181B]">{value}</span>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorState = () => (
  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6 text-center">
    <p className="text-[#DC2626]">Помилка завантаження даних</p>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8 text-[#71717A]">
    {message}
  </div>
);

export default CabinetDashboard;
