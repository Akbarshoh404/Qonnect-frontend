import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { Spinner } from '../components/ui/Spinner';
import { useQRCode } from '../hooks/useQRCodes';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTheme } from '../context/ThemeContext';
import type { AnalyticsPeriod } from '../types';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl surface"
    >
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export function QRAnalyticsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qrId = Number(id);
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const tooltipStyle = {
    backgroundColor: isDark ? '#1e1e2e' : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
    borderRadius: '12px',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
  };
  const axisTick = { fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 };
  const gridStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';
  const legendStyle = { fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' };

  const PERIODS: { label: string; value: AnalyticsPeriod }[] = [
    { label: t('analytics.period7d'), value: '7d' },
    { label: t('analytics.period30d'), value: '30d' },
    { label: t('analytics.period90d'), value: '90d' },
    { label: t('analytics.period1y'), value: '1y' },
    { label: t('analytics.periodAll'), value: 'all' },
  ];

  const { data: qr } = useQRCode(qrId);
  const { data: analytics, isLoading } = useAnalytics(qrId, period);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/qr/${qrId}/edit`)}
            className="p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{qr?.title || t('analytics.title')}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{qr?.public_url}</p>
          </div>
        </div>

        {/* Period picker */}
        <div className="flex gap-1 p-1 bg-slate-900/[0.03] dark:bg-white/5 rounded-xl border border-slate-900/10 dark:border-white/10 w-fit mb-8 overflow-x-auto">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                period === value
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {period === value && (
                <motion.div layoutId="period-pill" className="absolute inset-0 bg-indigo-600 rounded-lg -z-10" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard label={t('analytics.totalScans')} value={analytics.summary.total_scans} />
              <StatCard label={t('analytics.approxUnique')} value={analytics.summary.unique_approx} sub={t('analytics.approxUniqueHint')} />
              <StatCard label={t('analytics.today')} value={analytics.summary.scans_today} />
              <StatCard label={t('analytics.thisWeek')} value={analytics.summary.scans_week} />
              <StatCard label={t('analytics.thisMonth')} value={analytics.summary.scans_month} />
            </div>

            {/* Scans over time */}
            {analytics.scans_over_time.length > 0 && (
              <div className="p-5 rounded-2xl surface">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm">{t('analytics.scansOverTime')}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analytics.scans_over_time}>
                    <defs>
                      <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#scanGrad)" strokeWidth={2} name={t('analytics.totalScans')} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Device + Browser + OS row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {analytics.by_device.length > 0 && (
                <ChartCard title={t('analytics.devices')} data={analytics.by_device as unknown as ChartDataItem[]} nameKey="device" tooltipStyle={tooltipStyle} legendStyle={legendStyle} />
              )}
              {analytics.by_browser.length > 0 && (
                <ChartCard title={t('analytics.browsers')} data={analytics.by_browser as unknown as ChartDataItem[]} nameKey="browser" tooltipStyle={tooltipStyle} legendStyle={legendStyle} />
              )}
              {analytics.by_os.length > 0 && (
                <ChartCard title={t('analytics.operatingSystems')} data={analytics.by_os as unknown as ChartDataItem[]} nameKey="os" tooltipStyle={tooltipStyle} legendStyle={legendStyle} />
              )}
            </div>

            {/* Country + City */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analytics.by_country.length > 0 && (
                <div className="p-5 rounded-2xl surface">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm">{t('analytics.countries')}</h3>
                  <div className="space-y-2">
                    {analytics.by_country.map((item, i) => (
                      <TopBar key={item.country} label={item.country} count={item.count}
                        total={analytics.summary.total_scans} color={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </div>
                </div>
              )}
              {analytics.by_city.length > 0 && (
                <div className="p-5 rounded-2xl surface">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm">{t('analytics.cities')}</h3>
                  <div className="space-y-2">
                    {analytics.by_city.map((item, i) => (
                      <TopBar key={item.city} label={item.city} count={item.count}
                        total={analytics.summary.total_scans} color={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {analytics.summary.total_scans === 0 && (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <BarChart2 size={32} className="mx-auto mb-3 opacity-30" />
                <p>{t('analytics.noScans')}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}

type ChartDataItem = { count: number; [key: string]: unknown };
function ChartCard({
  title, data, nameKey, tooltipStyle, legendStyle,
}: {
  title: string;
  data: ChartDataItem[];
  nameKey: string;
  tooltipStyle: React.CSSProperties;
  legendStyle: React.CSSProperties;
}) {
  const chartData = data.map((item) => ({ name: item[nameKey] as string, value: item.count }));
  return (
    <div className="p-5 rounded-2xl surface">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
            dataKey="value" nameKey="name">
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={legendStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-900/5 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">{count}</span>
    </div>
  );
}
