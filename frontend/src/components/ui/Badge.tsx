import React from 'react';
import { cn } from '../../lib/utils';
import type { BookingStatus } from '../../types';

type BadgeVariant =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'facility'
  | 'neutral'
  | 'info'
  | 'gold'
  | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: BookingStatus;
  dot?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  approved: 'bg-sibiru-50 text-sibiru-700 border-sibiru-200',
  pending: 'bg-gold-50 text-gold-800 border-gold-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  active: 'bg-sibiru-50 text-sibiru-700 border-sibiru-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  facility: 'bg-ink-soft text-ink-body border-ink-border',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  gold: 'bg-gold-100 text-gold-900 border-gold-300',
  outline: 'bg-transparent text-ink-muted border-ink-borderStrong',
};

const dotClasses: Record<BadgeVariant, string> = {
  approved: 'bg-sibiru-500',
  pending: 'bg-gold-500',
  rejected: 'bg-red-500',
  active: 'bg-sibiru-500',
  inactive: 'bg-slate-400',
  facility: 'bg-sibiru-300',
  neutral: 'bg-slate-400',
  info: 'bg-blue-500',
  gold: 'bg-gold-500',
  outline: 'bg-ink-muted',
};

function resolveVariant(variant?: BadgeVariant, status?: BookingStatus): BadgeVariant {
  if (variant) return variant;
  if (status === 'APPROVED') return 'approved';
  if (status === 'PENDING') return 'pending';
  if (status === 'REJECTED') return 'rejected';
  return 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  dot = true,
  className,
  children,
  ...props
}) => {
  const resolved = resolveVariant(variant, status);

  return (
    <span
      className={cn(
        'inline-flex select-none items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold leading-none tracking-wide',
        variantClasses[resolved],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClasses[resolved])} />}
      {children}
    </span>
  );
};
