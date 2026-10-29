import { cn } from '../../lib/utils';

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel = 'Filter',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-xl border border-ink-border bg-ink-soft/70 p-1',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
              active
                ? 'bg-white text-sibiru-700 shadow-subtle'
                : 'text-ink-muted hover:bg-white/60 hover:text-ink-heading',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 font-mono text-[0.625rem]',
                  active ? 'bg-sibiru-50 text-sibiru-600' : 'bg-white/80 text-ink-muted',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
