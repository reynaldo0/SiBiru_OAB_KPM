import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden="true" {...props} />;
};

export const RoomCardSkeleton: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-border bg-white">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
        <Skeleton className="mt-3 h-9 w-full" />
      </div>
    </div>
  );
};

export const ListRowSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-ink-border bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-64 max-w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    </div>
  );
};
