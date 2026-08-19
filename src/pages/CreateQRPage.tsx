import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, File, ArrowLeft, Check, Download, ExternalLink,
  Sparkles, Palette, Folder, Settings, ShieldAlert
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileDropzone } from '../components/ui/FileDropzone';
import { QRDisplay } from '../components/qr/QRDisplay';
import { QRDesignStudio } from '../components/qr/QRDesignStudio';
import { CopyField } from '../components/ui/CopyButton';
import { useCreateUrlQR, useCreateFileQR, useProjectsAndTags } from '../hooks/useQRCodes';
import { useDomains } from '../hooks/useDomains';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { qrService } from '../services/qr';
import type { QrCode, QRStyleConfig, InactivePageConfig } from '../types';
import { isValidHttpUrl, cn } from '../utils/helpers';
import { stepBackwardMotion, stepForwardMotion, premiumEase, usePremiumMotion } from '../utils/motion';

type Step = 'choose' | 'form' | 'success';
type QrType = 'url' | 'file';

export function CreateQRPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { driveConnected } = useAuth();
  const { data: domains } = useDomains();
  const { data: projectsData } = useProjectsAndTags();

  const [step, setStep] = useState<Step>('choose');
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [qrType, setQrType] = useState<QrType>('url');
  const [created, setCreated] = useState<QrCode | null>(null);
  const { reduceMotion } = usePremiumMotion();

  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'inactive'>('content');

  // QR Design Studio styling state
  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>({
    fg_color: '#0f172a',
    bg_color: '#ffffff',
    dot_style: 'squares',
    corner_outer: 'square',
    corner_inner: 'square',
    logo_preset: 'none',
    frame_style: 'none',
  });

  // Branded inactive page state
  const [inactiveConfig, setInactiveConfig] = useState<InactivePageConfig>({
    title: 'Link Temporarily Unavailable',
    message: 'The creator has paused this QR code. Please check back later.',
    support_url: '',
    support_label: 'Contact Support',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUrl = useCreateUrlQR();
  const createFile = useCreateFileQR();

  const verifiedDomains = domains?.filter((d) => d.verified) || [];
  const isCreating = createUrl.isPending || createFile.isPending;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t('createQr.titleRequired');
    if (qrType === 'url') {
      if (!destinationUrl.trim()) newErrors.url = t('createQr.urlRequired');
      else if (!isValidHttpUrl(destinationUrl.trim())) newErrors.url = t('createQr.urlInvalid');
    }
    if (qrType === 'file' && !selectedFile) newErrors.file = t('createQr.fileRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      let result: QrCode;
      if (qrType === 'url') {
        result = await createUrl.mutateAsync({
          title,
          destination_url: destinationUrl,
          project_name: projectName.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          style_config: styleConfig,
          inactive_config: inactiveConfig,
          custom_domain_id: selectedDomain,
        });
      } else {
        result = await createFile.mutateAsync({
          title,
          file: selectedFile!,
          project_name: projectName.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          style_config: styleConfig,
          inactive_config: inactiveConfig,
          custom_domain_id: selectedDomain,
        });
      }
      setCreated(result);
      setStepDirection('forward');
      setStep('success');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        t('createQr.genericError');
      setErrors({ submit: msg });
    }
  };

  const handleChooseType = (type: QrType) => {
    setQrType(type);
    setStepDirection('forward');
    setStep('form');
    setTitle('');
    setDestinationUrl('');
    setSelectedFile(null);
    setErrors({});
  };

  const goBackToChoose = () => {
    setStepDirection('backward');
    setStep('choose');
  };

  const stepVariants = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : stepDirection === 'forward'
    ? stepForwardMotion
    : stepBackwardMotion;

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={stepVariants.initial}
            animate={stepVariants.animate}
            exit={stepVariants.exit}
            transition={{ duration: 0.24, ease: premiumEase }}
            className="max-w-lg mx-auto"
          >
            <div className="mb-8">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} /> {t('createQr.back')}
              </button>
              <h1 className="text-2xl font-bold">{t('createQr.title')}</h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {t('createQr.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                id="choose-url-type"
                onClick={() => handleChooseType('url')}
                className="group p-6 rounded-2xl surface text-left hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center mb-4 group-hover:bg-indigo-500/25 transition-colors">
                  <Link2 size={22} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  {t('createQr.urlType')}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {t('createQr.urlTypeDesc')}
                </p>
              </button>

              <div className="group p-6 rounded-2xl surface text-left hover:bg-purple-500/10 hover:border-purple-500/30 transition-all duration-200">
                <button
                  type="button"
                  id="choose-file-type"
                  onClick={() => driveConnected && handleChooseType('file')}
                  disabled={!driveConnected}
                  className="w-full text-left cursor-pointer disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/15 flex items-center justify-center mb-4 group-hover:bg-purple-500/25 transition-colors">
                    <File size={22} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    {t('createQr.fileType')}
                  </h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    {driveConnected
                      ? t('createQr.fileTypeDescConnected')
                      : t('createQr.fileTypeDescDisconnected')}
                  </p>
                </button>
                {!driveConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = authService.getDriveConnectUrl();
                    }}
                    className="mt-4 inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                  >
                    {t('createQr.connectDriveLink')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={stepVariants.initial}
            animate={stepVariants.animate}
            exit={stepVariants.exit}
            transition={{ duration: 0.24, ease: premiumEase }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={goBackToChoose}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> {t('createQr.back')}
                </button>
                <h1 className="text-2xl font-bold tracking-tight">
                  {qrType === 'url' ? t('createQr.formTitleUrl') : t('createQr.formTitleFile')}
                </h1>
              </div>

              {/* Navigation Tabs (Content vs Design vs Inactive Branding) */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/[0.04] dark:bg-white/[0.04]">
                {[
                  { id: 'content', label: '1. Destination', icon: Link2 },
                  { id: 'design', label: '2. QR Design Studio', icon: Palette },
                  { id: 'inactive', label: '3. Branded 404', icon: ShieldAlert },
                ].map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as typeof activeTab)}
                      className={cn(
                        'flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                        active
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      )}
                    >
                      <Icon size={13} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab 1: Content & Destination */}
            {activeTab === 'content' && (
              <div className="surface rounded-3xl p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
                <Input
                  id="qr-title"
                  label={t('createQr.titleLabel')}
                  placeholder={t('createQr.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                />

                {qrType === 'url' ? (
                  <Input
                    id="qr-url"
                    label={t('createQr.urlLabel')}
                    placeholder="https://example.com"
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    error={errors.url}
                    hint={t('createQr.urlHint')}
                  />
                ) : (
                  <FileDropzone
                    label={t('createQr.fileLabel')}
                    onFileSelect={setSelectedFile}
                    currentFile={selectedFile}
                    hint={t('createQr.fileHint')}
                    error={errors.file}
                  />
                )}

                {/* Project / Folder Assign */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Folder / Project (Optional)
                  </label>
                  <input
                    type="text"
                    list="projects-list"
                    placeholder="e.g. Dining Room, Marketing 2026"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="projects-list">
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
                    placeholder="menu, table-1, vip"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Verified Custom Domains */}
                {verifiedDomains.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('createQr.domainLabel')}
                    </label>
                    <select
                      id="qr-domain"
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

                {errors.submit && (
                  <p className="text-xs text-rose-500 font-medium">{errors.submit}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('design')}
                    leftIcon={<Palette size={15} />}
                  >
                    Customize Design →
                  </Button>

                  <Button
                    id="submit-qr-btn"
                    onClick={handleSubmit}
                    loading={isCreating}
                  >
                    {t('createQr.submit')}
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 2: QR Design Studio */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <QRDesignStudio
                  value={destinationUrl || 'https://qonnect.akbarshoh-dev.uz/q/preview'}
                  styleConfig={styleConfig}
                  onChange={setStyleConfig}
                />

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setActiveTab('content')}>
                    ← Back to Content
                  </Button>
                  <Button onClick={handleSubmit} loading={isCreating}>
                    Create Dynamic QR Code
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 3: Branded Inactive / 404 Page */}
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
                  onChange={(e) =>
                    setInactiveConfig({ ...inactiveConfig, title: e.target.value })
                  }
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
                  <Button onClick={handleSubmit} loading={isCreating}>
                    Create Dynamic QR Code
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'success' && created && (
          <motion.div
            key="success"
            initial={stepVariants.initial}
            animate={stepVariants.animate}
            exit={stepVariants.exit}
            transition={{ duration: 0.24, ease: premiumEase }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <h1 className="text-2xl font-bold mb-1">{t('createQr.successTitle')}</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
              {t('createQr.successSubtitle')}
            </p>

            {/* Styled QR Display */}
            <div className="p-6 rounded-3xl surface mb-6">
              <QRDisplay
                value={created.public_url}
                size={200}
                className="mb-4"
                fgColor={created.style_config?.fg_color}
                bgColor={created.style_config?.bg_color}
              />

              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
                {created.title}
              </p>
              <CopyField value={created.public_url} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => qrService.downloadImage(created.id, 'png', created.short_code)}
                leftIcon={<Download size={16} />}
                className="flex-1"
              >
                {t('createQr.downloadPng')}
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                {t('createQr.goToDashboard')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
