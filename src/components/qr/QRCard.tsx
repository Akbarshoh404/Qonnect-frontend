import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2, Edit2, Download, Trash2, Link2, File,
  MoreHorizontal, Power, PowerOff, ExternalLink
} from 'lucide-react';
import type { QrCode } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Card, CardContent } from '../ui/Card';
import { useUpdateQR, useDeleteQR } from '../../hooks/useQRCodes';
import { qrService } from '../../services/qr';
import { formatRelativeTime, getFileIcon, formatFileSize } from '../../utils/helpers';

interface QRCardProps {
  qr: QrCode;
}

export function QRCard({ qr }: QRCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleteDriveFile, setDeleteDriveFile] = useState(false);

  const updateMutation = useUpdateQR(qr.id);
  const deleteMutation = useDeleteQR();

  const handleToggleActive = () => {
    updateMutation.mutate({ is_active: !qr.is_active });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: qr.id, deleteDriveFile }, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  const handleDownloadPng = () => qrService.downloadImage(qr.id, 'png', qr.short_code);
  const handleDownloadSvg = () => qrService.downloadImage(qr.id, 'svg', qr.short_code);

  return (
    <>
      <Card className="group relative overflow-visible">
        <CardContent className="flex gap-4 p-5">
          {/* Type icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg
            ${qr.type === 'url' ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400'}`}>
            {qr.type === 'url' ? '🔗' : getFileIcon(qr.mime_type)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">{qr.title}</h3>
              <div className="flex-shrink-0 flex items-center gap-1">
                <Badge variant={qr.type === 'url' ? 'info' : 'purple'}>
                  {qr.type === 'url' ? <Link2 size={10} /> : <File size={10} />}
                  {qr.type.toUpperCase()}
                </Badge>
                {!qr.is_active && <Badge variant="warning">{t('qrCard.disabled')}</Badge>}
              </div>
            </div>

            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono truncate mb-2">{qr.public_url}</p>

            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <BarChart2 size={11} />
                {t('qrCard.scans', { count: qr.scan_count })}
              </span>
              <span>·</span>
              <span>{t('qrCard.updated', { time: formatRelativeTime(qr.updated_at, i18n.language) })}</span>
              {qr.type === 'file' && qr.file_size && (
                <>
                  <span>·</span>
                  <span>{formatFileSize(qr.file_size)}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/qr/${qr.id}/analytics`)}
              title={t('qrCard.viewAnalytics')}
              aria-label={t('qrCard.viewAnalytics')}
            >
              <BarChart2 size={15} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/qr/${qr.id}/edit`)}
              title={t('common.edit')}
              aria-label={t('common.edit')}
            >
              <Edit2 size={15} />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                title={t('qrCard.moreOptions')}
                aria-label={t('qrCard.moreOptions')}
                aria-haspopup="menu"
                aria-expanded={showMenu}>
                <MoreHorizontal size={15} />
              </Button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-9 z-20 w-48 surface-raised rounded-xl shadow-xl overflow-hidden backdrop-blur-xl"
                    >
                      <button onClick={() => { handleDownloadPng(); setShowMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        <Download size={14} /> {t('qrCard.downloadPng')}
                      </button>
                      <button onClick={() => { handleDownloadSvg(); setShowMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        <Download size={14} /> {t('qrCard.downloadSvg')}
                      </button>
                      <a href={qr.public_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors">
                        <ExternalLink size={14} /> {t('qrCard.openUrl')}
                      </a>
                      <button onClick={() => { handleToggleActive(); setShowMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        {qr.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                        {qr.is_active ? t('qrCard.disable') : t('qrCard.enable')}
                      </button>
                      <div className="border-t border-slate-200/80 dark:border-white/10" />
                      <button onClick={() => { setShowDeleteModal(true); setShowMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                        <Trash2 size={14} /> {t('common.delete')}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('qrCard.deleteTitle')}
        description={t('qrCard.deleteDescription')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('qrCard.deleteBody', { title: qr.title })}
          </p>
          {qr.type === 'file' && (
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 cursor-pointer hover:bg-slate-900/5 dark:hover:bg-white/8 transition-colors">
              <input
                type="checkbox"
                checked={deleteDriveFile}
                onChange={(e) => setDeleteDriveFile(e.target.checked)}
                className="mt-0.5 accent-indigo-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('qrCard.alsoDeleteFile')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {t('qrCard.alsoDeleteFileHint')}
                </p>
              </div>
            </label>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {t('qrCard.deleteQr')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
