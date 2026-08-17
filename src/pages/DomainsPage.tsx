import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, Trash2, CheckCircle, Clock, RefreshCw, Copy, AlertCircle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useDomains, useAddDomain, useVerifyDomain, useDeleteDomain } from '../hooks/useDomains';
import { copyToClipboard } from '../utils/helpers';

const CNAME_TARGET = 'qr.qonnect.app';

export function DomainsPage() {
  const { t } = useTranslation();
  const { data: domains, isLoading } = useDomains();
  const addMutation = useAddDomain();
  const verifyMutation = useVerifyDomain();
  const deleteMutation = useDeleteDomain();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [addError, setAddError] = useState('');
  const [verifyResults, setVerifyResults] = useState<Record<number, { success: boolean; message: string }>>({});

  const handleAddDomain = async () => {
    setAddError('');
    try {
      await addMutation.mutateAsync(newDomain);
      setNewDomain('');
      setShowAddModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('domains.addFailedGeneric');
      setAddError(msg);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      const result = await verifyMutation.mutateAsync(id);
      if (result.domain.verified) {
        setVerifyResults(prev => ({ ...prev, [id]: { success: true, message: t('domains.verifySuccess') } }));
      } else {
        setVerifyResults(prev => ({ ...prev, [id]: { success: false, message: result.error || t('domains.verifyFailedGeneric') } }));
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('domains.verifyFailedGeneric');
      setVerifyResults(prev => ({ ...prev, [id]: { success: false, message: msg } }));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t('domains.title')}</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('domains.subtitle')}</p>
          </div>
          <Button
            id="add-domain-btn"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddModal(true)}
          >
            {t('domains.addDomain')}
          </Button>
        </div>

        {/* How it works */}
        <div className="mb-6 p-4 rounded-2xl surface">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('domains.howItWorksTitle')}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            {t('domains.howItWorksBody', { target: CNAME_TARGET })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : domains?.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 dark:text-slate-500">{t('domains.empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {domains?.map((domain, i) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.05 }}
                className="p-5 rounded-2xl surface space-y-4"
              >
                {/* Domain header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{domain.domain}</span>
                    <Badge variant={domain.verified ? 'success' : 'warning'}>
                      {domain.verified ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {domain.verified ? t('domains.verified') : t('domains.pending')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {!domain.verified && (
                      <Button
                        id={`verify-domain-${domain.id}`}
                        variant="outline"
                        size="sm"
                        loading={verifyMutation.isPending}
                        leftIcon={<RefreshCw size={13} />}
                        onClick={() => handleVerify(domain.id)}
                      >
                        {t('domains.check')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(domain.id)}
                    >
                      <Trash2 size={14} className="text-red-500 dark:text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Verify result feedback */}
                <AnimatePresence>
                  {verifyResults[domain.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`overflow-hidden flex items-center gap-2.5 p-3 rounded-xl text-xs ${
                        verifyResults[domain.id].success
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {verifyResults[domain.id].success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {verifyResults[domain.id].message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* DNS Setup Instructions */}
                {!domain.verified && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{t('domains.dnsSetupRequired')}</p>

                    {/* CNAME */}
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5">{t('domains.step1')}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { label: t('domains.fieldType'), value: 'CNAME' },
                          { label: t('domains.fieldName'), value: domain.domain.split('.')[0] },
                          { label: t('domains.fieldTarget'), value: CNAME_TARGET },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-2.5 rounded-lg bg-slate-900/[0.03] dark:bg-black/30 border border-slate-900/[0.06] dark:border-white/[0.06]">
                            <p className="text-slate-400 dark:text-slate-600 mb-1">{label}</p>
                            <p className="text-slate-700 dark:text-slate-300 font-mono break-all">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TXT */}
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5">{t('domains.step2')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { label: t('domains.fieldType'), value: 'TXT' },
                          { label: t('domains.fieldName'), value: domain.dns_record_name },
                          { label: t('domains.fieldValue'), value: domain.dns_record_value },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-2.5 rounded-lg bg-slate-900/[0.03] dark:bg-black/30 border border-slate-900/[0.06] dark:border-white/[0.06] relative group">
                            <p className="text-slate-400 dark:text-slate-600 mb-1">{label}</p>
                            <p className="text-slate-700 dark:text-slate-300 font-mono break-all pr-6">{value}</p>
                            <button
                              onClick={() => copyToClipboard(value)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Copy size={12} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-600">{t('domains.propagationNote')}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setNewDomain(''); setAddError(''); }}
        title={t('domains.modalTitle')}
        description={t('domains.modalDescription')}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            id="new-domain-input"
            label={t('domains.domainLabel')}
            placeholder={t('domains.domainPlaceholder')}
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            error={addError}
            hint={t('domains.domainHint')}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>{t('domains.cancel')}</Button>
            <Button
              id="confirm-add-domain"
              size="sm"
              loading={addMutation.isPending}
              onClick={handleAddDomain}
            >
              {t('domains.addDomain')}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
