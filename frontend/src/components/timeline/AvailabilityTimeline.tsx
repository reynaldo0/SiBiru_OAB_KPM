import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import type { BookedInterval } from '../../types';
import { cn } from '../../lib/utils';
import {
  OPERATING_END_HOUR,
  OPERATING_END_TIME,
  OPERATING_START_HOUR,
  OPERATING_START_TIME,
  formatTime,
  isToday,
  minutesToTime,
  nowMinutes,
  timeToMinutes,
} from '../../lib/dates';
import { Badge } from '../ui/Badge';

interface AvailabilityTimelineProps {
  date: string;
  bookedIntervals: BookedInterval[];
  selectedStart?: string;
  selectedEnd?: string;
  onSelectRange?: (start: string, end: string) => void;
  interactive?: boolean;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
}

const START_MINUTES = OPERATING_START_HOUR * 60;
const END_MINUTES = OPERATING_END_HOUR * 60;
const TOTAL_MINUTES = END_MINUTES - START_MINUTES;
const SNAP_MINUTES = 30;

const hourMarkers = Array.from(
  { length: (OPERATING_END_HOUR - OPERATING_START_HOUR) / 2 + 1 },
  (_, index) => OPERATING_START_HOUR + index * 2,
);

function clampMinutes(value: number): number {
  return Math.max(START_MINUTES, Math.min(END_MINUTES, value));
}

function snap(value: number): number {
  const snapped = Math.round(value / SNAP_MINUTES) * SNAP_MINUTES;
  return clampMinutes(snapped);
}

function fraction(value: string | number): number {
  const minutes = typeof value === 'number' ? value : timeToMinutes(value);
  return ((clampMinutes(minutes) - START_MINUTES) / TOTAL_MINUTES) * 100;
}

const quickSlots = [
  { label: 'Pagi', range: ['08:00', '10:00'] },
  { label: 'Siang', range: ['10:00', '12:00'] },
  { label: 'Sore', range: ['13:00', '16:00'] },
] as const;

export const AvailabilityTimeline: React.FC<AvailabilityTimelineProps> = ({
  date,
  bookedIntervals,
  selectedStart,
  selectedEnd,
  onSelectRange,
  interactive = false,
  isLoading = false,
  className,
  compact = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragAnchor, setDragAnchor] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);

  const hovered = useMemo(
    () => bookedIntervals.find((interval) => interval.booking_id === hoveredId) ?? null,
    [bookedIntervals, hoveredId],
  );

  useEffect(() => {
    if (!interactive) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDragAnchor(null);
        setDragCurrent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactive]);

  const minutesFromPointer = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return START_MINUTES;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snap(START_MINUTES + ratio * TOTAL_MINUTES);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !onSelectRange) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const value = minutesFromPointer(event.clientX);
    setDragAnchor(value);
    setDragCurrent(value);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const value = minutesFromPointer(event.clientX);

    if (dragAnchor !== null) {
      setDragCurrent(value);
      return;
    }

    const active = bookedIntervals.find(
      (interval) =>
        value >= timeToMinutes(formatTime(interval.start_time)) &&
        value < timeToMinutes(formatTime(interval.end_time)),
    );
    setHoveredId(active?.booking_id ?? null);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !onSelectRange || dragAnchor === null) return;

    const value = minutesFromPointer(event.clientX);
    const start = Math.min(dragAnchor, value);
    const rawEnd = Math.max(dragAnchor, value);
    const end = rawEnd === start ? Math.min(END_MINUTES, start + 60) : rawEnd;

    setDragAnchor(null);
    setDragCurrent(null);

    if (end > start) {
      onSelectRange(minutesToTime(start), minutesToTime(end));
    }
  };

  const handlePointerLeave = () => {
    if (dragAnchor === null) setHoveredId(null);
  };

  const selection = useMemo(() => {
    if (dragAnchor !== null && dragCurrent !== null) {
      const start = Math.min(dragAnchor, dragCurrent);
      const end = Math.max(dragAnchor, dragCurrent);
      return { start: minutesToTime(start), end: minutesToTime(Math.max(end, start + 30)) };
    }
    if (selectedStart && selectedEnd && selectedStart < selectedEnd) {
      return { start: selectedStart, end: selectedEnd };
    }
    return null;
  }, [dragAnchor, dragCurrent, selectedStart, selectedEnd]);

  const now = nowMinutes();
  const showNow = isToday(date) && now >= START_MINUTES && now <= END_MINUTES;

  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border border-ink-border bg-white p-4', className)}>
        <div className="skeleton h-[4.5rem] w-full rounded-xl" />
        <div className="mt-3 flex justify-between">
          <div className="skeleton h-2 w-10" />
          <div className="skeleton h-2 w-10" />
          <div className="skeleton h-2 w-10" />
          <div className="skeleton h-2 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-ink-border bg-white', compact ? 'p-3.5' : 'p-4 sm:p-5', className)}>
      {!compact && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-sibiru-600">
              Ketersediaan ruangan
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
              {interactive ? 'Tarik pada timeline untuk memilih rentang waktu.' : 'Jadwal operasional pada tanggal terpilih.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[0.625rem] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-sibiru-500" /> Disetujui
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-gold-400" /> Menunggu
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm border border-ink-borderStrong bg-ink-soft" /> Tersedia
            </span>
          </div>
        </div>
      )}

      <div
        ref={trackRef}
        className={cn(
          'relative w-full touch-none overflow-hidden rounded-xl border border-ink-border bg-ink-light select-none',
          compact ? 'h-12' : 'h-[4.75rem]',
          interactive && 'cursor-crosshair',
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setDragAnchor(null);
          setDragCurrent(null);
        }}
        onPointerLeave={handlePointerLeave}
        role="group"
        aria-label={`Timeline ketersediaan ${date}, jam ${OPERATING_START_TIME} sampai ${OPERATING_END_TIME}`}
      >
        <div className="absolute inset-0 bg-striped-pending opacity-[0.045]" aria-hidden="true" />

        {hourMarkers.map((hour) => {
          const left = fraction(`${String(hour).padStart(2, '0')}:00`);
          return (
            <div
              key={hour}
              className="pointer-events-none absolute inset-y-0 border-l border-ink-border/80"
              style={{ left: `${left}%` }}
              aria-hidden="true"
            />
          );
        })}

        {selection && (
          <div
            className="pointer-events-none absolute inset-y-0 z-20 border-x-2 border-sibiru-500 bg-sibiru-500/15"
            style={{
              left: `${fraction(selection.start)}%`,
              width: `${Math.max(0.8, fraction(selection.end) - fraction(selection.start))}%`,
            }}
          >
            {!compact && (
              <span className="absolute left-1/2 top-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-sibiru-600 px-1.5 py-0.5 font-mono text-[0.5625rem] font-semibold text-white shadow-sm">
                {selection.start}–{selection.end}
              </span>
            )}
          </div>
        )}

        {bookedIntervals.map((interval) => {
          const left = fraction(formatTime(interval.start_time));
          const width = Math.max(0.8, fraction(formatTime(interval.end_time)) - left);
          const isApproved = interval.status === 'APPROVED';
          const isHovered = hoveredId === interval.booking_id;

          return (
            <div
              key={interval.booking_id}
              className={cn(
                'pointer-events-none absolute top-1.5 bottom-1.5 z-10 flex items-center justify-center overflow-hidden rounded-md px-1.5 transition-all duration-150',
                isApproved
                  ? 'bg-sibiru-500 text-white'
                  : 'bg-striped-pending text-gold-900',
                isHovered && 'z-30 scale-y-[1.06] shadow-md',
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              {!compact && width > 6 && (
                <span className="truncate font-mono text-[0.5625rem] font-semibold">
                  {formatTime(interval.start_time)}–{formatTime(interval.end_time)}
                </span>
              )}
            </div>
          );
        })}

        {showNow && (
          <div
            className="pointer-events-none absolute inset-y-0 z-40 w-px bg-[#0f2e2f]/70"
            style={{ left: `${fraction(now)}%` }}
            aria-hidden="true"
          >
            <span className="absolute -left-[3px] top-0 h-[7px] w-[7px] rounded-full bg-[#0f2e2f]" />
          </div>
        )}
      </div>

      <div className="relative mt-1.5 h-4 font-mono text-[0.5625rem] text-ink-muted">
        {hourMarkers.map((hour) => (
          <span
            key={hour}
            className="absolute -translate-x-1/2"
            style={{ left: `${fraction(`${String(hour).padStart(2, '0')}:00`)}%` }}
          >
            {String(hour).padStart(2, '0')}
          </span>
        ))}
      </div>

      {!compact && (
        <div className="mt-3 min-h-[2.6rem] rounded-xl border border-ink-border/80 bg-ink-soft/50 px-3 py-2">
          {hovered ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6875rem]">
              <div className="min-w-0">
                <span className="font-semibold text-ink-heading">{hovered.organization}</span>
                <span className="mx-1.5 text-ink-muted">·</span>
                <span className="text-ink-muted">{hovered.borrower_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[0.625rem] text-ink-body">
                  <Clock3 size={11} />
                  {formatTime(hovered.start_time)}–{formatTime(hovered.end_time)}
                </span>
                <Badge status={hovered.status} className="px-2 py-0.5 text-[0.5625rem]">
                  {hovered.status === 'APPROVED' ? 'Disetujui' : 'Menunggu'}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-[0.6875rem] text-ink-muted">
              {selection
                ? `Rentang terpilih ${selection.start}–${selection.end} WIB.`
                : interactive
                  ? 'Belum ada rentang terpilih. Tarik pada timeline atau gunakan pilihan cepat.'
                  : 'Arahkan kursor ke blok jadwal untuk melihat detail agenda.'}
            </p>
          )}
        </div>
      )}

      {!compact && interactive && onSelectRange && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[0.625rem] font-semibold text-ink-muted">Pilihan cepat:</span>
          {quickSlots.map((slot) => (
            <button
              key={slot.label}
              type="button"
              onClick={() => onSelectRange(slot.range[0], slot.range[1])}
              className="rounded-lg border border-ink-border bg-white px-2.5 py-1 text-[0.625rem] font-semibold text-ink-body transition-colors hover:border-sibiru-200 hover:bg-sibiru-50 hover:text-sibiru-700"
            >
              {slot.label} · {slot.range[0]}–{slot.range[1]}
            </button>
          ))}
          <span className="ml-auto font-mono text-[0.5625rem] text-ink-muted">
            {OPERATING_START_TIME}–{OPERATING_END_TIME} WIB
          </span>
        </div>
      )}
    </div>
  );
};
