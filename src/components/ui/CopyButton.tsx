import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard, cn } from '../../utils/helpers';
import { Button } from './Button';

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
    <Button
      type="button"
      variant="secondary"
      size="sm"
      leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
      onClick={handleCopy}
      aria-label={t('copyButton.copyToClipboard')}
      className={className}
    >
      {copied ? t('common.copied') : t('common.copy')}
    </Button>
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
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-left group hover:border-slate-900/20 dark:hover:border-white/20 transition-colors cursor-pointer',
          copied && 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15'
        )}
        onClick={handleCopy}
        aria-label={label ? `${t('copyButton.copyToClipboard')}: ${label}` : t('copyButton.copyToClipboard')}
      >
        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-mono truncate">{value}</span>
        <span className={cn('text-xs transition-all', copied ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300')}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">{copied ? t('common.copied') : ''}</span>
    </div>
  );
}
