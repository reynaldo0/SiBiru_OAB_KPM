import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 700,
  className,
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={className}>{new Intl.NumberFormat('id-ID').format(display)}</span>;
};

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ElementType;
  tone?: 'teal' | 'gold' | 'neutral' | 'danger';
  animate?: boolean;
  className?: string;
}

const toneClasses = {
  teal: {
    icon: 'bg-sibiru-50 text-sibiru-500 border-sibiru-100',
    accent: 'bg-sibiru-500',
    value: 'text-sibiru-700',
  },
  gold: {
    icon: 'bg-gold-50 text-gold-600 border-gold-100',
    accent: 'bg-gold-400',
    value: 'text-gold-800',
  },
  neutral: {
    icon: 'bg-ink-soft text-ink-body border-ink-border',
    accent: 'bg-slate-400',
    value: 'text-ink-heading',
  },
  danger: {
    icon: 'bg-red-50 text-red-600 border-red-100',
    accent: 'bg-red-500',
    value: 'text-red-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'teal',
  animate = false,
  className,
}) => {
  const styles = toneClasses[tone];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-ink-border bg-white p-5 shadow-subtle transition-shadow duration-300 hover:shadow-card',
        className,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', styles.accent)} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
            {label}
          </p>
          <p className={cn('mt-2 font-mono text-3xl font-semibold tracking-tight', styles.value)}>
            {typeof value === 'number' && animate ? <AnimatedNumber value={value} /> : value}
          </p>
          {hint && <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-ink-muted">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
            styles.icon,
          )}
        >
          <Icon size={19} strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
};
