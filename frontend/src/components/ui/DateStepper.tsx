import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDaysISO, todayISO } from '../../lib/dates';
import { cn } from '../../lib/utils';

interface DateStepperProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  allowPast?: boolean;
}

export const DateStepper: React.FC<DateStepperProps> = ({
  value,
  onChange,
  className,
  label = 'Tanggal',
  allowPast = false,
}) => {
  const min = allowPast ? undefined : todayISO();
  const prevDisabled = !allowPast && addDaysISO(value, -1) < todayISO();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="hidden items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-muted sm:inline-flex">
        <CalendarDays size={12} className="text-sibiru-500" />
        {label}
      </span>

      <div className="flex items-center rounded-xl border border-ink-border bg-white shadow-subtle">
        <button
          type="button"
          onClick={() => onChange(addDaysISO(value, -1))}
          disabled={prevDisabled}
          className="flex h-9 w-9 items-center justify-center rounded-l-xl text-ink-muted transition-colors hover:bg-ink-soft hover:text-sibiru-600 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Hari sebelumnya"
        >
          <ChevronLeft size={15} />
        </button>

        <input
          type="date"
          value={value}
          min={min}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
          className="h-9 w-[8.75rem] border-x border-ink-border bg-transparent px-2 text-center font-mono text-[0.6875rem] font-semibold text-ink-heading focus:outline-none"
          aria-label={label}
        />

        <button
          type="button"
          onClick={() => onChange(addDaysISO(value, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-r-xl text-ink-muted transition-colors hover:bg-ink-soft hover:text-sibiru-600"
          aria-label="Hari berikutnya"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {!allowPast && value !== todayISO() && (
        <button
          type="button"
          onClick={() => onChange(todayISO())}
          className="rounded-lg px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-sibiru-600 transition-colors hover:bg-sibiru-50"
        >
          Hari ini
        </button>
      )}
    </div>
  );
};
