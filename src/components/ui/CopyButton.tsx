import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../utils/helpers';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200 cursor-pointer
        ${copied
          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400'
          : 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-600 hover:text-slate-900 border border-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 dark:hover:text-white dark:border-white/10'
        } ${className}`}
      title={t('copyButton.copyToClipboard')}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? t('common.copied') : t('common.copy')}
    </button>
  );
}

interface CopyFieldProps {
  value: string;
  label?: string;
}

export function CopyField({ value, label }: CopyFieldProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</span>}
      <div
        className="flex items-center gap-2 bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2.5 cursor-pointer group hover:border-slate-900/20 dark:hover:border-white/20 transition-colors"
        onClick={handleCopy}
        title={t('copyButton.clickToCopy')}
      >
        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-mono truncate">{value}</span>
        <span className={`text-xs transition-all ${copied ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </span>
      </div>
    </div>
  );
}
