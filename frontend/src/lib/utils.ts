import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BookingStatus, Room } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatTimeRange, formatDateLong as formatDateIndo } from './dates';

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Menunggu Keputusan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

export function statusLabel(status: BookingStatus): string {
  return STATUS_LABEL[status] ?? status;
}

export function initials(name: string): string {
  return name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function isLabRoom(room: Pick<Room, 'name'>): boolean {
  return /lab|laboratorium|komputer/i.test(room.name);
}

export function isLargeVenue(room: Pick<Room, 'name' | 'capacity'>): boolean {
  return room.capacity >= 100 || /auditorium|aula|seminar/i.test(room.name);
}

export function roomImage(room: Pick<Room, 'id' | 'name' | 'capacity' | 'image_url'>): string {
  if (room.image_url) return room.image_url;
  if (isLabRoom(room)) return '/assets/ilustrasi/lab-komputer.webp';
  if (isLargeVenue(room)) return '/assets/ilustrasi/main.webp';
  return '/assets/ilustrasi/ruang-kuliah.webp';
}

export function roomCategory(room: Pick<Room, 'name' | 'capacity'>): string {
  if (isLabRoom(room)) return 'Laboratorium';
  if (isLargeVenue(room)) return 'Ruang besar';
  return 'Ruang akademik';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? singular}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}
