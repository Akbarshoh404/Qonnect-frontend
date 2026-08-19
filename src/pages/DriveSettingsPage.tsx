import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HardDrive, CheckCircle, XCircle, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { useDriveStatus } from '../hooks/useDomains';
import { authService } from '../services/auth';
import { cn } from '../utils/helpers';

export function DriveSettingsPage() {
  const { t } = useTranslation();
  const { data: driveStatus, isLoading, refetch } = useDriveStatus();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = () => {
    window.location.href = authService.getDriveConnectUrl();
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch('/api/drive/disconnect', { method: 'POST', credentials: 'include' });
      await refetch();
    } finally {
      setDisconnecting(false);
      setShowDisconnectModal(false);
    }
  };

  const accessPoints = [
    { title: t('driveSettings.scopeTitle'), desc: t('driveSettings.scopeDesc') },
    { title: t('driveSettings.folderTitle'), desc: t('driveSettings.folderDesc') },
    { title: t('driveSettings.controlTitle'), desc: t('driveSettings.controlDesc') },
  ];

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{t('driveSettings.title')}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('driveSettings.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="space-y-5">
            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-5 rounded-2xl border flex items-center gap-4',
                driveStatus?.connected
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'surface'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                driveStatus?.connected ? 'bg-emerald-500/20' : 'bg-slate-900/5 dark:bg-white/5'
              )}>
                <HardDrive size={22} className={driveStatus?.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{t('driveSettings.title')}</p>
                  {driveStatus?.connected
                    ? <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle size={12} /> {t('driveSettings.connected')}</span>
                    : <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"><XCircle size={12} /> {t('driveSettings.notConnected')}</span>}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {driveStatus?.connected ? t('driveSettings.connectedHint') : t('driveSettings.notConnectedHint')}
                </p>
              </div>
              {driveStatus?.connected ? (
                <Button variant="secondary" size="sm" onClick={() => setShowDisconnectModal(true)}>
                  {t('driveSettings.disconnect')}
                </Button>
              ) : (
                <Button leftIcon={<RefreshCw size={14} />} size="sm" onClick={handleConnect}>
                  {t('driveSettings.connect')}
                </Button>
              )}
            </motion.div>

            {/* Privacy info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="p-5 rounded-2xl surface space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{t('driveSettings.accessTitle')}</h3>
              </div>

              <div className="space-y-3">
                {accessPoints.map(({ title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <CheckCircle size={14} className="text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.06]">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t('driveSettings.disconnectWarning')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title={t('driveSettings.disconnect')}
        description={t('driveSettings.disconnectConfirm')}
        size="sm"
      >
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setShowDisconnectModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" size="sm" loading={disconnecting} onClick={handleDisconnect}>
            {t('driveSettings.disconnect')}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
