import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, File, ArrowLeft, Check, Download, ExternalLink } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileDropzone } from '../components/ui/FileDropzone';
import { QRDisplay } from '../components/qr/QRDisplay';
import { CopyField } from '../components/ui/CopyButton';
import { useCreateUrlQR, useCreateFileQR } from '../hooks/useQRCodes';
import { useDomains } from '../hooks/useDomains';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { qrService } from '../services/qr';
import type { QrCode } from '../types';
import { isValidHttpUrl } from '../utils/helpers';
import { stepBackwardMotion, stepForwardMotion, premiumEase, usePremiumMotion } from '../utils/motion';

type Step = 'choose' | 'form' | 'success';
type QrType = 'url' | 'file';

export function CreateQRPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { driveConnected } = useAuth();
  const { data: domains } = useDomains();
  const [step, setStep] = useState<Step>('choose');
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [qrType, setQrType] = useState<QrType>('url');
  const [created, setCreated] = useState<QrCode | null>(null);
  const { reduceMotion } = usePremiumMotion();

  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUrl = useCreateUrlQR();
  const createFile = useCreateFileQR();

  const verifiedDomains = domains?.filter(d => d.verified) || [];
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

    try {
      let result: QrCode;
      if (qrType === 'url') {
        result = await createUrl.mutateAsync({
          title,
          destination_url: destinationUrl,
          custom_domain_id: selectedDomain,
        });
      } else {
        result = await createFile.mutateAsync({
          title,
          file: selectedFile!,
          custom_domain_id: selectedDomain,
        });
      }
      setCreated(result);
      setStepDirection('forward');
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('createQr.genericError');
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
          <motion.div key="choose" initial={stepVariants.initial} animate={stepVariants.animate} exit={stepVariants.exit} transition={{ duration: 0.24, ease: premiumEase }} className="max-w-lg mx-auto">
            <div className="mb-8">
              <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4 transition-colors cursor-pointer">
                <ArrowLeft size={16} /> {t('createQr.back')}
              </button>
              <h1 className="text-2xl font-bold">{t('createQr.title')}</h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('createQr.subtitle')}</p>
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
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1">{t('createQr.urlType')}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">{t('createQr.urlTypeDesc')}</p>
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
                  <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1">{t('createQr.fileType')}</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    {driveConnected ? t('createQr.fileTypeDescConnected') : t('createQr.fileTypeDescDisconnected')}
                  </p>
                </button>
                {!driveConnected && (
                  <button
                    type="button"
                    onClick={() => { window.location.href = authService.getDriveConnectUrl(); }}
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
          <motion.div key="form" initial={stepVariants.initial} animate={stepVariants.animate} exit={stepVariants.exit} transition={{ duration: 0.24, ease: premiumEase }} className="max-w-lg mx-auto">
            <div className="mb-8">
              <button type="button" onClick={goBackToChoose} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4 transition-colors cursor-pointer">
                <ArrowLeft size={16} /> {t('createQr.back')}
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${qrType === 'url' ? 'bg-indigo-500/10 dark:bg-indigo-500/15' : 'bg-purple-500/10 dark:bg-purple-500/15'}`}>
                  {qrType === 'url' ? <Link2 size={18} className="text-indigo-600 dark:text-indigo-400" /> : <File size={18} className="text-purple-600 dark:text-purple-400" />}
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    {qrType === 'url' ? t('createQr.formTitleUrl') : t('createQr.formTitleFile')}
                  </h1>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    {qrType === 'url' ? t('createQr.formSubtitleUrl') : t('createQr.formSubtitleFile')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
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

              {verifiedDomains.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('createQr.domainLabel')}</label>
                  <select
                    id="qr-domain"
                    value={selectedDomain ?? ''}
                    onChange={(e) => setSelectedDomain(e.target.value ? Number(e.target.value) : null)}
                    className="h-10 px-3 rounded-xl bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">{t('createQr.domainDefault')}</option>
                    {verifiedDomains.map((d) => (
                      <option key={d.id} value={d.id}>{d.domain}</option>
                    ))}
                  </select>
                </div>
              )}

              {errors.submit && (
                <p role="alert" className="text-sm text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {errors.submit}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => { setStepDirection('backward'); setStep('choose'); }}
                  className="flex-1"
                >
                  {t('createQr.cancel')}
                </Button>
                <Button
                  id="submit-create-qr"
                  onClick={handleSubmit}
                  loading={isCreating}
                  className="flex-1"
                >
                  {t('createQr.submit')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && created && (
          <motion.div key="success" initial={stepVariants.initial} animate={stepVariants.animate} exit={stepVariants.exit} transition={{ duration: 0.24, ease: premiumEase }} className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 mb-4"
            >
              <Check size={22} className="text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">{t('createQr.successTitle')}</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
              {t('createQr.successSubtitle')}
            </p>

            <div className="flex justify-center mb-6">
              <QRDisplay url={created.public_url} size={220} />
            </div>

            <CopyField value={created.public_url} label={t('createQr.urlFieldLabel')} />

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                id="download-png-btn"
                variant="secondary"
                leftIcon={<Download size={15} />}
                onClick={() => qrService.downloadImage(created.id, 'png', created.short_code)}
              >
                {t('createQr.downloadPng')}
              </Button>
              <Button
                id="download-svg-btn"
                variant="secondary"
                leftIcon={<Download size={15} />}
                onClick={() => qrService.downloadImage(created.id, 'svg', created.short_code)}
              >
                {t('createQr.downloadSvg')}
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="ghost"
                className="flex-1"
                leftIcon={<ExternalLink size={15} />}
                onClick={() => window.open(created.public_url, '_blank')}
              >
                {t('createQr.openUrl')}
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate(`/qr/${created.id}/edit`)}
              >
                {t('createQr.viewDetails')}
              </Button>
            </div>

            <button
              type="button"
              className="mt-4 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
              onClick={() => { setStepDirection('backward'); setStep('choose'); setCreated(null); }}
            >
              {t('createQr.createAnother')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
