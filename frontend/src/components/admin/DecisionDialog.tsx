import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { BookingStatus } from '../../types';
import { useRoomAvailability } from '../../hooks/use-rooms';
import { useUpdateBookingStatus } from '../../hooks/use-admin';
import { detectConflict } from '../booking/ConflictNotice';
import { REJECTION_MIN_LENGTH, REJECTION_PRESETS } from '../../lib/constants';
import { durationLabel, formatDateLong, formatTime } from '../../lib/dates';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Field } from '../ui/Field';
import { statusLabel } from '../../lib/utils';

export interface DecisionBooking {
  id: string;
  room_id: string;
  room_name?: string | null;
  borrower_name: string;
  organization: string;
  purpose: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

interface DecisionDialogProps {
  booking: DecisionBooking | null;
  mode: 'approve' | 'reject' | null;
  onClose: () => void;
}

export const DecisionDialog: React.FC<DecisionDialogProps> = ({ booking, mode, onClose }) => {
  const updateStatus = useUpdateBookingStatus();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const { data: availability, isLoading: isAvailabilityLoading } = useRoomAvailability(
    booking?.room_id ?? '',
    booking?.booking_date ?? '',
    { enabled: Boolean(booking && mode === 'approve') },
  );

  const conflicts = useMemo(() => {
    if (!booking) return [];
    return detectConflict(booking.start_time, booking.end_time, availability?.booked_intervals ?? []).filter(
      (interval) => interval.booking_id !== booking.id,
    );
  }, [availability?.booked_intervals, booking]);

  useEffect(() => {
    setReason('');
    setError(null);
    setAcknowledged(false);
  }, [booking?.id, mode]);

  if (!booking || !mode) return null;

  const isReject = mode === 'reject';
  const reasonValid = !isReject || reason.trim().length >= REJECTION_MIN_LENGTH;
  const canSubmit =
    !updateStatus.isPending && reasonValid && (!conflicts.length || isReject || acknowledged);

  const handleConfirm = async () => {
    if (!canSubmit) {
      if (isReject && !reasonValid) {
        setError(`Alasan penolakan wajib diisi minimal ${REJECTION_MIN_LENGTH} karakter.`);
      }
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: booking.id,
        status: isReject ? 'REJECTED' : 'APPROVED',
        rejection_reason: isReject ? reason.trim() : undefined,
      });

      toast.success(isReject ? 'Pengajuan ditolak' : 'Pengajuan disetujui', {
        description: `${booking.room_name ?? booking.room_id} · ${formatDateLong(booking.booking_date)}`,
      });
      onClose();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Keputusan tidak dapat disimpan. Silakan coba lagi.',
      );
    }
  };

  return (
    <Modal
      isOpen={Boolean(booking && mode)}
      onClose={onClose}
      eyebrow={isReject ? 'Keputusan pengelola' : 'Verifikasi pengajuan'}
      title={isReject ? 'Tolak pengajuan peminjaman' : 'Setujui pengajuan peminjaman'}
      description={
        isReject
          ? 'Sertakan alasan yang jelas agar peminjam dapat menyesuaikan agenda.'
          : 'Periksa kembali detail agenda dan potensi bentrok sebelum menyetujui.'
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-ink-border bg-ink-light/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-sibiru-600">
                {booking.room_name ?? booking.room_id}
              </p>
              <h3 className="mt-1 text-sm font-bold leading-snug text-ink-heading">
                {booking.purpose}
              </h3>
            </div>
            <Badge status={booking.status}>{statusLabel(booking.status)}</Badge>
          </div>

          <div className="mt-3 grid gap-2 text-[0.6875rem] text-ink-muted sm:grid-cols-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-ink-body">{booking.borrower_name}</span>
              <span>· {booking.organization}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono sm:justify-end">
              <Clock3 size={12} className="text-sibiru-500" />
              {formatTime(booking.start_time)}–{formatTime(booking.end_time)} WIB
            </span>
            <span className="inline-flex items-center gap-1.5 sm:col-span-2">
              <ShieldCheck size={12} className="text-sibiru-500" />
              {formatDateLong(booking.booking_date)} · {durationLabel(booking.start_time, booking.end_time)}
            </span>
          </div>
        </div>

        {!isReject && (
          <div>
            {isAvailabilityLoading ? (
              <div className="rounded-xl border border-ink-border bg-white px-3.5 py-3 text-[0.6875rem] text-ink-muted">
                Memeriksa bentrok jadwal…
              </div>
            ) : conflicts.length > 0 ? (
              <div className="rounded-xl border border-gold-200 bg-gold-50/80 px-3.5 py-3 text-[0.6875rem] leading-relaxed text-gold-900">
                <p className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={14} className="shrink-0 text-gold-600" />
                  Potensi bentrok dengan {conflicts.length} agenda lain
                </p>
                <ul className="mt-2 space-y-1">
                  {conflicts.slice(0, 3).map((conflict) => (
                    <li key={conflict.booking_id} className="rounded-md bg-white/70 px-2 py-1">
                      {conflict.organization} · {formatTime(conflict.start_time)}–
                      {formatTime(conflict.end_time)} ·{' '}
                      {conflict.status === 'APPROVED' ? 'Disetujui' : 'Menunggu'}
                    </li>
                  ))}
                </ul>
                <label className="mt-2.5 flex items-start gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-gold-400 text-sibiru-600 focus:ring-sibiru-500"
                  />
                  Saya memahami risiko bentrok dan tetap menyetujui pengajuan ini.
                </label>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-sibiru-200 bg-sibiru-50 px-3.5 py-3 text-[0.6875rem] leading-relaxed text-sibiru-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sibiru-500" />
                Tidak ada agenda lain yang bertabrakan pada slot ini.
              </div>
            )}
          </div>
        )}

        {isReject && (
          <div className="space-y-3">
            <Field
              label="Alasan penolakan"
              htmlFor="rejection-reason"
              required
              counter={`${reason.trim().length}/${REJECTION_MIN_LENGTH}`}
              hint="Alasan akan ditampilkan kepada peminjam pada halaman pengajuan saya."
            >
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setError(null);
                }}
                rows={3}
                placeholder="Jelaskan alasan penolakan secara singkat dan jelas."
                className="input resize-none"
              />
            </Field>

            <div>
              <p className="mb-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                Alasan cepat
              </p>
              <div className="flex flex-col gap-1.5">
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setReason(preset);
                      setError(null);
                    }}
                    className="rounded-lg border border-ink-border bg-white px-2.5 py-2 text-left text-[0.6875rem] leading-relaxed text-ink-body transition-colors hover:border-sibiru-200 hover:bg-sibiru-50 hover:text-sibiru-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.6875rem] leading-relaxed text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-ink-border/80 pt-4 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={isReject ? 'danger' : 'primary'}
            onClick={() => void handleConfirm()}
            disabled={!canSubmit}
            isLoading={updateStatus.isPending}
          >
            {isReject ? (
              <>
                <XCircle size={15} />
                Tolak pengajuan
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Setujui pengajuan
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
