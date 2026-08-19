import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2, Edit2, Download, Trash2, Link2, File,
  MoreHorizontal, Power, PowerOff, Folder, Tag, Sparkles
} from 'lucide-react';
import type { QrCode } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Card, CardContent } from '../ui/Card';
import { useUpdateQR, useDeleteQR } from '../../hooks/useQRCodes';
import { qrService } from '../../services/qr';
import { formatRelativeTime, getFileIcon, formatFileSize, cn } from '../../utils/helpers';

interface QRCardProps {
  qr: QrCode;
  selected?: boolean;
  onToggleSelect?: () => void;
  showCheckbox?: boolean;
}

export function QRCard({
  qr,
  selected = false,
  onToggleSelect,
  showCheckbox = false,
}: QRCardProps) {
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
    deleteMutation.mutate(
      { id: qr.id, deleteDriveFile },
      {
        onSuccess: () => setShowDeleteModal(false),
      }
    );
  };

  const handleDownloadPng = () => qrService.downloadImage(qr.id, 'png', qr.short_code);
  const handleDownloadSvg = () => qrService.downloadImage(qr.id, 'svg', qr.short_code);

  const customColor = qr.style_config?.fg_color;

  return (
    <>
      <Card
        className={cn(
          'group relative overflow-visible transition-all duration-200',
          selected && 'ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
        )}
      >
        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
          {/* Checkbox for bulk actions */}
          {showCheckbox && (
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelect}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-white/20 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          )}

          {/* Type / Style icon */}
          <div
            className={cn(
              'flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-sm',
              qr.type === 'url'
                ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400'
            )}
            style={customColor ? { border: `2px solid ${customColor}30` } : undefined}
          >
            {qr.type === 'url' ? '🔗' : getFileIcon(qr.mime_type)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                {qr.title}
              </h3>

              <div className="flex-shrink-0 flex items-center gap-1">
                <Badge variant={qr.type === 'url' ? 'info' : 'purple'}>
                  {qr.type === 'url' ? <Link2 size={10} /> : <File size={10} />}
                  {qr.type.toUpperCase()}
                </Badge>
                {!qr.is_active && <Badge variant="warning">{t('qrCard.disabled')}</Badge>}
                {qr.style_config && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    title="Custom Design Studio Style"
                  >
                    <Sparkles size={9} />
                    Styled
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono truncate mb-1.5">
              {qr.public_url}
            </p>

            {/* Folder & Tags Bar */}
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
              {qr.project_name && (
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                  <Folder size={11} className="text-indigo-500" />
                  <span>{qr.project_name}</span>
                </span>
              )}

              <span className="flex items-center gap-1">
                <BarChart2 size={11} />
                {t('qrCard.scans', { count: qr.scan_count })}
              </span>

              <span>·</span>
              <span>
                {t('qrCard.updated', {
                  time: formatRelativeTime(qr.updated_at, i18n.language),
                })}
              </span>

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
              >
                <MoreHorizontal size={15} />
              </Button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-900/10 z-20 py-1.5 text-xs"
                    >
                      <button
                        onClick={() => {
                          handleDownloadPng();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Download size={14} />
                        {t('qrCard.downloadPng')}
                      </button>

                      <button
                        onClick={() => {
                          handleDownloadSvg();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Download size={14} />
                        {t('qrCard.downloadSvg')}
                      </button>

                      <button
                        onClick={() => {
                          handleToggleActive();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {qr.is_active ? (
                          <>
                            <PowerOff size={14} className="text-amber-500" />
                            <span>{t('qrCard.disable')}</span>
                          </>
                        ) : (
                          <>
                            <Power size={14} className="text-emerald-500" />
                            <span>{t('qrCard.enable')}</span>
                          </>
                        )}
                      </button>

                      <div className="my-1 border-t border-slate-200/60 dark:border-white/5" />

                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        {t('common.delete')}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('qrCard.deleteTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('qrCard.deleteBody', { title: qr.title })}
          </p>

          {qr.type === 'file' && (
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/5 dark:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteDriveFile}
                onChange={(e) => setDeleteDriveFile(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('qrCard.alsoDeleteFile')}
                </p>
                <p className="text-slate-400 dark:text-slate-500">
                  {t('qrCard.alsoDeleteFileHint')}
                </p>
              </div>
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              {t('qrCard.deleteQr')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
