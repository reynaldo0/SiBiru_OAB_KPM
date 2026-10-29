import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface LogoProps {
  to?: string;
  tone?: 'dark' | 'light';
  compact?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ to = '/', tone = 'dark', className }) => {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center focus-visible:outline-none select-none transition-opacity hover:opacity-90', className)}
      aria-label="SIBIRU — kembali ke beranda"
    >
      <span
        className={cn(
          'font-display text-[1.5rem] font-extrabold leading-none tracking-[-0.04em]',
          tone === 'dark' ? 'text-sibiru-900' : 'text-white',
        )}
      >
        SIBIRU
      </span>
    </Link>
  );
};
