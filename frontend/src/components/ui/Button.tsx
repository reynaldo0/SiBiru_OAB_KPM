import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'danger' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const variants = {
  primary:
    'bg-sibiru-500 text-white border border-sibiru-500 shadow-subtle hover:bg-sibiru-600 hover:border-sibiru-600 focus-visible:ring-sibiru-500/40',
  accent:
    'bg-gold-400 text-sibiru-900 border border-gold-400 shadow-subtle hover:bg-gold-300 hover:border-gold-300 focus-visible:ring-gold-400/50',
  outline:
    'bg-white text-sibiru-700 border border-ink-borderStrong hover:border-sibiru-300 hover:bg-sibiru-50 focus-visible:ring-sibiru-500/30',
  danger:
    'bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300 focus-visible:ring-red-400/30',
  ghost:
    'bg-transparent text-ink-body border border-transparent hover:bg-ink-soft hover:text-ink-heading focus-visible:ring-sibiru-500/30',
  subtle:
    'bg-sibiru-50 text-sibiru-700 border border-sibiru-100 hover:bg-sibiru-100 focus-visible:ring-sibiru-500/30',
};

const sizes = {
  sm: 'h-9 px-3 text-[0.75rem] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[0.8125rem] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
