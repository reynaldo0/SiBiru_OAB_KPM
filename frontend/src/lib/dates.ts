import {
  addDays,
  differenceInMinutes,
  format,
  isSameDay,
  isToday as dateFnsIsToday,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export const OPERATING_START_HOUR = 7;
export const OPERATING_END_HOUR = 21;
export const OPERATING_START_TIME = '07:00';
export const OPERATING_END_TIME = '21:00';
export const OPERATING_HOURS_LABEL = '07.00 – 21.00 WIB';

/** Returns today's date in the local timezone as YYYY-MM-DD. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function toISODate(value: Date): string {
  return format(value, 'yyyy-MM-dd');
}

export function parseISODate(value: string): Date {
  return parseISO(`${value.slice(0, 10)}T00:00:00`);
}

export function addDaysISO(value: string, amount: number): string {
  return toISODate(addDays(parseISODate(value), amount));
}

export function isToday(value: string): boolean {
  return dateFnsIsToday(parseISODate(value));
}

export function isPastDate(value: string): boolean {
  return value.slice(0, 10) < todayISO();
}

export function isSameISODate(a: string, b: string): boolean {
  return isSameDay(parseISODate(a), parseISODate(b));
}

export function formatDateLong(value: string): string {
  try {
    return format(parseISODate(value), 'EEEE, d MMMM yyyy', { locale: localeId });
  } catch {
    return value;
  }
}

export function formatDateMedium(value: string): string {
  try {
    return format(parseISODate(value), 'd MMM yyyy', { locale: localeId });
  } catch {
    return value;
  }
}

export function formatDateShort(value: string): string {
  try {
    return format(parseISODate(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

export function formatDayNumber(value: string): string {
  try {
    return format(parseISODate(value), 'dd');
  } catch {
    return value.slice(8, 10);
  }
}

export function formatMonthShort(value: string): string {
  try {
    return format(parseISODate(value), 'MMM', { locale: localeId });
  } catch {
    return value;
  }
}

/** Formats an ISO timestamp (created_at / updated_at) with a compact WIB-friendly label. */
export function formatDateTimeShort(value?: string | null): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'd MMM yyyy · HH:mm', { locale: localeId });
  } catch {
    return value;
  }
}

export function formatDayName(value: string): string {
  try {
    return format(parseISODate(value), 'EEEE', { locale: localeId });
  } catch {
    return value;
  }
}

export function formatDayShort(value: string): string {
  try {
    return format(parseISODate(value), 'EEE', { locale: localeId });
  } catch {
    return value;
  }
}

export function formatMonthYear(value: string): string {
  try {
    return format(parseISODate(value), 'MMMM yyyy', { locale: localeId });
  } catch {
    return value;
  }
}

export function formatRelativeDay(value: string): string {
  const today = todayISO();
  if (value === today) return 'Hari ini';
  if (value === addDaysISO(today, 1)) return 'Besok';
  return formatDateLong(value);
}

/** Normalizes "09:00:00" or "09:00" into "09:00". */
export function formatTime(value?: string | null): string {
  if (!value) return '--:--';
  return value.slice(0, 5);
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  return `${formatTime(start)} – ${formatTime(end)} WIB`;
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(totalMinutes)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function durationLabel(start: string, end: string): string {
  const minutes = timeToMinutes(end) - timeToMinutes(start);
  if (minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} menit`;
}

export function durationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

/** Monday-first week that contains the given date. */
export function getWeekDates(value: string): string[] {
  const start = startOfWeek(parseISODate(value), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => toISODate(addDays(start, index)));
}

export function formatWeekRange(start: string, end: string): string {
  try {
    const startDate = parseISODate(start);
    const endDate = parseISODate(end);
    const sameMonth = format(startDate, 'MM yyyy') === format(endDate, 'MM yyyy');
    if (sameMonth) {
      return `${format(startDate, 'd')}–${format(endDate, 'd MMMM yyyy', { locale: localeId })}`;
    }
    return `${format(startDate, 'd MMM', { locale: localeId })} – ${format(endDate, 'd MMM yyyy', { locale: localeId })}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function nowTime(): string {
  return format(new Date(), 'HH:mm');
}

export function nowMinutes(): number {
  return timeToMinutes(nowTime());
}

export { differenceInMinutes };
