import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DoorOpen,
  Filter,
  MapPin,
  RefreshCw,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useMasterSchedule } from '../../hooks/use-admin';
import { useRooms } from '../../hooks/use-rooms';
import type { BookingStatus, MasterScheduleItem } from '../../types';
import { MasterScheduleGrid } from '../../components/admin/MasterScheduleGrid';
import { DecisionDialog, type DecisionBooking } from '../../components/admin/DecisionDialog';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  addDaysISO,
  formatDateLong,
  formatTime,
  getWeekDates,
  formatWeekRange,
  todayISO,
} from '../../lib/dates';
import { statusLabel } from '../../lib/utils';

type StatusFilter = 'ALL' | BookingStatus;
type DecisionMode = 'approve' | 'reject' | null;

interface DecisionState {
  booking: DecisionBooking | null;
  mode: DecisionMode;
}

export const MasterSchedulePage: React.FC = () => {
  const [anchor, setAnchor] = useState(todayISO());
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selected, setSelected] = useState<MasterScheduleItem | null>(null);
  const [decision, setDecision] = useState<DecisionState>({ booking: null, mode: null });

  const weekDates = useMemo(() => getWeekDates(anchor), [anchor]);
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const { data: rooms, isLoading: isRoomsLoading, error: roomsError } = useRooms();
  const {
    data: schedule,
    isLoading: isScheduleLoading,
    isFetching,
    error: scheduleError,
    refetch,
  } = useMasterSchedule(startDate, endDate);

  const visibleRooms = useMemo(
    () =>
      [...(rooms ?? [])]
        .filter((room) => (roomFilter === 'ALL' ? true : room.id === roomFilter))
        .sort((a, b) => a.name.localeCompare(b.name, 'id')),
    [rooms, roomFilter],
  );

  const visibleItems = useMemo(
    () =>
      (schedule ?? []).filter((item) => {
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        if (roomFilter !== 'ALL' && item.room_id !== roomFilter) return false;
        return true;
      }),
    [schedule, statusFilter, roomFilter],
  );

  const summary = useMemo(() => {
    const list = schedule ?? [];
    return {
      total: visibleItems.length,
      pending: list.filter((item) => item.status === 'PENDING').length,
      approved: list.filter((item) => item.status === 'APPROVED').length,
      roomsWithAgenda: new Set(visibleItems.map((item) => item.room_id)).size,
    };
  }, [schedule, visibleItems]);

  const weekLabel = formatWeekRange(startDate, endDate);
  const isCurrentWeek = weekDates.includes(todayISO());

  const shiftWeek = (amount: number) => setAnchor(addDaysISO(anchor, amount * 7));

  const openDecision = (item: MasterScheduleItem, mode: Exclude<DecisionMode, null>) => {
    setDecision({ booking: item, mode });
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Master jadwal</p>
          <h2 className="display-title mt-3 text-[clamp(1.85rem,3vw,2.6rem)]">
            Alokasi ruang, <span className="text-sibiru-600">minggu demi minggu</span>.
          </h2>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-muted">
            Matriks ruangan dan hari memperlihatkan seluruh agenda. Klik salah satu agenda untuk
            memeriksa detail dan menindaklanjuti pengajuan yang masih menunggu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} isLoading={isFetching}>
            <RefreshCw size={14} />
            Segarkan
          </Button>
          <Button variant="subtle" onClick={() => setAnchor(todayISO())} disabled={isCurrentWeek}>
            <CalendarDays size={14} />
            Minggu ini
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan minggu">
        <SummaryTile
          label="Agenda tampil"
          value={summary.total}
          icon={CalendarRange}
          tone="teal"
        />
        <SummaryTile label="Menunggu" value={summary.pending} icon={Clock3} tone="gold" />
        <SummaryTile label="Disetujui" value={summary.approved} icon={CheckCircle2} tone="teal" />
        <SummaryTile label="Ruangan terpakai" value={summary.roomsWithAgenda} icon={DoorOpen} tone="neutral" />
      </section>

      <section className="rounded-2xl border border-ink-border bg-white p-4 shadow-subtle sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => shiftWeek(-1)}
              aria-label="Minggu sebelumnya"
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="min-w-[11rem] text-center">
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Rentang minggu
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-ink-heading">{weekLabel}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shiftWeek(1)}
              aria-label="Minggu berikutnya"
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label
                htmlFor="schedule-room"
                className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted"
              >
                <Filter size={12} />
                Ruangan
              </label>
              <select
                id="schedule-room"
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                className="input h-10 w-full py-0 text-[0.75rem] sm:w-48"
              >
                <option value="ALL">Semua ruangan</option>
                {rooms?.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="schedule-status"
                className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted"
              >
                Status
              </label>
              <select
                id="schedule-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="input h-10 w-full py-0 text-[0.75rem] sm:w-36"
              >
                <option value="ALL">Semua status</option>
                <option value="PENDING">Menunggu</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-border/70 pt-3">
          <div className="flex flex-wrap items-center gap-3 text-[0.5625rem] font-semibold text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-sibiru-200 bg-sibiru-50" />
              Disetujui
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-gold-200 bg-gold-50" />
              Menunggu
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-ink-border bg-ink-soft" />
              Kosong
            </span>
          </div>
          <span className="font-mono text-[0.5625rem] text-ink-muted">
            {visibleRooms.length} ruangan · {visibleItems.length} agenda · WIB
          </span>
        </div>
      </section>

      {(isRoomsLoading || isScheduleLoading) && (
        <div className="space-y-2 rounded-2xl border border-ink-border bg-white p-4">
          <Skeleton className="h-10 w-full" />
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isRoomsLoading && !isScheduleLoading && (roomsError || scheduleError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800">
          <p className="font-bold">Master jadwal belum dapat dimuat</p>
          <p className="mt-1 text-xs leading-relaxed text-red-700">
            Pastikan layanan backend aktif dan sesi pengelola masih berlaku.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      {!isRoomsLoading && !isScheduleLoading && !roomsError && !scheduleError && (
        <MasterScheduleGrid
          rooms={visibleRooms}
          items={visibleItems}
          dates={weekDates}
          onSelect={setSelected}
        />
      )}

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        eyebrow="Detail agenda"
        title={selected?.purpose ?? 'Agenda ruangan'}
        description={selected ? formatDateLong(selected.booking_date) : undefined}
        maxWidth="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={selected.status}>{statusLabel(selected.status)}</Badge>
              <span className="inline-flex items-center gap-1 rounded-full border border-ink-border bg-ink-soft px-2 py-1 text-[0.5625rem] font-semibold text-ink-body">
                <MapPin size={10} />
                {selected.room_name}
              </span>
              <span className="font-mono text-[0.5625rem] text-ink-muted">#{selected.id.slice(-8)}</span>
            </div>

            <div className="grid gap-2 rounded-2xl border border-ink-border bg-ink-light/60 p-4 text-[0.6875rem] text-ink-muted sm:grid-cols-2">
              <DetailRow icon={CalendarDays} label="Tanggal" value={formatDateLong(selected.booking_date)} />
              <DetailRow
                icon={Clock3}
                label="Waktu"
                value={`${formatTime(selected.start_time)}–${formatTime(selected.end_time)} WIB`}
              />
              <DetailRow icon={UserRound} label="Peminjam" value={selected.borrower_name} />
              <DetailRow icon={DoorOpen} label="Organisasi" value={selected.organization} />
            </div>

            <div className="rounded-xl border border-ink-border bg-white px-4 py-3">
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                Kegiatan
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-body">{selected.purpose}</p>
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex flex-col-reverse gap-2 border-t border-ink-border/80 pt-4 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Tutup
                </Button>
                <Button variant="danger" onClick={() => openDecision(selected, 'reject')}>
                  <XCircle size={14} />
                  Tolak
                </Button>
                <Button variant="primary" onClick={() => openDecision(selected, 'approve')}>
                  <CheckCircle2 size={14} />
                  Setujui
                </Button>
              </div>
            )}

            {selected.status !== 'PENDING' && (
              <div className="flex justify-end border-t border-ink-border/80 pt-4">
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Tutup
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <DecisionDialog
        booking={decision.booking}
        mode={decision.mode}
        onClose={() => setDecision({ booking: null, mode: null })}
      />
    </div>
  );
};

const SummaryTile: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'teal' | 'gold' | 'neutral';
}> = ({ label, value, icon: Icon, tone }) => {
  const toneClasses = {
    teal: 'border-sibiru-100 bg-sibiru-50 text-sibiru-600',
    gold: 'border-gold-200 bg-gold-50 text-gold-700',
    neutral: 'border-ink-border bg-ink-soft text-ink-body',
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-border bg-white p-4 shadow-subtle">
      <div>
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold text-ink-heading">{value}</p>
      </div>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>
        <Icon size={17} strokeWidth={1.8} />
      </span>
    </div>
  );
};

const DetailRow: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-2">
      <Icon size={13} className="mt-0.5 shrink-0 text-sibiru-500" />
      <div className="min-w-0">
        <p className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
        <p className="mt-0.5 truncate font-medium text-ink-body">{value}</p>
      </div>
    </div>
  );
};
