import React from 'react';
import { cn } from '../../lib/utils';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  counter?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
  counter,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-heading"
        >
          {label}
          {required && <span className="ml-1 text-gold-600">*</span>}
        </label>
        {counter && <span className="font-mono text-[0.625rem] text-ink-muted">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-[0.6875rem] font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="text-[0.6875rem] leading-relaxed text-ink-muted">{hint}</p>
      )}
    </div>
  );
};

export const Avatar: React.FC<{
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ name, size = 'md', className }) => {
  const parts = name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '');

  const sizes = {
    sm: 'h-8 w-8 text-[0.625rem]',
    md: 'h-9 w-9 text-[0.6875rem]',
    lg: 'h-12 w-12 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-sibiru-200 bg-sibiru-50 font-bold tracking-wide text-sibiru-700',
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {parts.join('') || '?'}
    </span>
  );
};
