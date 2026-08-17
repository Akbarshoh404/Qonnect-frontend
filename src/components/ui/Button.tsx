import React from 'react';
import { cn } from '../../utils/helpers';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 disabled:bg-indigo-300 dark:disabled:bg-indigo-800',
  secondary: 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-900/10 disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-100 dark:border-white/10',
  ghost: 'hover:bg-slate-900/5 text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:hover:bg-white/8 dark:text-slate-300 dark:hover:text-white',
  danger: 'bg-red-500/10 hover:bg-red-500/15 text-red-600 border border-red-500/20 disabled:opacity-40 dark:bg-red-600/20 dark:hover:bg-red-600/30 dark:text-red-400 dark:border-red-500/30',
  outline: 'border border-indigo-500/40 hover:border-indigo-500 text-indigo-600 hover:text-indigo-500 hover:bg-indigo-500/10 disabled:opacity-40 dark:border-indigo-500/50 dark:hover:border-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
        'cursor-pointer disabled:cursor-not-allowed select-none active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
