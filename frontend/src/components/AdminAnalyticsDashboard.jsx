import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colors = {
    scale: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    keep: 'bg-blue-100 text-blue-700 border-blue-200',
    watch: 'bg-amber-100 text-amber-700 border-amber-200',
    kill: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || colors.watch}`}>
      {status?.toUpperCase()}
    </span>
  );
};

// KPI Card Component
const KPICard = ({ title, value, icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Funnel Component
const FunnelChart = ({ data }) => {
  if (!data?.steps) return null;

  const maxValue = Math.max(...data.steps.map(s => s.value));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
      <div className="space-y-3">
        {data.steps.map((step, idx) => (
          <div key={step.name} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{step.name}</span>
              <span className="text-sm text-gray-500">
                {step.value.toLocaleString()} ({step.rate}%)
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all"
                style={{ width: `${(step.value / maxValue) * 100}%` }}
              />
            </div>
            {idx < data.steps.length - 1 && (
              <div className="text-center text-xs text-gray-400 py-1">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Sources Table Component
const SourcesTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Traffic Sources & ROI</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Source</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Visits</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Leads</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Deals</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Profit</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">CR</th>
            </tr>
          </thead>
          <tbody>
            {data.map((source, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 font-medium">{source.source || 'Direct'}</td>
                <td className="py-3 px-2 text-right">{source.visits?.toLocaleString()}</td>
                <td className="py-3 px-2 text-right">{source.leads}</td>
                <td className="py-3 px-2 text-right">{source.deals}</td>
                <td className="py-3 px-2 text-right">${source.profit?.toLocaleString()}</td>
                <td className={`py-3 px-2 text-right font-semibold ${
                  source.conversion > 5 ? 'text-emerald-600' :
                  source.conversion > 2 ? 'text-blue-600' :
                  source.conversion > 0 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {source.conversion?.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Campaign Optimizer Component
const CampaignOptimizer = ({ data }) => {
  if (!data?.decisions || data.decisions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Campaign Optimizer</h3>
        <p className="text-gray-500">No campaign data available</p>
      </div>
    );
  }

  const { decisions, summary } = data;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Campaign Optimizer</h3>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">
            {summary.scaleCount} Scale
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
            {summary.keepCount} Keep
          </span>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
            {summary.watchCount} Watch
          </span>
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
            {summary.killCount} Kill
          </span>
        </div>
      </div>

      {summary.recommendations?.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-800">Quick Actions:</p>
          <ul className="mt-1 text-sm text-blue-700">
            {summary.recommendations.map((rec, idx) => (
              <li key={idx}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Campaign</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Spend</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Leads</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Deals</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">ROI</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {decisions.slice(0, 10).map((campaign, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div className="font-medium">{campaign.campaign}</div>
                  <div className="text-xs text-gray-500">{campaign.source}</div>
                </td>
                <td className="py-3 px-2 text-right">${campaign.spend?.toLocaleString()}</td>
                <td className="py-3 px-2 text-right">{campaign.leads}</td>
                <td className="py-3 px-2 text-right">{campaign.deals}</td>
                <td className={`py-3 px-2 text-right font-semibold ${
                  campaign.roi > 30 ? 'text-emerald-600' :
                  campaign.roi > 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {campaign.roi?.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-center">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="py-3 px-2">
                  <div className="text-xs text-gray-600 max-w-[200px]">
                    {campaign.actions?.[0]}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fake Traffic Alert Component
const FakeTrafficAlert = ({ data }) => {
  if (!data || data.count === 0) return null;

  return (
    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-red-800">Fake Traffic Detected</p>
          <p className="text-sm text-red-600">
            {data.count} suspicious sessions ({data.percentage}% of traffic)
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
const AdminAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [dashboard, setDashboard] = useState(null);
  const [marketing, setMarketing] = useState(null);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, marketingRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/dashboard?days=${days}`).then(r => r.json()),
        fetch(`${API_URL}/api/marketing/campaigns?days=${days}`).then(r => r.json()),
      ]);

      if (dashboardRes.success) setDashboard(dashboardRes.data);
      if (marketingRes.success) setMarketing(marketingRes.data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpi = dashboard?.kpi || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">Marketing performance & ROI tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Fake Traffic Alert */}
        {dashboard?.fakeTraffic && (
          <FakeTrafficAlert data={dashboard.fakeTraffic} />
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Visits"
            value={kpi.visits?.toLocaleString() || '0'}
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <KPICard
            title="Unique Sessions"
            value={kpi.uniqueSessions?.toLocaleString() || '0'}
            color="purple"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <KPICard
            title="VIN Searches"
            value={kpi.vinSearches?.toLocaleString() || '0'}
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          />
          <KPICard
            title="Leads"
            value={kpi.leads?.toLocaleString() || '0'}
            color="yellow"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <KPICard
            title="Deals"
            value={kpi.deals?.toLocaleString() || '0'}
            color="green"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <KPICard
            title="Conversion"
            value={`${kpi.conversion?.toFixed(2) || '0'}%`}
            color={kpi.conversion > 5 ? 'green' : kpi.conversion > 2 ? 'yellow' : 'red'}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Funnel */}
          <FunnelChart data={dashboard?.funnel} />

          {/* Sources */}
          <SourcesTable data={dashboard?.sources} />
        </div>

        {/* Campaign Optimizer - Full Width */}
        <CampaignOptimizer data={marketing} />

        {/* Timeline Chart */}
        {dashboard?.timeline && dashboard.timeline.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Traffic Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Events"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
