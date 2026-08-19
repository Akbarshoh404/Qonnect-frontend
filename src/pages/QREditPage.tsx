import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, RefreshCw, Power, PowerOff, Download, Check, AlertCircle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { QRDisplay } from '../components/qr/QRDisplay';
import { Badge } from '../components/ui/Badge';
import { CopyField } from '../components/ui/CopyButton';
import { FileDropzone } from '../components/ui/FileDropzone';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useQRCode, useUpdateQR, useReplaceFile } from '../hooks/useQRCodes';
import { useDomains } from '../hooks/useDomains';
import { qrService } from '../services/qr';
import { formatFileSize, getFileIcon, formatDate, isValidHttpUrl } from '../utils/helpers';

export function QREditPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qrId = Number(id);

  const { data: qr, isLoading, error } = useQRCode(qrId);
  const { data: domains } = useDomains();
  const updateMutation = useUpdateQR(qrId);
  const replaceMutation = useReplaceFile(qrId);

  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [formInit, setFormInit] = useState(false);

  const [newFile, setNewFile] = useState<File | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceSuccess, setReplaceSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form once QR loads
  if (qr && !formInit) {
    setTitle(qr.title);
    setDestinationUrl(qr.destination_url || '');
    setSelectedDomain(qr.custom_domain ? domains?.find(d => d.domain === qr.custom_domain)?.id ?? null : null);
    setFormInit(true);
  }

  const verifiedDomains = domains?.filter(d => d.verified) || [];

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t('qrEdit.titleRequired');
    if (qr?.type === 'url' && destinationUrl && !isValidHttpUrl(destinationUrl)) {
      newErrors.url = t('qrEdit.urlInvalid');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updateMutation.mutateAsync({
        title,
        ...(qr?.type === 'url' && { destination_url: destinationUrl }),
        custom_domain_id: selectedDomain,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('qrEdit.saveError');
      setErrors({ submit: msg });
    }
  };

  const handleToggleActive = async () => {
    await updateMutation.mutateAsync({ is_active: !qr?.is_active });
  };

  const handleReplaceFile = async () => {
    if (!newFile) return;
    try {
      await replaceMutation.mutateAsync(newFile);
      setNewFile(null);
      setShowReplaceModal(false);
      setReplaceSuccess(true);
      setTimeout(() => setReplaceSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('qrEdit.replaceError');
      setErrors({ replace: msg });
    }
  };

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (error || !qr) return <AppLayout><div className="text-center py-20 text-red-500 dark:text-red-400">{t('qrEdit.notFound')}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{qr.title}</h1>
              <Badge variant={qr.type === 'url' ? 'info' : 'purple'}>{qr.type.toUpperCase()}</Badge>
              {!qr.is_active && <Badge variant="warning">{t('qrCard.disabled')}</Badge>}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('qrEdit.created', { date: formatDate(qr.created_at, i18n.language) })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* QR Preview */}
          <div className="lg:col-span-2 flex flex-col items-center gap-4">
            <QRDisplay url={qr.public_url} size={180} />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={() => qrService.downloadImage(qr.id, 'png', qr.short_code)}
              >
                PNG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={() => qrService.downloadImage(qr.id, 'svg', qr.short_code)}
              >
                SVG
              </Button>
            </div>
            <CopyField value={qr.public_url} label={t('qrEdit.urlLabel')} />
            <div className="text-center text-xs text-slate-400 dark:text-slate-500">
              {t('qrEdit.totalScans', { count: qr.scan_count })}
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-3 space-y-5">
            <AnimatePresence>
              {replaceSuccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400">
                    <Check size={16} />
                    {t('qrEdit.fileReplaced')}
                  </div>
                </motion.div>
              )}
              {saveSuccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400">
                    <Check size={16} />
                    {t('qrEdit.changesSaved')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              id="edit-title"
              label={t('qrEdit.titleLabel')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
            />

            {qr.type === 'url' && (
              <Input
                id="edit-url"
                label={t('qrEdit.destinationUrlLabel')}
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                error={errors.url}
                hint={t('qrEdit.destinationUrlHint')}
              />
            )}

            {qr.type === 'file' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(qr.mime_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{qr.original_filename}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {qr.file_size ? formatFileSize(qr.file_size) : t('qrEdit.unknownSize')} · {qr.mime_type}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  id="replace-file-btn"
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw size={14} />}
                  onClick={() => setShowReplaceModal(true)}
                >
                  {t('qrEdit.replaceFile')}
                </Button>
              </div>
            )}

            {verifiedDomains.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('qrEdit.domainLabel')}</label>
                <select
                  id="edit-domain"
                  value={selectedDomain ?? ''}
                  onChange={(e) => setSelectedDomain(e.target.value ? Number(e.target.value) : null)}
                  className="h-10 px-3 rounded-xl bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">{t('qrEdit.domainDefault')}</option>
                  {verifiedDomains.map((d) => (
                    <option key={d.id} value={d.id}>{d.domain}</option>
                  ))}
                </select>
              </div>
            )}

            {errors.submit && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {errors.submit}
              </p>
            )}

            <div className="flex gap-3 flex-wrap pt-1">
              <Button
                id="save-qr-btn"
                onClick={handleSave}
                loading={updateMutation.isPending}
                leftIcon={<Save size={15} />}
              >
                {t('qrEdit.saveChanges')}
              </Button>
              <Button
                variant="secondary"
                onClick={handleToggleActive}
                leftIcon={qr.is_active ? <PowerOff size={15} /> : <Power size={15} />}
              >
                {qr.is_active ? t('qrEdit.disableQr') : t('qrEdit.enableQr')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(`/qr/${qr.id}/analytics`)}
              >
                {t('qrEdit.analytics')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Replace File Modal */}
      <Modal
        isOpen={showReplaceModal}
        onClose={() => { setShowReplaceModal(false); setNewFile(null); setErrors({}); }}
        title={t('qrEdit.replaceModalTitle')}
        description={t('qrEdit.replaceModalDescription')}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t('qrEdit.replaceWarning', { filename: qr.original_filename })}
            </p>
          </div>

          <FileDropzone
            label={t('qrEdit.newFileLabel')}
            onFileSelect={setNewFile}
            currentFile={newFile}
            hint={t('qrEdit.newFileHint')}
          />

          {errors.replace && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.replace}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowReplaceModal(false)}>
              {t('qrEdit.cancel')}
            </Button>
            <Button
              id="confirm-replace-btn"
              size="sm"
              loading={replaceMutation.isPending}
              disabled={!newFile}
              onClick={handleReplaceFile}
              leftIcon={<RefreshCw size={14} />}
            >
              {t('qrEdit.replaceFile')}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
