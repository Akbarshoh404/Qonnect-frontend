import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between p-6 pb-0">
                <div>
                  {title && <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
                  {description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-900/5 dark:hover:text-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {/* Body */}
            <div className={cn('p-6', (title || description) && 'pt-4')}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
