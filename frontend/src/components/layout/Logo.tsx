import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface LogoProps {
  to?: string;
  tone?: 'dark' | 'light';
  compact?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ to = '/', tone = 'dark', compact = false, className }) => {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-3 focus-visible:outline-none', className)}
      aria-label="SIBIRU — kembali ke beranda"
    >
      <span
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5',
          tone === 'dark'
            ? 'border-sibiru-700 bg-sibiru-500 text-white'
            : 'border-white/20 bg-white/10 text-white',
        )}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M6.5 25V14.2A9.5 9.5 0 0 1 16 4.7a9.5 9.5 0 0 1 9.5 9.5V25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M11.8 25v-7.1a4.2 4.2 0 0 1 8.4 0V25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M4 26.5h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24.8" cy="7.2" r="2.4" fill="#F5C542" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span
            className={cn(
              'font-display text-[1.35rem] font-semibold leading-none tracking-[-0.045em]',
              tone === 'dark' ? 'text-sibiru-800' : 'text-white',
            )}
          >
            SIBIRU
          </span>
          <span
            className={cn(
              'mt-1 text-[0.5625rem] font-bold uppercase tracking-[0.18em]',
              tone === 'dark' ? 'text-ink-muted' : 'text-white/55',
            )}
          >
            Ruang kampus, lebih pasti
          </span>
        </span>
      )}
    </Link>
  );
};
