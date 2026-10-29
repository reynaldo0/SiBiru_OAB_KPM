import React from 'react';
import { cn } from '../../lib/utils';

export const LoadingDots: React.FC<{ className?: string; label?: string }> = ({
  className,
  label = 'Memuat',
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 animate-pulse-soft rounded-full bg-gold-400"
            style={{ animationDelay: `${index * 180}ms` }}
          />
        ))}
      </div>
      <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </span>
    </div>
  );
};

export const ScreenLoader: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingDots label={label} />
    </div>
  );
};
