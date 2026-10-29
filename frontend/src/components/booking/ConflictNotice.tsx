import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import type { BookedInterval } from '../../types';
import { durationLabel, formatTime } from '../../lib/dates';
import { Badge } from '../ui/Badge';

/** Backend overlap rule: newStart < existingEnd AND newEnd > existingStart. */
export function detectConflict(
  newStart: string,
  newEnd: string,
  bookedIntervals: BookedInterval[],
): BookedInterval[] {
  if (!newStart || !newEnd || newStart >= newEnd) return [];

  return bookedIntervals.filter(
    (interval) =>
      newStart < formatTime(interval.end_time) && newEnd > formatTime(interval.start_time),
  );
}

interface ConflictNoticeProps {
  bookedIntervals: BookedInterval[];
  startTime: string;
  endTime: string;
  serverMessage?: string | null;
}

export const ConflictNotice: React.FC<ConflictNoticeProps> = ({
  bookedIntervals,
  startTime,
  endTime,
  serverMessage,
}) => {
  const validRange = Boolean(startTime && endTime && startTime < endTime);
  const conflicts = validRange ? detectConflict(startTime, endTime, bookedIntervals) : [];

  if (!startTime || !endTime) return null;

  if (!validRange) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Rentang waktu belum valid</p>
          <p className="mt-0.5 leading-relaxed text-red-700">
            Jam selesai harus lebih besar daripada jam mulai.
          </p>
        </div>
      </div>
    );
  }

  if (conflicts.length > 0) {
    return (
      <div className="rounded-xl border border-gold-200 bg-gold-50/80 px-3.5 py-3 text-xs text-gold-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-gold-600" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              Slot bertabrakan dengan {conflicts.length} agenda terdaftar
            </p>
            <p className="mt-0.5 leading-relaxed text-gold-800">
              Pilih rentang lain agar pengajuan tidak ditolak oleh mesin deteksi bentrok.
            </p>
            <div className="mt-2 space-y-1.5">
              {conflicts.slice(0, 2).map((conflict) => (
                <div
                  key={conflict.booking_id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gold-200 bg-white/80 px-2.5 py-1.5"
                >
                  <span className="min-w-0 truncate font-semibold text-gold-900">
                    {conflict.organization}
                    <span className="ml-1.5 font-normal text-gold-700">· {conflict.borrower_name}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[0.625rem]">
                    <Clock3 size={10} />
                    {formatTime(conflict.start_time)}–{formatTime(conflict.end_time)}
                    <Badge
                      variant={conflict.status === 'APPROVED' ? 'approved' : 'gold'}
                      dot={false}
                      className="px-1.5 py-0.5 text-[0.5rem]"
                    >
                      {conflict.status === 'APPROVED' ? 'Disetujui' : 'Menunggu'}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-sibiru-200 bg-sibiru-50 px-3.5 py-3 text-xs text-sibiru-800">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sibiru-500" />
      <div>
        <p className="font-bold">Slot waktu tersedia</p>
        <p className="mt-0.5 leading-relaxed text-sibiru-700">
          Tidak ada agenda yang bertabrakan pada {formatTime(startTime)}–{formatTime(endTime)} WIB
          {durationLabel(startTime, endTime) !== '—' && ` (${durationLabel(startTime, endTime)})`}.
        </p>
        {serverMessage && (
          <p className="mt-1.5 rounded-md bg-white/70 px-2 py-1 text-[0.6875rem] text-red-700">
            {serverMessage}
          </p>
        )}
      </div>
    </div>
  );
};
