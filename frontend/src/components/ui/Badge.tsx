import React from 'react';
import { cn } from '../../lib/utils';
import type { BookingStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'approved' | 'pending' | 'rejected' | 'active' | 'inactive' | 'facility' | 'neutral';
  status?: BookingStatus;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  className,
  children,
  ...props
}) => {
  let resolvedVariant = variant || 'neutral';
  if (status) {
    if (status === 'APPROVED') resolvedVariant = 'approved';
    else if (status === 'PENDING') resolvedVariant = 'pending';
    else if (status === 'REJECTED') resolvedVariant = 'rejected';
  }

  const variants = {
    approved: 'bg-[#E6F4F1] text-[#006569] border-[#A7D8CF]',
    pending: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    rejected: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    facility: 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200/80 transition-colors',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const dotColors = {
    approved: 'bg-[#006569]',
    pending: 'bg-[#F59E0B]',
    rejected: 'bg-[#BE123C]',
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    facility: '',
    neutral: '',
  };

  const showDot = ['approved', 'pending', 'rejected', 'active', 'inactive'].includes(resolvedVariant);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-all',
        variants[resolvedVariant],
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[resolvedVariant as keyof typeof dotColors]
          )}
        />
      )}
      {children}
    </span>
  );
};
