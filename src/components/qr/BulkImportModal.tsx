import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, Plus, Trash2, CheckCircle2,
  AlertCircle, Download, FileArchive, ArrowRight
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { useBulkCreateQR } from '../../hooks/useQRCodes';
import { qrService } from '../../services/qr';
import type { BulkCreateItem } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<BulkCreateItem[]>([
    { title: 'Menu Table 1', destination_url: 'https://example.com/menu' },
    { title: 'Menu Table 2', destination_url: 'https://example.com/menu' },
    { title: 'Menu Table 3', destination_url: 'https://example.com/menu' },
  ]);
  const [projectName, setProjectName] = useState('');
  const [createdResult, setCreatedResult] = useState<{
    message: string;
    qr_codes: any[];
    errors: string[];
  } | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const bulkMutation = useBulkCreateQR();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsed: BulkCreateItem[] = [];
      // Skip header if it contains title or url
      const startIndex = lines[0].toLowerCase().includes('url') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          parsed.push({
            title: parts[0] || `QR ${i}`,
            destination_url: parts[1],
            project_name: parts[2] || undefined,
            tags: parts[3] ? parts[3].split(';').map((t) => t.trim()) : undefined,
          });
        }
      }

      if (parsed.length > 0) {
        setItems(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const csvContent = 'title,destination_url,project_name,tags\nTable 1,https://myrestaurant.com/menu,Dining Room,table;menu\nTable 2,https://myrestaurant.com/menu,Dining Room,table;menu\nVIP Lounge,https://myrestaurant.com/vip,VIP Area,vip;drinks\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qonnect-bulk-sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateItem = (index: number, field: keyof BulkCreateItem, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    setItems(next);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { title: `QR ${items.length + 1}`, destination_url: 'https://' }]);
  };

  const handleGenerateAll = () => {
    const validItems = items.filter((i) => i.title.trim() && i.destination_url.trim());
    if (validItems.length === 0) return;

    bulkMutation.mutate(
      {
        items: validItems.map((i) => ({
          ...i,
          project_name: i.project_name || projectName || undefined,
        })),
        project_name: projectName || undefined,
      },
      {
        onSuccess: (res) => {
          setCreatedResult(res);
        },
      }
    );
  };

  const handleDownloadZip = async () => {
    if (!createdResult || createdResult.qr_codes.length === 0) return;
    setIsExportingZip(true);
    try {
      await qrService.bulkExportZip({
        ids: createdResult.qr_codes.map((q) => q.id),
        format: 'png',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleReset = () => {
    setCreatedResult(null);
    setItems([
      { title: 'Menu Table 1', destination_url: 'https://example.com/menu' },
      { title: 'Menu Table 2', destination_url: 'https://example.com/menu' },
    ]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={createdResult ? 'Bulk Generation Complete' : '⚡ Bulk QR Code Generator'}
      size="xl"
    >
      {createdResult ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {createdResult.message}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              All {createdResult.qr_codes.length} dynamic QR codes have been created and added to your dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={handleDownloadZip}
              loading={isExportingZip}
              leftIcon={<FileArchive size={16} />}
            >
              Download All as ZIP Archive (.zip)
            </Button>
            <Button variant="outline" onClick={onClose}>
              View on Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upload Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Import CSV Spreadsheet
                </p>
                <p className="text-[11px] text-slate-500">Columns: title, destination_url, project, tags</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download size={12} />
                <span>Sample CSV</span>
              </button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all">
                  <Upload size={12} />
                  <span>Choose CSV</span>
                </span>
              </label>
            </div>
          </div>

          {/* Project / Folder Assign */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign to Folder / Project (Optional)
            </label>
            <Input
              placeholder="e.g. Downtown Branch, Summer Campaign 2026"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Table of items to generate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                QR Codes to Generate ({items.length})
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus size={13} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-200/50 dark:divide-white/5">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900">
                  <span className="text-xs font-mono text-slate-400 w-5 text-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
                  />
                  <input
                    type="url"
                    placeholder="https://destination.com"
                    value={item.destination_url}
                    onChange={(e) => updateItem(index, 'destination_url', e.target.value)}
                    className="flex-[1.5] px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-white/10">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateAll}
              loading={bulkMutation.isPending}
              leftIcon={<Plus size={16} />}
            >
              Generate {items.length} Dynamic QRs
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
