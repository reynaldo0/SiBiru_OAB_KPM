import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Hourglass,
  MapPin,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useMyBookings } from '../hooks/use-bookings';
import { useAuthStore } from '../store/auth.store';
import type { Booking, BookingStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { ListRowSkeleton } from '../components/ui/Skeleton';
import {
  formatDateLong,
  formatDateTimeShort,
  formatDayNumber,
  formatMonthShort,
  formatTime,
  isPastDate,
  todayISO,
} from '../lib/dates';
import { statusLabel } from '../lib/utils';

type StatusFilter = 'ALL' | BookingStatus;
type BookingTone = 'pending' | 'approved' | 'rejected';

const statusTone: Record<BookingStatus, BookingTone> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const toneClasses: Record<BookingTone, { border: string; icon: string; soft: string }> = {
  pending: {
    border: 'border-l-gold-400',
    icon: 'bg-gold-50 text-gold-700 border-gold-200',
    soft: 'bg-gold-50/60',
  },
  approved: {
    border: 'border-l-sibiru-500',
    icon: 'bg-sibiru-50 text-sibiru-600 border-sibiru-200',
    soft: 'bg-sibiru-50/60',
  },
  rejected: {
    border: 'border-l-red-400',
    icon: 'bg-red-50 text-red-600 border-red-200',
    soft: 'bg-red-50/60',
  },
};

const statusIcon: Record<BookingStatus, React.ElementType> = {
  PENDING: Hourglass,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

export const MyBookingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data: bookings, isLoading, error, refetch, isFetching } = useMyBookings();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const counts = useMemo(() => {
    const list = bookings ?? [];
    return {
      ALL: list.length,
      PENDING: list.filter((item) => item.status === 'PENDING').length,
      APPROVED: list.filter((item) => item.status === 'APPROVED').length,
      REJECTED: list.filter((item) => item.status === 'REJECTED').length,
    } satisfies Record<StatusFilter, number>;
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    const list = [...(bookings ?? [])].sort((a, b) => {
      if (a.booking_date !== b.booking_date) return a.booking_date < b.booking_date ? 1 : -1;
      return a.start_time < b.start_time ? 1 : -1;
    });
    return filter === 'ALL' ? list : list.filter((item) => item.status === filter);
  }, [bookings, filter]);

  return (
    <div className="page-container py-10 sm:py-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Pengajuan saya</p>
          <h1 className="display-title mt-4 text-[clamp(2rem,4.2vw,3.1rem)]">
            Pantau setiap <span className="text-sibiru-600">keputusan</span>.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            {user
              ? `Riwayat permohonan untuk ${user.name} · ${user.organization}. Status diperbarui langsung dari pengelola fasilitas.`
              : 'Riwayat permohonan peminjaman ruangan Anda.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} isLoading={isFetching}>
            <RefreshCw size={14} />
            Segarkan
          </Button>
          <Link
            to="/katalog"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-sibiru-500 px-4 text-[0.8125rem] font-semibold text-white shadow-subtle transition-colors hover:bg-sibiru-600"
          >
            <Plus size={15} />
            Pengajuan baru
          </Link>
        </div>
      </header>

      {/* Count strip */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { key: 'ALL', label: 'Total pengajuan', icon: ClipboardList, tone: 'teal' },
            { key: 'PENDING', label: 'Menunggu', icon: Hourglass, tone: 'gold' },
            { key: 'APPROVED', label: 'Disetujui', icon: CheckCircle2, tone: 'teal' },
            { key: 'REJECTED', label: 'Ditolak', icon: XCircle, tone: 'red' },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-xl border p-3.5 text-left transition-all ${
                active
                  ? 'border-sibiru-300 bg-white shadow-subtle'
                  : 'border-ink-border bg-white/60 hover:border-sibiru-200 hover:bg-white'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  {item.label}
                </span>
                <Icon
                  size={14}
                  className={
                    item.tone === 'gold'
                      ? 'text-gold-600'
                      : item.tone === 'red'
                        ? 'text-red-500'
                        : 'text-sibiru-500'
                  }
                />
              </span>
              <span className="mt-1.5 block font-mono text-2xl font-semibold text-ink-heading">
                {isLoading ? '—' : counts[item.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter status pengajuan"
          options={[
            { label: 'Semua', value: 'ALL', count: counts.ALL },
            { label: 'Menunggu', value: 'PENDING', count: counts.PENDING },
            { label: 'Disetujui', value: 'APPROVED', count: counts.APPROVED },
            { label: 'Ditolak', value: 'REJECTED', count: counts.REJECTED },
          ]}
        />
        <p className="font-mono text-[0.625rem] text-ink-muted">
          {visibleBookings.length} catatan · waktu WIB
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading &&
          [0, 1, 2].map((index) => <ListRowSkeleton key={index} />)}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-800">
            <p className="font-bold">Riwayat belum dapat dimuat</p>
            <p className="mt-1 text-xs leading-relaxed text-red-700">
              Pastikan sesi Anda masih berlaku dan layanan backend aktif.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          </div>
        )}

        {!isLoading && !error && visibleBookings.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title={
              filter === 'ALL'
                ? 'Belum ada pengajuan'
                : `Tidak ada pengajuan berstatus ${statusLabel(filter).toLowerCase()}`
            }
            description={
              filter === 'ALL'
                ? 'Mulai dari katalog ruangan, periksa slot yang tersedia, lalu kirim permohonan pertama Anda.'
                : 'Ubah filter status untuk melihat catatan pengajuan lainnya.'
            }
            action={
              filter === 'ALL' ? (
                <Link
                  to="/katalog"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-sibiru-500 px-4 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-sibiru-600"
                >
                  Jelajahi katalog
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Button variant="outline" onClick={() => setFilter('ALL')}>
                  Lihat semua pengajuan
                </Button>
              )
            }
          />
        )}

        {visibleBookings.map((booking) => (
          <BookingHistoryCard key={booking.id} booking={booking} />
        ))}
      </div>

      {!isLoading && (bookings?.length ?? 0) > 0 && (
        <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-ink-border bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold text-ink-heading">Butuh ruang untuk agenda berikutnya?</p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
              Katalog diperbarui mengikuti jadwal terbaru dari pengelola.
            </p>
          </div>
          <Link
            to="/katalog"
            className="group inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-sibiru-600"
          >
            Buka katalog ruangan
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      )}
    </div>
  );
};

const BookingHistoryCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const tone = statusTone[booking.status];
  const Icon = statusIcon[booking.status];

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-l-2 border-ink-border bg-white shadow-subtle transition-shadow hover:shadow-card ${
        toneClasses[tone].border
      }`}
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
            {isPastDate(booking.booking_date)
              ? 'Selesai'
              : booking.booking_date === todayISO()
                ? 'Hari ini'
                : 'Akan datang'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={booking.status}>{statusLabel(booking.status)}</Badge>
            {booking.room_name && (
              <Link
                to={`/ruangan/${booking.room_id}`}
                className="inline-flex items-center gap-1 text-[0.625rem] font-semibold text-sibiru-600 hover:text-sibiru-700"
              >
                <MapPin size={10} />
                {booking.room_name}
              </Link>
            )}
            <span className="font-mono text-[0.5625rem] text-ink-muted">#{booking.id.slice(-8)}</span>
          </div>

          <h2 className="mt-2 text-[0.9375rem] font-bold leading-snug text-ink-heading">
            {booking.purpose}
          </h2>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.6875rem] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} className="text-sibiru-500" />
              {formatDateLong(booking.booking_date)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Clock3 size={12} className="text-sibiru-500" />
              {formatTime(booking.start_time)}–{formatTime(booking.end_time)} WIB
            </span>
            <span className="truncate">{booking.organization}</span>
          </div>

          {booking.status === 'REJECTED' && booking.rejection_reason && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5 text-[0.6875rem] leading-relaxed text-red-900">
              <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-red-700">
                Alasan penolakan
              </span>
              <p className="mt-1">{booking.rejection_reason}</p>
            </div>
          )}

          {booking.status === 'PENDING' && (
            <div className="mt-3 rounded-xl border border-gold-200 bg-gold-50/70 px-3 py-2.5 text-[0.6875rem] leading-relaxed text-gold-900">
              Menunggu verifikasi pengelola. Slot ini sudah tercatat dan tidak dapat diajukan oleh
              pihak lain.
            </div>
          )}
        </div>

        <div className={`flex shrink-0 items-center gap-2 rounded-xl border p-2 sm:flex-col sm:items-end sm:border-0 sm:bg-transparent ${toneClasses[tone].soft} sm:p-0`}>
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneClasses[tone].icon}`}>
            <Icon size={15} />
          </span>
          <div className="text-left sm:text-right">
            <p className="text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              Diajukan
            </p>
            <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-body">
              {formatDateTimeShort(booking.created_at)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};
