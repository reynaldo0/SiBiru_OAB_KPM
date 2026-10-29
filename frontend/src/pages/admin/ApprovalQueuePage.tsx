import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useAdminBookings, useAdminMetrics } from '../../hooks/use-admin';
import { useRooms } from '../../hooks/use-rooms';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import type { Booking, BookingStatus } from '../../types';
import { DecisionDialog, type DecisionBooking } from '../../components/admin/DecisionDialog';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { ListRowSkeleton } from '../../components/ui/Skeleton';
import {
  formatDateLong,
  formatDateTimeShort,
  formatDayNumber,
  formatMonthShort,
  formatTime,
  isPastDate,
} from '../../lib/dates';
import { statusLabel } from '../../lib/utils';

type StatusFilter = 'ALL' | BookingStatus;
type DecisionMode = 'approve' | 'reject' | null;

interface DecisionState {
  booking: DecisionBooking | null;
  mode: DecisionMode;
}

const toneByStatus: Record<BookingStatus, { border: string; chip: string }> = {
  PENDING: { border: 'border-l-gold-400', chip: 'bg-gold-50 text-gold-700 border-gold-200' },
  APPROVED: { border: 'border-l-sibiru-500', chip: 'bg-sibiru-50 text-sibiru-700 border-sibiru-200' },
  REJECTED: { border: 'border-l-red-400', chip: 'bg-red-50 text-red-700 border-red-200' },
};

export const ApprovalQueuePage: React.FC = () => {
  const [status, setStatus] = useState<StatusFilter>('PENDING');
  const [search, setSearch] = useState('');
  const [roomId, setRoomId] = useState('ALL');
  const [decision, setDecision] = useState<DecisionState>({ booking: null, mode: null });

  const debouncedSearch = useDebouncedValue(search, 320);

  const { data: metrics } = useAdminMetrics();
  const { data: rooms } = useRooms();
  const filters = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : status,
      room_id: roomId === 'ALL' ? undefined : roomId,
      search: debouncedSearch.trim() || undefined,
    }),
    [status, roomId, debouncedSearch],
  );

  const {
    data: bookings,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminBookings(filters);

  const sorted = useMemo(() => {
    return [...(bookings ?? [])].sort((a, b) => {
      const rank: Record<BookingStatus, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
      if (a.status !== b.status) return rank[a.status] - rank[b.status];
      if (a.booking_date !== b.booking_date) return a.booking_date < b.booking_date ? 1 : -1;
      return b.start_time.localeCompare(a.start_time);
    });
  }, [bookings]);

  const hasFilters = Boolean(search.trim()) || roomId !== 'ALL' || status !== 'PENDING';

  const resetFilters = () => {
    setStatus('PENDING');
    setSearch('');
    setRoomId('ALL');
  };

  const statusCounts = {
    ALL: metrics?.total_bookings ?? 0,
    PENDING: metrics?.pending_count ?? 0,
    APPROVED: metrics?.approved_count ?? 0,
    REJECTED: metrics?.rejected_count ?? 0,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Antrean pengajuan</p>
          <h2 className="display-title mt-3 text-[clamp(1.85rem,3vw,2.6rem)]">
            Setiap permohonan, <span className="text-sibiru-600">keputusan yang jelas</span>.
          </h2>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-muted">
            Tinjau permohonan peminjaman, periksa bentrok jadwal, lalu catat keputusan pengelola.
            Riwayat keputusan langsung terlihat oleh peminjam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} isLoading={isFetching}>
            <RefreshCw size={14} />
            Segarkan
          </Button>
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-3.5 text-[0.6875rem] font-bold text-gold-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 font-mono text-[0.625rem] text-sibiru-900">
              {metrics?.pending_count ?? 0}
            </span>
            menunggu
          </span>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan antrean">
        {(
          [
            { key: 'ALL', label: 'Total pengajuan', icon: Users, tone: 'text-sibiru-500' },
            { key: 'PENDING', label: 'Menunggu', icon: Clock3, tone: 'text-gold-600' },
            { key: 'APPROVED', label: 'Disetujui', icon: CheckCircle2, tone: 'text-sibiru-500' },
            { key: 'REJECTED', label: 'Ditolak', icon: XCircle, tone: 'text-red-500' },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = status === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatus(item.key)}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-sibiru-300 bg-white shadow-subtle'
                  : 'border-ink-border bg-white/60 hover:border-sibiru-200 hover:bg-white'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  {item.label}
                </span>
                <Icon size={14} className={item.tone} />
              </span>
              <span className="mt-1.5 block font-mono text-2xl font-semibold text-ink-heading">
                {statusCounts[item.key]}
              </span>
              {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sibiru-500" />}
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-ink-border bg-white p-4 shadow-subtle sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama peminjam, organisasi, atau kegiatan…"
              className="input pl-9"
              aria-label="Cari pengajuan"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:bg-ink-soft hover:text-ink-heading"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              htmlFor="queue-room"
              className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted"
            >
              <Filter size={12} />
              Ruangan
            </label>
            <select
              id="queue-room"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className="input h-10 w-full py-0 text-[0.75rem] sm:w-52"
            >
              <option value="ALL">Semua ruangan</option>
              {rooms?.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 border-t border-ink-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl
            value={status}
            onChange={setStatus}
            ariaLabel="Filter status pengajuan"
            options={[
              { label: 'Semua', value: 'ALL', count: statusCounts.ALL },
              { label: 'Menunggu', value: 'PENDING', count: statusCounts.PENDING },
              { label: 'Disetujui', value: 'APPROVED', count: statusCounts.APPROVED },
              { label: 'Ditolak', value: 'REJECTED', count: statusCounts.REJECTED },
            ]}
          />

          <div className="flex items-center gap-3">
            <p className="font-mono text-[0.625rem] text-ink-muted">
              {sorted.length} catatan · waktu WIB
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <SlidersHorizontal size={12} />
                Reset filter
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {isLoading && [0, 1, 2].map((index) => <ListRowSkeleton key={index} />)}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800">
            <p className="font-bold">Antrean belum dapat dimuat</p>
            <p className="mt-1 text-xs leading-relaxed text-red-700">
              Pastikan sesi pengelola masih berlaku dan layanan backend aktif.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          </div>
        )}

        {!isLoading && !error && sorted.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={status === 'PENDING' ? 'Tidak ada pengajuan menunggu' : 'Tidak ada catatan yang cocok'}
            description={
              hasFilters
                ? 'Longgarkan filter status, ruangan, atau kata kunci untuk melihat pengajuan lain.'
                : 'Semua pengajuan telah diproses. Antrean baru akan tampil otomatis di sini.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  <X size={14} />
                  Atur ulang filter
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading &&
          sorted.map((booking) => (
            <QueueRow
              key={booking.id}
              booking={booking}
              onApprove={() => setDecision({ booking, mode: 'approve' })}
              onReject={() => setDecision({ booking, mode: 'reject' })}
            />
          ))}
      </div>

      <DecisionDialog
        booking={decision.booking}
        mode={decision.mode}
        onClose={() => setDecision({ booking: null, mode: null })}
      />
    </div>
  );
};

const QueueRow: React.FC<{
  booking: Booking;
  onApprove: () => void;
  onReject: () => void;
}> = ({ booking, onApprove, onReject }) => {
  const tone = toneByStatus[booking.status];
  const isPending = booking.status === 'PENDING';

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-l-2 border-ink-border bg-white shadow-subtle transition-shadow hover:shadow-card ${tone.border}`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-0">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-ink-border bg-ink-light">
            <span className="font-mono text-lg font-semibold leading-none text-sibiru-600">
              {formatDayNumber(booking.booking_date)}
            </span>
            <span className="mt-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              {formatMonthShort(booking.booking_date)}
            </span>
          </div>
          <span className="text-[0.625rem] font-medium text-ink-muted sm:mt-1.5">
            {isPastDate(booking.booking_date) ? 'Selesai' : 'Akan datang'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={booking.status}>{statusLabel(booking.status)}</Badge>
            <span className="inline-flex items-center gap-1 text-[0.625rem] font-semibold text-sibiru-700">
              <MapPin size={10} />
              {booking.room_name ?? booking.room_id}
            </span>
            <span className="font-mono text-[0.5625rem] text-ink-muted">#{booking.id.slice(-8)}</span>
          </div>

          <h3 className="mt-2 text-[0.9375rem] font-bold leading-snug text-ink-heading">
            {booking.purpose}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.6875rem] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sibiru-200 bg-sibiru-50 text-[0.5rem] font-bold text-sibiru-700">
                {booking.borrower_name.slice(0, 1)}
              </span>
              <span className="font-semibold text-ink-body">{booking.borrower_name}</span>
              <span>· {booking.organization}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} className="text-sibiru-500" />
              {formatDateLong(booking.booking_date)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Clock3 size={12} className="text-sibiru-500" />
              {formatTime(booking.start_time)}–{formatTime(booking.end_time)} WIB
            </span>
          </div>

          {booking.status === 'REJECTED' && booking.rejection_reason && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5 text-[0.6875rem] leading-relaxed text-red-900">
              <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-red-700">
                Alasan penolakan
              </span>
              <p className="mt-1">{booking.rejection_reason}</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <span
            className={`inline-flex items-center gap-1 self-start rounded-lg border px-2 py-1 text-[0.5625rem] font-semibold sm:self-end ${tone.chip}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {statusLabel(booking.status)}
          </span>
          <p className="font-mono text-[0.5625rem] text-ink-muted">
            {formatDateTimeShort(booking.created_at)}
          </p>
          {isPending && (
            <div className="mt-1 flex items-center gap-1.5">
              <Button variant="danger" size="sm" onClick={onReject}>
                <XCircle size={13} />
                Tolak
              </Button>
              <Button variant="primary" size="sm" onClick={onApprove}>
                <CheckCircle2 size={13} />
                Setujui
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
