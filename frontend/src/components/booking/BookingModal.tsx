import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Booking, Room } from '../../types';
import { useRoomAvailability } from '../../hooks/use-rooms';
import { useCreateBooking } from '../../hooks/use-bookings';
import { useAuthStore } from '../../store/auth.store';
import { ApiError, extractConflictDetails } from '../../services/api-client';
import {
  OPERATING_END_TIME,
  OPERATING_START_TIME,
  durationLabel,
  formatDateLong,
  formatTime,
  isPastDate,
  todayISO,
} from '../../lib/dates';
import { PURPOSE_MIN_LENGTH } from '../../lib/constants';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Field } from '../ui/Field';
import { AvailabilityTimeline } from '../timeline/AvailabilityTimeline';
import { ConflictNotice, detectConflict } from './ConflictNotice';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultStart?: string;
  defaultEnd?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
  defaultDate,
  defaultStart,
  defaultEnd,
}) => {
  const user = useAuthStore((state) => state.user);
  const createBooking = useCreateBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const [date, setDate] = useState(defaultDate || todayISO());
  const [startTime, setStartTime] = useState(defaultStart || '09:00');
  const [endTime, setEndTime] = useState(defaultEnd || '11:00');
  const [organization, setOrganization] = useState(user?.organization ?? '');
  const [purpose, setPurpose] = useState('');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<Booking | null>(null);

  const { data: availability, isLoading: isAvailabilityLoading, refetch } = useRoomAvailability(
    room?.id ?? '',
    date,
  );

  const bookedIntervals = useMemo(
    () => availability?.booked_intervals ?? [],
    [availability?.booked_intervals],
  );

  useEffect(() => {
    if (!isOpen) return;
    setDate(defaultDate || todayISO());
    setStartTime(defaultStart || '09:00');
    setEndTime(defaultEnd || '11:00');
    setOrganization(user?.organization ?? '');
    setPurpose('');
    setServerMessage(null);
    setFormError(null);
    setCreated(null);
  }, [isOpen, defaultDate, defaultStart, defaultEnd, user?.organization]);

  if (!room) return null;

  const conflicts = detectConflict(startTime, endTime, bookedIntervals);
  const isTimeValid = Boolean(startTime && endTime && startTime < endTime);
  const isWithinHours = startTime >= OPERATING_START_TIME && endTime <= OPERATING_END_TIME;
  const isPurposeValid = purpose.trim().length >= PURPOSE_MIN_LENGTH;
  const isOrganizationValid = organization.trim().length >= 2;
  const isDateValid = Boolean(date) && !isPastDate(date);
  const canSubmit =
    Boolean(user) &&
    isTimeValid &&
    isWithinHours &&
    isPurposeValid &&
    isOrganizationValid &&
    isDateValid &&
    conflicts.length === 0 &&
    !createBooking.isPending;

  const loginTarget = `/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

  const handleClose = () => {
    setCreated(null);
    setServerMessage(null);
    setFormError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setServerMessage(null);
    setFormError(null);

    try {
      const booking = await createBooking.mutateAsync({
        room_id: room.id,
        organization: organization.trim(),
        purpose: purpose.trim(),
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
      });

      setCreated(booking);
      toast.success('Pengajuan peminjaman terkirim', {
        description: `${room.name} · ${formatDateLong(date)} · ${startTime}–${endTime} WIB`,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const conflict = extractConflictDetails(error.data);
        if (conflict) {
          const existing = conflict.conflict_details;
          const detail = existing.existing_organization
            ? ` Bentrok dengan ${existing.existing_organization}${
                existing.existing_start_time && existing.existing_end_time
                  ? ` (${formatTime(existing.existing_start_time)}–${formatTime(existing.existing_end_time)})`
                  : ''
              }.`
            : '';
          setServerMessage(`${conflict.message}${detail}`);
          void refetch();
          return;
        }
        setFormError(error.message);
        return;
      }
      setFormError('Gagal mengirim pengajuan. Silakan coba lagi.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow={created ? 'Pengajuan diterima' : 'Formulir peminjaman'}
      title={created ? 'Pengajuan Anda sedang ditinjau' : 'Ajukan peminjaman ruangan'}
      description={
        created
          ? 'Pengelola fasilitas akan memverifikasi ketersediaan sebelum agenda disetujui.'
          : `${room.name} · ${room.location}`
      }
      maxWidth="2xl"
    >
      {created ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <div className="flex flex-col items-center rounded-2xl border border-sibiru-100 bg-sibiru-50/60 px-5 py-7 text-center">
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-sibiru-500 shadow-subtle">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/20" />
              <CheckCircle2 size={28} strokeWidth={1.7} />
            </span>
            <h3 className="mt-4 text-base font-bold text-ink-heading">Pengajuan berhasil dikirim</h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
              Simpan nomor referensi berikut untuk memantau status persetujuan pada halaman
              pengajuan saya.
            </p>
            <span className="mt-3 rounded-lg border border-ink-border bg-white px-3 py-1.5 font-mono text-[0.6875rem] font-semibold text-ink-heading">
              {created.id}
            </span>
            <Badge status="PENDING" className="mt-3">
              Menunggu keputusan pengelola
            </Badge>
          </div>

          <div className="grid gap-3 rounded-2xl border border-ink-border bg-white p-4 sm:grid-cols-2">
            <DetailRow icon={Building2} label="Ruangan" value={`${room.name} · ${room.location}`} />
            <DetailRow icon={CalendarDays} label="Tanggal" value={formatDateLong(created.booking_date)} />
            <DetailRow
              icon={Clock3}
              label="Waktu"
              value={`${formatTime(created.start_time)}–${formatTime(created.end_time)} WIB`}
            />
            <DetailRow icon={ShieldCheck} label="Organisasi" value={created.organization} />
            <div className="sm:col-span-2 rounded-xl bg-ink-soft/60 px-3 py-2.5 text-xs leading-relaxed text-ink-body">
              <span className="font-semibold text-ink-heading">Kegiatan · </span>
              {created.purpose}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose}>
              Tutup
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleClose();
                navigate('/pengajuan-saya');
              }}
            >
              Lihat pengajuan saya
              <ArrowRight size={15} />
            </Button>
          </div>
        </motion.div>
      ) : !user ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center rounded-2xl border border-gold-200 bg-gold-50/70 px-5 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-200 bg-white text-sibiru-600">
              <LogIn size={22} />
            </span>
            <h3 className="mt-3 text-sm font-bold text-ink-heading">Masuk untuk mengajukan peminjaman</h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-ink-body">
              Katalog dan jadwal dapat diperiksa tanpa akun. Pengajuan memerlukan identitas peminjam
              agar dapat diverifikasi oleh pengelola fasilitas.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={handleClose}>
              Kembali ke katalog
            </Button>
            <Link
              to={loginTarget}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sibiru-500 bg-sibiru-500 px-4 text-[0.8125rem] font-semibold text-white shadow-subtle transition-colors hover:bg-sibiru-600"
            >
              <LogIn size={15} />
              Masuk ke SIBIRU
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-3 rounded-2xl border border-ink-border bg-ink-soft/40 p-3.5 sm:grid-cols-3">
            <Field label="Tanggal kegiatan" htmlFor="booking-date" required>
              <input
                id="booking-date"
                type="date"
                min={todayISO()}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setServerMessage(null);
                }}
                className="input input-mono"
                required
              />
            </Field>

            <Field label="Jam mulai" htmlFor="booking-start" required>
              <input
                id="booking-start"
                type="time"
                min={OPERATING_START_TIME}
                max={OPERATING_END_TIME}
                step={900}
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="input input-mono"
                required
              />
            </Field>

            <Field label="Jam selesai" htmlFor="booking-end" required>
              <input
                id="booking-end"
                type="time"
                min={OPERATING_START_TIME}
                max={OPERATING_END_TIME}
                step={900}
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="input input-mono"
                required
              />
            </Field>
          </div>

          <AvailabilityTimeline
            date={date}
            bookedIntervals={bookedIntervals}
            selectedStart={startTime}
            selectedEnd={endTime}
            onSelectRange={(start, end) => {
              setStartTime(start);
              setEndTime(end);
              setServerMessage(null);
            }}
            interactive
            isLoading={isAvailabilityLoading}
          />

          <ConflictNotice
            bookedIntervals={bookedIntervals}
            startTime={startTime}
            endTime={endTime}
            serverMessage={serverMessage}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Organisasi / unit pengaju"
              htmlFor="booking-organization"
              required
              hint="Contoh: HIMA Informatika, BEM Fakultas, Prodi Sistem Informasi."
            >
              <input
                id="booking-organization"
                type="text"
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                placeholder="Nama organisasi atau unit kerja"
                className="input"
                minLength={2}
                maxLength={100}
                required
              />
            </Field>

            <Field
              label="Keperluan kegiatan"
              htmlFor="booking-purpose"
              required
              counter={`${purpose.trim().length}/${PURPOSE_MIN_LENGTH} karakter`}
              hint={
                isPurposeValid
                  ? 'Nama kegiatan sudah memenuhi ketentuan minimum.'
                  : 'Tuliskan nama kegiatan secara spesifik, minimal 10 karakter.'
              }
            >
              <textarea
                id="booking-purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                rows={3}
                placeholder="Seminar nasional transformasi digital dan kecerdasan artifisial"
                className="input resize-none"
                required
              />
            </Field>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-800">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-xl border border-ink-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
              <ShieldCheck size={14} className="shrink-0 text-sibiru-500" />
              <span>
                Slot diperiksa otomatis terhadap agenda berstatus disetujui maupun menunggu.
              </span>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" variant="accent" disabled={!canSubmit} isLoading={createBooking.isPending}>
                Kirim pengajuan
              </Button>
            </div>
          </div>

          {isTimeValid && isWithinHours && (
            <p className="-mt-2 text-right font-mono text-[0.625rem] text-ink-muted">
              Durasi {durationLabel(startTime, endTime)} · {formatTime(startTime)}–
              {formatTime(endTime)} WIB
            </p>
          )}
        </form>
      )}
    </Modal>
  );
};

const DetailRow: React.FC<{
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
