import React from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftElement && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            {leftElement}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl bg-slate-900/[0.03] dark:bg-white/5 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all',
            'py-2.5 text-sm',
            leftElement ? 'pl-10 pr-4' : 'px-4',
            rightElement ? 'pr-10' : '',
            error
              ? 'border-red-500/50 focus:ring-red-500/30'
              : 'border-slate-900/10 hover:border-slate-900/20 dark:border-white/10 dark:hover:border-white/20',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
