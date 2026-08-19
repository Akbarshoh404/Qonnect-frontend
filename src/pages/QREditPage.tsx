import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, RefreshCw, Power, PowerOff, Download, Check,
  AlertCircle, Palette, Link2, Folder, ShieldAlert, Sparkles
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { QRDisplay } from '../components/qr/QRDisplay';
import { QRDesignStudio } from '../components/qr/QRDesignStudio';
import { Badge } from '../components/ui/Badge';
import { CopyField } from '../components/ui/CopyButton';
import { FileDropzone } from '../components/ui/FileDropzone';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useQRCode, useUpdateQR, useReplaceFile, useProjectsAndTags } from '../hooks/useQRCodes';
import { useDomains } from '../hooks/useDomains';
import { qrService } from '../services/qr';
import type { QRStyleConfig, InactivePageConfig } from '../types';
import { formatFileSize, getFileIcon, formatDate, isValidHttpUrl, cn } from '../utils/helpers';

export function QREditPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qrId = Number(id);

  const { data: qr, isLoading, error } = useQRCode(qrId);
  const { data: domains } = useDomains();
  const { data: projectsData } = useProjectsAndTags();

  const updateMutation = useUpdateQR(qrId);
  const replaceMutation = useReplaceFile(qrId);

  const [activeTab, setActiveTab] = useState<'details' | 'design' | 'inactive'>('details');

  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);

  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>({});
  const [inactiveConfig, setInactiveConfig] = useState<InactivePageConfig>({});

  const [formInit, setFormInit] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceSuccess, setReplaceSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form once QR loads
  useEffect(() => {
    if (qr && !formInit) {
      setTitle(qr.title);
      setDestinationUrl(qr.destination_url || '');
      setProjectName(qr.project_name || '');
      setTagsInput((qr.tags || []).join(', '));
      setStyleConfig(qr.style_config || { fg_color: '#0f172a', bg_color: '#ffffff' });
      setInactiveConfig(qr.inactive_config || {});
      setSelectedDomain(
        qr.custom_domain
          ? domains?.find((d) => d.domain === qr.custom_domain)?.id ?? null
          : null
      );
      setFormInit(true);
    }
  }, [qr, formInit, domains]);

  const verifiedDomains = domains?.filter((d) => d.verified) || [];

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t('qrEdit.titleRequired');
    if (qr?.type === 'url' && destinationUrl && !isValidHttpUrl(destinationUrl)) {
      newErrors.url = t('qrEdit.urlInvalid');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateMutation.mutateAsync({
        title,
        project_name: projectName.trim() || null,
        tags,
        style_config: styleConfig,
        inactive_config: inactiveConfig,
        ...(qr?.type === 'url' && { destination_url: destinationUrl }),
        custom_domain_id: selectedDomain,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        t('qrEdit.saveError');
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
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        t('qrEdit.replaceError');
      setErrors({ replace: msg });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !qr) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-red-500 dark:text-red-400">
          {t('qrEdit.notFound')}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{qr.title}</h1>
                <Badge variant={qr.type === 'url' ? 'info' : 'purple'}>
                  {qr.type.toUpperCase()}
                </Badge>
                {!qr.is_active && <Badge variant="warning">{t('qrCard.disabled')}</Badge>}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {t('qrEdit.created', {
                  date: formatDate(qr.created_at, i18n.language),
                })}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              loading={updateMutation.isPending}
              leftIcon={
                qr.is_active ? (
                  <PowerOff size={14} className="text-amber-500" />
                ) : (
                  <Power size={14} className="text-emerald-500" />
                )
              }
            >
              {qr.is_active ? t('qrCard.disable') : t('qrCard.enable')}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={updateMutation.isPending}
              leftIcon={<Save size={14} />}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>

        {/* Success Alert Banners */}
        <AnimatePresence>
          {replaceSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                <Check size={16} />
                {t('qrEdit.fileReplaced')}
              </div>
            </motion.div>
          )}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                <Check size={16} />
                {t('qrEdit.changesSaved')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/[0.04] dark:bg-white/[0.04] max-w-md">
          {[
            { id: 'details', label: 'Details & Destination', icon: Link2 },
            { id: 'design', label: 'QR Design Studio', icon: Palette },
            { id: 'inactive', label: 'Branded 404', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Details & Destination */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left QR Preview & Download */}
            <div className="lg:col-span-2 surface rounded-3xl p-6 flex flex-col items-center gap-4 text-center">
              <QRDisplay
                value={qr.public_url}
                size={160}
                fgColor={styleConfig.fg_color}
                bgColor={styleConfig.bg_color}
              />

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={13} />}
                  onClick={() => qrService.downloadImage(qr.id, 'png', qr.short_code)}
                  className="flex-1"
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={13} />}
                  onClick={() => qrService.downloadImage(qr.id, 'svg', qr.short_code)}
                  className="flex-1"
                >
                  SVG
                </Button>
              </div>

              <CopyField value={qr.public_url} label={t('qrEdit.urlLabel')} />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t('qrEdit.totalScans', { count: qr.scan_count })}
              </p>
            </div>

            {/* Right Form Fields */}
            <div className="lg:col-span-3 surface rounded-3xl p-6 space-y-5">
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Google Drive File
                  </label>
                  <div className="p-4 rounded-2xl bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(qr.mime_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {qr.original_filename}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {qr.file_size ? formatFileSize(qr.file_size) : t('qrEdit.unknownSize')} ·{' '}
                        {qr.mime_type}
                      </p>
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

              {/* Project / Folder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project / Folder
                </label>
                <input
                  type="text"
                  list="edit-projects-list"
                  placeholder="e.g. Downtown Branch"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
                />
                <datalist id="edit-projects-list">
                  {projectsData?.projects?.map((p) => (
                    <option key={p.name} value={p.name} />
                  ))}
                </datalist>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="menu, table-1"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
                />
              </div>

              {/* Custom Domains */}
              {verifiedDomains.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('qrEdit.domainLabel')}
                  </label>
                  <select
                    id="edit-domain"
                    value={selectedDomain ?? ''}
                    onChange={(e) =>
                      setSelectedDomain(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
                  >
                    <option value="">{t('createQr.defaultDomain')}</option>
                    {verifiedDomains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.domain}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex justify-end">
                <Button onClick={handleSave} loading={updateMutation.isPending}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: QR Design Studio */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <QRDesignStudio
              value={qr.public_url}
              styleConfig={styleConfig}
              onChange={setStyleConfig}
              showDownload={true}
              shortCode={qr.short_code}
            />

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button onClick={handleSave} loading={updateMutation.isPending} leftIcon={<Save size={14} />}>
                Save Design Changes
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Branded Inactive & 404 Settings */}
        {activeTab === 'inactive' && (
          <div className="surface rounded-3xl p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Branded Inactive & 404 Fallback
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize the page shown to scanners whenever you pause this QR code or if it expires.
              </p>
            </div>

            <Input
              label="Inactive Page Headline"
              placeholder="Link Temporarily Unavailable"
              value={inactiveConfig.title || ''}
              onChange={(e) => setInactiveConfig({ ...inactiveConfig, title: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Message
              </label>
              <textarea
                rows={3}
                placeholder="We're currently updating this catalog. Please check back tomorrow!"
                value={inactiveConfig.message || ''}
                onChange={(e) =>
                  setInactiveConfig({ ...inactiveConfig, message: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
              />
            </div>

            <Input
              label="Brand Logo URL (Optional)"
              placeholder="https://yourbrand.com/logo.png"
              value={inactiveConfig.logo_url || ''}
              onChange={(e) =>
                setInactiveConfig({ ...inactiveConfig, logo_url: e.target.value })
              }
            />

            <Input
              label="Support / Home Link URL (Optional)"
              placeholder="https://yourbrand.com/contact"
              value={inactiveConfig.support_url || ''}
              onChange={(e) =>
                setInactiveConfig({ ...inactiveConfig, support_url: e.target.value })
              }
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-white/10">
              <Button onClick={handleSave} loading={updateMutation.isPending} leftIcon={<Save size={14} />}>
                Save Inactive Page Settings
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replace File Modal */}
      <Modal
        isOpen={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setNewFile(null);
        }}
        title={t('qrEdit.replaceFileModalTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('qrEdit.replaceFileModalDesc')}
          </p>

          <FileDropzone
            onFileSelect={setNewFile}
            currentFile={newFile}
            error={errors.replace}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowReplaceModal(false);
                setNewFile(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!newFile}
              loading={replaceMutation.isPending}
              onClick={handleReplaceFile}
            >
              {t('qrEdit.confirmReplace')}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
