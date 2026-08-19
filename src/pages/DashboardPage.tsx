import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, QrCode, FileSpreadsheet, Folder,
  CheckSquare, Square, Power, PowerOff, Trash2, Download,
  Sun, Moon, Monitor, ExternalLink, Sparkles, X, Heart
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { QRCard } from '../components/qr/QRCard';
import { BulkImportModal } from '../components/qr/BulkImportModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useTheme } from '../context/ThemeContext';
import { useQRCodes, useProjectsAndTags, useBulkActions } from '../hooks/useQRCodes';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { qrService } from '../services/qr';
import type { SortOption, FilterType } from '../types';
import { cn } from '../utils/helpers';

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { driveConnected } = useAuth();
  const { theme, setTheme } = useTheme();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  // Bulk Operations State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const { data: projectsData } = useProjectsAndTags();

  const { data, isLoading, error } = useQRCodes({
    search: search || undefined,
    type: filterType === 'all' ? undefined : filterType,
    project: selectedProject === 'all' ? undefined : selectedProject,
    sort,
    page,
  });

  const bulkActionsMutation = useBulkActions();

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (!data?.qr_codes) return;
    if (selectedIds.length === data.qr_codes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.qr_codes.map((q) => q.id));
    }
  };

  const handleBulkAction = (action: 'pause' | 'resume' | 'delete') => {
    if (selectedIds.length === 0) return;
    bulkActionsMutation.mutate(
      { action, ids: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([]);
        },
      }
    );
  };

  const handleBulkZipExport = async () => {
    if (selectedIds.length === 0) return;
    setIsExportingZip(true);
    try {
      await qrService.bulkExportZip({ ids: selectedIds, format: 'png' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'] as const;
    setTheme(order[(order.indexOf(theme as typeof order[number]) + 1) % order.length]);
  };
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('dashboard.title')}
            </h1>

            {/* Quick Dark/Light Theme Changer directly on Dashboard */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/10"
              title="Toggle Theme"
            >
              <ThemeIcon size={16} />
            </button>
          </div>

          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {t('dashboard.total', { count: data?.total ?? 0 })}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkImportOpen(true)}
            leftIcon={<FileSpreadsheet size={15} />}
            className="text-xs font-semibold"
          >
            Bulk CSV
          </Button>

          <Button
            id="create-qr-btn"
            onClick={() => navigate('/create')}
            leftIcon={<Plus size={16} />}
            className="text-xs font-semibold shadow-md shadow-indigo-500/20"
          >
            {t('dashboard.createQr')}
          </Button>
        </div>
      </div>

      {/* Google Drive Warning Banner */}
      <AnimatePresence>
        {!driveConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t('dashboard.driveNotConnected')}
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-0.5">
                  {t('dashboard.driveNotConnectedHint')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = authService.getDriveConnectUrl();
                }}
              >
                {t('dashboard.connectDrive')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project / Folder Navigation Bar */}
      {projectsData?.projects && projectsData.projects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setSelectedProject('all');
              setPage(1);
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              selectedProject === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-900/5 dark:text-slate-400 dark:hover:text-white dark:bg-white/5'
            )}
          >
            <Folder size={12} />
            <span>All Projects</span>
          </button>

          {projectsData.projects.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setSelectedProject(p.name);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                selectedProject === p.name
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-900/5 dark:text-slate-400 dark:hover:text-white dark:bg-white/5'
              )}
            >
              <Folder size={12} />
              <span>{p.name}</span>
              <span className="opacity-60 text-[10px]">({p.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters Strip */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            id="search-qr"
            placeholder={t('dashboard.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftElement={<Search size={15} />}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Type Filter */}
          <div className="control-segmented flex items-center gap-1">
            {(['all', 'url', 'file'] as FilterType[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setFilterType(v);
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  filterType === v
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {v === 'all'
                  ? t('dashboard.allTypes')
                  : v === 'url'
                  ? t('dashboard.typeUrl')
                  : t('dashboard.typeFile')}
              </button>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="control-segmented flex items-center gap-1">
            {(['newest', 'oldest', 'most_scanned'] as SortOption[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setSort(v);
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  sort === v
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {v === 'newest'
                  ? t('dashboard.sortNewest')
                  : v === 'oldest'
                  ? t('dashboard.sortOldest')
                  : t('dashboard.sortMostScanned')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Select Bulk Toolbar Bar */}
      {data?.qr_codes && data.qr_codes.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-1 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={selectAll}
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium"
          >
            {selectedIds.length === data.qr_codes.length ? (
              <CheckSquare size={15} className="text-indigo-600" />
            ) : (
              <Square size={15} />
            )}
            <span>
              {selectedIds.length > 0
                ? `${selectedIds.length} Selected`
                : 'Select All'}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {/* Floating Action Pill for Multi-Select */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-xl flex items-center gap-3 border border-white/10 dark:border-black/10"
          >
            <span className="text-xs font-bold font-mono pl-1">
              {selectedIds.length} Selected
            </span>

            <div className="h-4 w-px bg-white/20 dark:bg-black/20" />

            <button
              onClick={() => handleBulkAction('resume')}
              disabled={bulkActionsMutation.isPending}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 dark:text-emerald-600 hover:opacity-80 cursor-pointer"
              title="Enable Selected"
            >
              <Power size={13} />
              <span>Enable</span>
            </button>

            <button
              onClick={() => handleBulkAction('pause')}
              disabled={bulkActionsMutation.isPending}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 dark:text-amber-600 hover:opacity-80 cursor-pointer"
              title="Pause Selected"
            >
              <PowerOff size={13} />
              <span>Pause</span>
            </button>

            <button
              onClick={handleBulkZipExport}
              disabled={isExportingZip}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-400 dark:text-indigo-600 hover:opacity-80 cursor-pointer"
              title="Download ZIP of selected QRs"
            >
              <Download size={13} />
              <span>Export ZIP</span>
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              disabled={bulkActionsMutation.isPending}
              className="flex items-center gap-1 text-xs font-semibold text-rose-400 dark:text-rose-600 hover:opacity-80 cursor-pointer"
              title="Delete Selected"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 dark:text-red-400 text-sm">
            {t('dashboard.loadError')}
          </p>
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
                  <QRCard
                    qr={qr}
                    showCheckbox={true}
                    selected={selectedIds.includes(qr.id)}
                    onToggleSelect={() => toggleSelectId(qr.id)}
                  />
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
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
              >
                {t('dashboard.next')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* "Made with ❤️ by Akbarshoh" Portfolio Spotlight Footer Card */}
      <div className="mt-16 pt-8 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <span>Qonnect Cloud</span>
          <span>·</span>
          <span>Dynamic QR Engine</span>
        </div>

        <a
          href="https://akbarshoh-dev.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
        >
          <span>Crafted with</span>
          <Heart size={12} className="text-rose-500 fill-rose-500" />
          <span>by</span>
          <span className="font-semibold text-slate-900 dark:text-white group-hover:underline">
            Akbarshoh
          </span>
          <ExternalLink size={11} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Bulk Import CSV Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </AppLayout>
  );
}

function EmptyState({
  search,
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
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
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('dashboard.emptyNoResultsTitle')}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('dashboard.emptyNoResultsBody', { search })}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('dashboard.emptyTitle')}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            {t('dashboard.emptyBody')}
          </p>
          <Button onClick={onCreate} leftIcon={<Plus size={16} />}>
            {t('dashboard.emptyCta')}
          </Button>
        </>
      )}
    </motion.div>
  );
}
