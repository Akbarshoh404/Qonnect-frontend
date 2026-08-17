import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/helpers';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-indigo-500 dark:text-indigo-400', sizeClasses[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('common.loading')}</p>
      </div>
    </div>
  );
}
