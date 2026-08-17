import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, QrCode } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { QRCard } from '../components/qr/QRCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useQRCodes } from '../hooks/useQRCodes';
import { useAuth } from '../hooks/useAuth';
import type { SortOption, FilterType } from '../types';

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { driveConnected } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQRCodes({
    search: search || undefined,
    type: filterType === 'all' ? undefined : filterType,
    sort,
    page,
  });

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {t('dashboard.total', { count: data?.total ?? 0 })}
          </p>
        </div>
        <Button
          id="create-qr-btn"
          onClick={() => navigate('/create')}
          leftIcon={<Plus size={16} />}
        >
          {t('dashboard.createQr')}
        </Button>
      </div>

      {/* Drive warning */}
      <AnimatePresence>
        {!driveConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('dashboard.driveNotConnected')}</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-0.5">{t('dashboard.driveNotConnectedHint')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/api/auth/drive/connect'}
              >
                {t('dashboard.connectDrive')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            id="search-qr"
            placeholder={t('dashboard.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftElement={<Search size={15} />}
          />
        </div>
        <div className="flex gap-2">
          {/* Type filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-900/8 dark:border-white/8">
            {(['all', 'url', 'file'] as FilterType[]).map((v) => (
              <button
                key={v}
                onClick={() => { setFilterType(v); setPage(1); }}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  filterType === v
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {v === 'all' ? t('dashboard.allTypes') : v === 'url' ? t('dashboard.typeUrl') : t('dashboard.typeFile')}
              </button>
            ))}
          </div>

          {/* Sort filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-900/8 dark:border-white/8">
            {(['newest', 'oldest', 'most_scanned'] as SortOption[]).map((v) => (
              <button
                key={v}
                onClick={() => { setSort(v); setPage(1); }}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  sort === v
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {v === 'newest' ? t('dashboard.sortNewest') : v === 'oldest' ? t('dashboard.sortOldest') : t('dashboard.sortMostScanned')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 dark:text-red-400 text-sm">{t('dashboard.loadError')}</p>
        </div>
      ) : data?.qr_codes.length === 0 ? (
        <EmptyState search={search} onCreate={() => navigate('/create')} />
      ) : (
        <>
          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {data?.qr_codes.map((qr, i) => (
                <motion.div
                  key={qr.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.03 }}
                >
                  <QRCard qr={qr} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                {t('dashboard.previous')}
              </Button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t('dashboard.pageOf', { page, pages: data.pages })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === data.pages}
                onClick={() => setPage(p => p + 1)}
              >
                {t('dashboard.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}

function EmptyState({ search, onCreate }: { search: string; onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
        <QrCode size={28} className="text-indigo-500 dark:text-indigo-400" />
      </div>
      {search ? (
        <>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('dashboard.emptyNoResultsTitle')}</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">{t('dashboard.emptyNoResultsBody', { search })}</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('dashboard.emptyTitle')}</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">{t('dashboard.emptyBody')}</p>
          <Button onClick={onCreate} leftIcon={<Plus size={16} />}>
            {t('dashboard.emptyCta')}
          </Button>
        </>
      )}
    </motion.div>
  );
}
