import { AUTH_TOKEN_KEY } from '../lib/constants';
import type { BookingStatus, ConflictDetail } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

type JsonRecord = Record<string, any>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' ? (value as JsonRecord) : null;
}

function stripValueError(message: string): string {
  return message.replace(/^Value error,\s*/i, '').trim();
}

export function extractFieldErrors(data: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const record = asRecord(data);
  const detail = record?.detail;
  if (!Array.isArray(detail)) return result;

  detail.forEach((item) => {
    const entry = asRecord(item);
    if (!entry) return;
    const location = Array.isArray(entry.loc) ? entry.loc : [];
    const field = location.filter((part) => part !== 'body' && part !== 'query').join('.');
    if (field && typeof entry.msg === 'string') {
      result[field] = stripValueError(entry.msg);
    }
  });

  return result;
}

export function extractConflictDetails(data: unknown): ConflictDetail | null {
  const record = asRecord(data);
  const detail = asRecord(record?.detail);
  if (!detail) return null;

  const conflict = asRecord(detail.conflict_details);
  if (!conflict) return null;

  const rawStatus = conflict.existing_status;
  const status: BookingStatus | undefined =
    rawStatus === 'PENDING' || rawStatus === 'APPROVED' || rawStatus === 'REJECTED'
      ? rawStatus
      : undefined;

  return {
    error: typeof detail.error === 'string' ? detail.error : 'JADWAL_BENTROK',
    message:
      typeof detail.message === 'string'
        ? detail.message
        : 'Slot waktu bertabrakan dengan agenda lain pada ruangan yang sama.',
    conflict_details: {
      conflicting_booking_id:
        typeof conflict.conflicting_booking_id === 'string'
          ? conflict.conflicting_booking_id
          : undefined,
      existing_status: status,
      existing_organization:
        typeof conflict.existing_organization === 'string'
          ? conflict.existing_organization
          : undefined,
      existing_start_time:
        typeof conflict.existing_start_time === 'string'
          ? conflict.existing_start_time
          : undefined,
      existing_end_time:
        typeof conflict.existing_end_time === 'string' ? conflict.existing_end_time : undefined,
      date: typeof conflict.date === 'string' ? conflict.date : undefined,
    },
  };
}

export function extractApiErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data;

  const record = asRecord(data);
  if (record) {
    const detail = record.detail;

    if (typeof detail === 'string' && detail.trim()) return detail;

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === 'string') return stripValueError(item);
          const entry = asRecord(item);
          return typeof entry?.msg === 'string' ? stripValueError(entry.msg) : null;
        })
        .filter((message): message is string => Boolean(message));
      if (messages.length) return messages.join(' • ');
    }

    const detailRecord = asRecord(detail);
    if (detailRecord) {
      if (typeof detailRecord.message === 'string') return detailRecord.message;
      if (typeof detailRecord.error === 'string') return detailRecord.error;
    }

    if (typeof record.message === 'string' && record.message.trim()) return record.message;
  }

  switch (status) {
    case 400:
      return 'Permintaan tidak dapat diproses. Periksa kembali data yang Anda isi.';
    case 401:
      return 'Sesi Anda tidak valid. Silakan masuk kembali.';
    case 403:
      return 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
    case 404:
      return 'Data yang diminta tidak ditemukan.';
    case 409:
      return 'Jadwal bertabrakan dengan peminjaman lain. Silakan pilih slot waktu berbeda.';
    case 422:
      return 'Data yang dikirim belum valid. Periksa kembali isian formulir.';
    case 500:
      return 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
    default:
      return `Permintaan gagal (HTTP ${status}).`;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.fieldErrors = extractFieldErrors(data);
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isValidation(): boolean {
    return this.status === 422;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');
  if (token) headers.set('X-User-Id', token);

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(
      0,
      'Tidak dapat terhubung ke layanan SIBIRU. Pastikan backend berjalan di port 8000.',
    );
  }

  const responseText = await response.text();
  let responseData: unknown = {};

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractApiErrorMessage(responseData, response.status),
      responseData,
    );
  }

  return responseData as T;
}
