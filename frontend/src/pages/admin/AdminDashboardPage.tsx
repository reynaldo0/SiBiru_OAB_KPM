import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  Hourglass,
  Inbox,
  LayoutGrid,
  MapPin,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useAdminBookings, useAdminMetrics, useMasterSchedule } from '../../hooks/use-admin';
import type { Booking } from '../../types';
import { DecisionDialog, type DecisionBooking } from '../../components/admin/DecisionDialog';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ListRowSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { formatDateLong, formatDayShort, formatTime, todayISO } from '../../lib/dates';
import { statusLabel } from '../../lib/utils';

type DecisionMode = 'approve' | 'reject' | null;

interface DecisionState {
  booking: DecisionBooking | null;
  mode: DecisionMode;
}

export const AdminDashboardPage: React.FC = () => {
  const today = todayISO();
  const { data: metrics, isLoading: isMetricsLoading } = useAdminMetrics();
  const {
    data: pendingBookings,
    isLoading: isPendingLoading,
    error: pendingError,
  } = useAdminBookings({ status: 'PENDING' });
  const {
    data: todaySchedule,
    isLoading: isScheduleLoading,
  } = useMasterSchedule(today, today);

  const [decision, setDecision] = useState<DecisionState>({ booking: null, mode: null });

  const pendingPreview = useMemo(
    () =>
      [...(pendingBookings ?? [])]
        .sort((a, b) => {
          if (a.booking_date !== b.booking_date) return a.booking_date < b.booking_date ? -1 : 1;
          return a.start_time.localeCompare(b.start_time);
        })
        .slice(0, 5),
    [pendingBookings],
  );

  const agenda = useMemo(
    () =>
      [...(todaySchedule ?? [])].sort((a, b) => {
        if (a.start_time !== b.start_time) return a.start_time.localeCompare(b.start_time);
        return (a.room_name ?? '').localeCompare(b.room_name ?? '', 'id');
      }),
    [todaySchedule],
  );

  const approvedToday = metrics?.today_bookings_count ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Ringkasan operasional</p>
          <h2 className="display-title mt-3 text-[clamp(1.85rem,3vw,2.6rem)]">
            Kendali ruang dalam <span className="text-sibiru-600">satu pandangan</span>.
          </h2>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-muted">
            Prioritas hari ini: selesaikan antrean pengajuan, pastikan agenda berjalan tanpa bentrok,
            dan jaga ketersediaan fasilitas tetap akurat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/jadwal"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-borderStrong bg-white px-4 text-[0.8125rem] font-semibold text-sibiru-700 transition-colors hover:border-sibiru-300 hover:bg-sibiru-50"
          >
            <CalendarClock size={15} />
            Master jadwal
          </Link>
          <Link
            to="/admin/antrean"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-sibiru-500 px-4 text-[0.8125rem] font-semibold text-white shadow-subtle transition-colors hover:bg-sibiru-600"
          >
            <ClipboardCheck size={15} />
            Buka antrean
            {typeof metrics?.pending_count === 'number' && metrics.pending_count > 0 && (
              <span className="rounded-full bg-gold-400 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-sibiru-900">
                {metrics.pending_count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indikator utama">
        <StatCard
          label="Menunggu keputusan"
          value={isMetricsLoading ? '—' : (metrics?.pending_count ?? 0)}
          hint={metrics?.pending_count ? 'Perlu ditinjau sesegera mungkin' : 'Antrean bersih'}
          icon={Hourglass}
          tone="gold"
          animate
        />
        <StatCard
          label="Disetujui"
          value={isMetricsLoading ? '—' : (metrics?.approved_count ?? 0)}
          hint="Total agenda yang telah diverifikasi"
          icon={CheckCircle2}
          tone="teal"
          animate
        />
        <StatCard
          label="Agenda hari ini"
          value={isMetricsLoading ? '—' : approvedToday}
          hint={formatDateLong(today)}
          icon={CalendarCheck2}
          tone="neutral"
          animate
        />
        <StatCard
          label="Ruangan aktif"
          value={
            isMetricsLoading
              ? '—'
              : `${metrics?.active_rooms ?? 0}/${metrics?.total_rooms ?? 0}`
          }
          hint="Fasilitas yang tampil di katalog"
          icon={DoorOpen}
          tone="teal"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-ink-border bg-white shadow-subtle">
          <div className="flex items-start justify-between gap-4 border-b border-ink-border/80 px-5 py-4">
            <div>
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-gold-700">
                Antrean prioritas
              </p>
              <h3 className="mt-1 text-sm font-bold text-ink-heading">Pengajuan menunggu keputusan</h3>
            </div>
            <Link
              to="/admin/antrean"
              className="group inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-bold text-sibiru-600 hover:text-sibiru-700"
            >
              Lihat semua
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="divide-y divide-ink-border/70">
            {isPendingLoading &&
              [0, 1, 2].map((index) => (
                <div key={index} className="px-4 py-4">
                  <ListRowSkeleton />
                </div>
              ))}

            {!isPendingLoading && pendingError && (
              <div className="px-5 py-8 text-center">
                <p className="text-xs font-bold text-red-800">Antrean belum dapat dimuat</p>
                <p className="mt-1 text-[0.6875rem] text-red-700">
                  Periksa koneksi backend, lalu muat ulang halaman.
                </p>
              </div>
            )}

            {!isPendingLoading && !pendingError && pendingPreview.length === 0 && (
              <EmptyState
                compact
                className="m-4"
                icon={Inbox}
                title="Antrean bersih"
                description="Semua pengajuan sudah diproses. Antrean baru akan muncul di sini secara otomatis."
              />
            )}

            {pendingPreview.map((booking) => (
              <PendingRow
                key={booking.id}
                booking={booking}
                onApprove={() => setDecision({ booking, mode: 'approve' })}
                onReject={() => setDecision({ booking, mode: 'reject' })}
              />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-ink-border bg-white shadow-subtle">
          <div className="flex items-start justify-between gap-4 border-b border-ink-border/80 px-5 py-4">
            <div>
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-sibiru-600">
                Agenda berjalan
              </p>
              <h3 className="mt-1 text-sm font-bold text-ink-heading">Jadwal hari ini</h3>
              <p className="mt-1 font-mono text-[0.5625rem] text-ink-muted">{formatDateLong(today)}</p>
            </div>
            <Link
              to="/admin/jadwal"
              className="group inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-bold text-sibiru-600 hover:text-sibiru-700"
            >
              Seminggu
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="p-4">
            {isScheduleLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-[4.25rem]" />
                ))}
              </div>
            ) : agenda.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarCheck2}
                title="Tidak ada agenda"
                description="Belum ada peminjaman terjadwal untuk hari ini."
              />
            ) : (
              <ol className="relative space-y-2 before:absolute before:bottom-2 before:left-[2.55rem] before:top-2 before:w-px before:bg-ink-border">
                {agenda.map((item) => (
                  <li key={item.id} className="relative flex gap-3">
                    <div className="relative z-10 flex w-16 shrink-0 flex-col items-end pt-2.5">
                      <span className="font-mono text-[0.6875rem] font-semibold text-sibiru-700">
                        {formatTime(item.start_time)}
                      </span>
                      <span className="mt-0.5 font-mono text-[0.5rem] text-ink-muted">
                        {formatTime(item.end_time)}
                      </span>
                    </div>
                    <div
                      className={`flex-1 rounded-xl border p-2.5 ${
                        item.status === 'APPROVED'
                          ? 'border-sibiru-100 bg-sibiru-50/60'
                          : 'border-gold-200 bg-gold-50/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-[0.6875rem] font-bold text-ink-heading">
                          {item.organization}
                        </span>
                        <Badge status={item.status} className="px-1.5 py-0.5 text-[0.5rem]">
                          {statusLabel(item.status)}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[0.625rem] text-ink-muted">{item.purpose}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[0.5625rem] font-semibold text-sibiru-700">
                        <MapPin size={9} />
                        {item.room_name}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickAction
          to="/admin/antrean"
          icon={ClipboardCheck}
          kicker="Peminjaman"
          title="Tinjau antrean"
          description="Setujui atau tolak pengajuan dengan pemeriksaan bentrok otomatis."
          meta={`${metrics?.pending_count ?? 0} pengajuan menunggu`}
          highlight
        />
        <QuickAction
          to="/admin/jadwal"
          icon={CalendarClock}
          kicker="Jadwal & alokasi"
          title="Susun master jadwal"
          description="Lihat matriks ruangan × hari untuk memastikan alokasi tetap rapi."
          meta="Tampilan mingguan"
        />
        <QuickAction
          to="/admin/ruangan"
          icon={LayoutGrid}
          kicker="Fasilitas"
          title="Kelola master ruangan"
          description="Perbarui kapasitas, fasilitas, ilustrasi, dan status operasional."
          meta={`${metrics?.active_rooms ?? 0} ruangan aktif`}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-sibiru-100 bg-gradient-to-br from-sibiru-50 via-white to-gold-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sibiru-200 bg-white text-sibiru-600">
            <ShieldCheck size={18} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink-heading">Keputusan pengelola tercatat permanen</p>
            <p className="mt-0.5 max-w-xl text-[0.6875rem] leading-relaxed text-ink-muted">
              Penyelesaian antrean langsung memperbarui ketersediaan katalog publik. Pastikan setiap
              persetujuan mempertimbangkan potensi bentrok.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 text-[0.625rem] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users size={12} className="text-sibiru-500" />
            {metrics?.total_bookings ?? 0} total pengajuan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={12} className="text-sibiru-500" />
            Waktu WIB
          </span>
        </div>
      </section>

      <DecisionDialog
        booking={decision.booking}
        mode={decision.mode}
        onClose={() => setDecision({ booking: null, mode: null })}
      />
    </div>
  );
};

const PendingRow: React.FC<{
  booking: Booking;
  onApprove: () => void;
  onReject: () => void;
}> = ({ booking, onApprove, onReject }) => {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-ink-light/60 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-gold-200 bg-gold-50">
        <span className="font-mono text-sm font-semibold leading-none text-gold-800">
          {booking.booking_date.slice(8, 10)}
        </span>
        <span className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-gold-700">
          {formatDayShort(booking.booking_date)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[0.6875rem] font-bold text-ink-heading">{booking.organization}</span>
          <span className="text-[0.625rem] text-ink-muted">· {booking.borrower_name}</span>
        </div>
        <p className="mt-0.5 truncate text-[0.6875rem] font-medium text-ink-body">{booking.purpose}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.5625rem] text-ink-muted">
          <span className="inline-flex items-center gap-1 font-semibold text-sibiru-700">
            <MapPin size={9} />
            {booking.room_name ?? booking.room_id}
          </span>
          <span className="inline-flex items-center gap-1 font-mono">
            <Clock3 size={9} />
            {formatTime(booking.start_time)}–{formatTime(booking.end_time)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="danger" size="sm" onClick={onReject} aria-label="Tolak pengajuan">
          <XCircle size={13} />
          Tolak
        </Button>
        <Button variant="primary" size="sm" onClick={onApprove} aria-label="Setujui pengajuan">
          <CheckCircle2 size={13} />
          Setujui
        </Button>
      </div>
    </div>
  );
};

const QuickAction: React.FC<{
  to: string;
  icon: React.ElementType;
  kicker: string;
  title: string;
  description: string;
  meta: string;
  highlight?: boolean;
}> = ({ to, icon: Icon, kicker, title, description, meta, highlight }) => {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-card ${
        highlight
          ? 'border-sibiru-200 bg-sibiru-900 text-white'
          : 'border-ink-border bg-white text-ink-heading shadow-subtle'
      }`}
    >
      {highlight && (
        <span className="pointer-events-none absolute inset-0 opacity-[0.08] bg-dot-grid" aria-hidden="true" />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
            highlight ? 'border-white/15 bg-white/10 text-gold-300' : 'border-sibiru-100 bg-sibiru-50 text-sibiru-600'
          }`}
        >
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <ArrowRight
          size={16}
          className={`transition-transform group-hover:translate-x-0.5 ${
            highlight ? 'text-white/40' : 'text-ink-muted'
          }`}
        />
      </div>
      <span
        className={`relative mt-4 block text-[0.5625rem] font-bold uppercase tracking-[0.14em] ${
          highlight ? 'text-gold-300' : 'text-sibiru-600'
        }`}
      >
        {kicker}
      </span>
      <h3 className="relative mt-1 text-sm font-bold">{title}</h3>
      <p
        className={`relative mt-1.5 text-[0.6875rem] leading-relaxed ${
          highlight ? 'text-white/55' : 'text-ink-muted'
        }`}
      >
        {description}
      </p>
      <span
        className={`relative mt-3 inline-flex items-center gap-1 font-mono text-[0.5625rem] ${
          highlight ? 'text-white/40' : 'text-ink-muted'
        }`}
      >
        {meta}
      </span>
    </Link>
  );
};
