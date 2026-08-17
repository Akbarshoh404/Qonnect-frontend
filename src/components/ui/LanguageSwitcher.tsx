import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Languages, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';
import { cn } from '../../utils/helpers';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export function LanguageSwitcher({ className, variant = 'default' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        aria-label={t('language.select')}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
          variant === 'default'
            ? 'px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
            : 'px-2 py-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        )}
      >
        <Languages size={16} />
        <span className="uppercase tracking-wide text-xs">{current.code}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-44 z-50 overflow-hidden rounded-2xl surface-raised backdrop-blur-xl"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{lang.nativeLabel}</span>
                {lang.code === current.code && <Check size={14} className="text-indigo-500 dark:text-indigo-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
