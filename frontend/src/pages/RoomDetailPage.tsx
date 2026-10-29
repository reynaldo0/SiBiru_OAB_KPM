import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRoomAvailability, useRoomDetail, useRooms } from '../hooks/use-rooms';
import { useAuthStore } from '../store/auth.store';
import { AvailabilityTimeline } from '../components/timeline/AvailabilityTimeline';
import { ConflictNotice, detectConflict } from '../components/booking/ConflictNotice';
import { BookingModal } from '../components/booking/BookingModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DateStepper } from '../components/ui/DateStepper';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenLoader } from '../components/layout/LoadingDots';
import {
  OPERATING_HOURS_LABEL,
  durationLabel,
  formatDateLong,
  formatTime,
  todayISO,
} from '../lib/dates';
import { isLabRoom, roomCategory, roomImage } from '../lib/utils';

export const RoomDetailPage: React.FC = () => {
  const { roomId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: room, isLoading, error } = useRoomDetail(roomId);
  const { data: otherRooms } = useRooms({ is_active_only: true });

  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: availability, isLoading: isAvailabilityLoading } = useRoomAvailability(
    roomId,
    date,
  );

  const bookedIntervals = useMemo(
    () => availability?.booked_intervals ?? [],
    [availability?.booked_intervals],
  );

  useEffect(() => {
    setStartTime('09:00');
    setEndTime('11:00');
  }, [roomId]);

  const conflicts = detectConflict(startTime, endTime, bookedIntervals);
  const validRange = startTime < endTime;
  const isSlotFree = validRange && conflicts.length === 0;

  const alternatives = (otherRooms ?? [])
    .filter((item) => item.id !== roomId)
    .slice(0, 3);

  if (isLoading) return <ScreenLoader label="Memuat detail ruangan" />;

  if (error || !room) {
    return (
      <div className="page-container py-16">
        <EmptyState
          icon={Info}
          title="Ruangan tidak ditemukan"
          description="Data ruangan mungkin telah dihapus atau tautan yang Anda buka tidak valid."
          action={
            <Button variant="primary" onClick={() => navigate('/katalog')}>
              <ArrowLeft size={14} />
              Kembali ke katalog
            </Button>
          }
        />
      </div>
    );
  }

  const handlePrimaryAction = () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/ruangan/${room.id}`)}`);
      return;
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="page-container py-8 sm:py-10">
      <nav className="flex items-center gap-1.5 font-mono text-[0.625rem] text-ink-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-sibiru-600">
          Beranda
        </Link>
        <span className="text-ink-borderStrong">/</span>
        <Link to="/katalog" className="transition-colors hover:text-sibiru-600">
          Katalog
        </Link>
        <span className="text-ink-borderStrong">/</span>
        <span className="truncate text-ink-heading">{room.name}</span>
      </nav>

      <header className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-sibiru-600 px-2 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-white">
              {roomCategory(room)}
            </span>
            <Badge variant={room.is_active ? 'approved' : 'inactive'}>
              {room.is_active ? 'Dapat dipinjam' : 'Nonaktif'}
            </Badge>
            {isLabRoom(room) && <Badge variant="facility">Praktikum</Badge>}
          </div>

          <h1 className="display-title mt-4 text-[clamp(2rem,4.2vw,3.2rem)]">{room.name}</h1>

          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin size={15} className="text-sibiru-500" />
            {room.location}
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-ink-body">
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="text-sibiru-500" />
              Kapasitas {room.capacity} orang
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} className="text-sibiru-500" />
              {OPERATING_HOURS_LABEL}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-sibiru-500" />
              Proteksi bentrok
            </span>
          </div>

          <p className="mt-5 max-w-lg text-[0.8125rem] leading-relaxed text-ink-muted">
            {isLabRoom(room)
              ? 'Ruang laboratorium dilengkapi perangkat praktikum dan jaringan internal. Pastikan kebutuhan daya serta perangkat tambahan telah dikoordinasikan dengan pengelola.'
              : 'Ruang akademik serbaguna untuk kuliah, seminar, rapat, dan kegiatan organisasi. Ketersediaan diperbarui langsung dari jadwal peminjaman kampus.'}
          </p>
        </div>

        <div className="relative">
          <div className="room-art relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-3xl border border-ink-border p-8 shadow-subtle">
            <span
              className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full border border-sibiru-500/10"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-10 right-8 h-28 w-28 rounded-full bg-gold-400/25"
              aria-hidden="true"
            />
            <img
              src={roomImage(room)}
              alt={room.name}
              className="relative z-10 max-h-[17rem] w-auto object-contain drop-shadow-[0_22px_34px_rgba(0,42,43,0.14)]"
            />
            <span className="absolute bottom-4 left-5 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-sibiru-700/50">
              {room.id}
            </span>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink-border bg-white p-4 shadow-subtle sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-sibiru-600">
                  Ketersediaan ruangan
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em] text-ink-heading">
                  Pilih rentang waktu
                </h2>
              </div>
              <DateStepper value={date} onChange={setDate} />
            </div>

            <AvailabilityTimeline
              date={date}
              bookedIntervals={bookedIntervals}
              selectedStart={startTime}
              selectedEnd={endTime}
              onSelectRange={(start, end) => {
                setStartTime(start);
                setEndTime(end);
              }}
              interactive
              isLoading={isAvailabilityLoading}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
                  Jam mulai
                </span>
                <input
                  type="time"
                  step={900}
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="input input-mono"
                  min="07:00"
                  max="21:00"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
                  Jam selesai
                </span>
                <input
                  type="time"
                  step={900}
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="input input-mono"
                  min="07:00"
                  max="21:00"
                />
              </label>
            </div>

            <div className="mt-4">
              <ConflictNotice
                bookedIntervals={bookedIntervals}
                startTime={startTime}
                endTime={endTime}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-border bg-white p-4 shadow-subtle sm:p-6">
            <p className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-sibiru-600">
              Fasilitas ruangan
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em] text-ink-heading">
              Yang tersedia di dalam
            </h2>

            {room.facilities.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {room.facilities.map((facility) => (
                  <li
                    key={facility}
                    className="flex items-center gap-2.5 rounded-xl border border-ink-border bg-ink-light/60 px-3 py-2.5 text-xs text-ink-body"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sibiru-50 text-sibiru-600">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    {facility}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-ink-muted">
                Daftar fasilitas belum dicatat oleh pengelola.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gold-200 bg-gold-50/60 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold-200 bg-white text-gold-700">
                <Info size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-gold-900">Sebelum mengajukan</p>
                <ul className="mt-2 space-y-1.5 text-[0.6875rem] leading-relaxed text-gold-900/80">
                  <li>• Pastikan slot tidak bertabrakan dengan agenda berstatus menunggu.</li>
                  <li>• Sertakan nama kegiatan yang spesifik agar mudah diverifikasi.</li>
                  <li>• Pengajuan berstatus menunggu hingga pengelola memberi keputusan.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky booking summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-ink-border bg-white shadow-card">
            <div className="border-b border-ink-border bg-ink-light/70 px-5 py-4">
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-sibiru-600">
                Ringkasan pengajuan
              </p>
              <p className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] text-ink-heading">
                {room.name}
              </p>
            </div>

            <div className="space-y-3.5 px-5 py-5">
              <SummaryRow icon={CalendarDays} label="Tanggal" value={formatDateLong(date)} />
              <SummaryRow
                icon={Clock3}
                label="Waktu"
                value={`${formatTime(startTime)} – ${formatTime(endTime)} WIB`}
              />
              <SummaryRow
                icon={ShieldCheck}
                label="Durasi"
                value={validRange ? durationLabel(startTime, endTime) : 'Belum valid'}
              />
              <SummaryRow icon={Users} label="Kapasitas" value={`${room.capacity} orang`} />

              <div
                className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[0.6875rem] leading-relaxed ${
                  !validRange
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : isSlotFree
                      ? 'border-sibiru-200 bg-sibiru-50 text-sibiru-800'
                      : 'border-gold-200 bg-gold-50 text-gold-900'
                }`}
              >
                {isSlotFree ? (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sibiru-500" />
                ) : (
                  <Info size={14} className="mt-0.5 shrink-0" />
                )}
                <span>
                  {!validRange
                    ? 'Jam selesai harus lebih besar daripada jam mulai.'
                    : isSlotFree
                      ? 'Slot tersedia. Lanjutkan untuk mengisi detail kegiatan.'
                      : `${conflicts.length} agenda bertabrakan pada rentang ini. Pilih waktu lain.`}
                </span>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={!room.is_active || !isSlotFree}
                onClick={handlePrimaryAction}
              >
                {user ? 'Ajukan peminjaman' : 'Masuk untuk mengajukan'}
                <ArrowRight size={16} />
              </Button>

              <p className="text-center text-[0.625rem] leading-relaxed text-ink-muted">
                {user
                  ? `Diajukan sebagai ${user.name} · ${user.organization}`
                  : 'Informasi ruang dapat dibaca tanpa akun.'}
              </p>
            </div>

            <div className="border-t border-ink-border bg-ink-light/50 px-5 py-3">
              <Link
                to="/katalog"
                className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-muted transition-colors hover:text-sibiru-600"
              >
                <ArrowLeft size={13} />
                Bandingkan ruangan lain
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {alternatives.length > 0 && (
        <section className="mt-12 border-t border-ink-border pt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Ruang lain</p>
              <h2 className="section-title mt-2 text-2xl">Pertimbangkan alternatif ini.</h2>
            </div>
            <Link
              to="/katalog"
              className="group inline-flex items-center gap-1.5 text-[0.6875rem] font-bold text-sibiru-600"
            >
              Semua ruangan
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {alternatives.map((item) => (
              <Link
                key={item.id}
                to={`/ruangan/${item.id}`}
                className="group flex items-center gap-3 rounded-xl border border-ink-border bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-sibiru-200 hover:shadow-card"
              >
                <span className="room-art flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-border">
                  <img
                    src={roomImage(item)}
                    alt={item.name}
                    loading="lazy"
                    className="max-h-11 w-auto object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.75rem] font-bold text-ink-heading">
                    {item.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[0.625rem] text-ink-muted">
                    <Users size={10} />
                    {item.capacity} orang · {item.location}
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sibiru-600"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      <BookingModal
        room={room}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultDate={date}
        defaultStart={startTime}
        defaultEnd={endTime}
      />
    </div>
  );
};

const SummaryRow: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-soft text-sibiru-600">
      <Icon size={14} strokeWidth={1.8} />
    </span>
    <div className="min-w-0">
      <p className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className="mt-0.5 text-xs font-semibold leading-snug text-ink-heading">{value}</p>
    </div>
  </div>
);
