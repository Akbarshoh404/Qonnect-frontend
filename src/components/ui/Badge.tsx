import React from 'react';
import { cn } from '../../utils/helpers';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-900/8 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400',
  error: 'bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/15 dark:text-red-400',
  info: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400',
  purple: 'bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
