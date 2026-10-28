import React from 'react';
import type { BookedInterval } from '../../types';

interface ConflictSensorBannerProps {
  bookedIntervals: BookedInterval[];
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

export function detectConflict(
  newStart: string,
  newEnd: string,
  bookedIntervals: BookedInterval[]
): BookedInterval[] {
  if (!newStart || !newEnd || newStart >= newEnd) return [];

  return bookedIntervals.filter((interval) => {
    // Rumus overlap interval backend SIBIRU:
    // (JamMulai_Baru < JamSelesai_Eksisting) AND (JamSelesai_Baru > JamMulai_Eksisting)
    return newStart < interval.end_time && newEnd > interval.start_time;
  });
}

export const ConflictSensorBanner: React.FC<ConflictSensorBannerProps> = ({
  bookedIntervals,
  startTime,
  endTime,
}) => {
  if (!startTime || !endTime || startTime >= endTime) {
    return null;
  }

  const conflicts = detectConflict(startTime, endTime, bookedIntervals);
  const hasConflict = conflicts.length > 0;

  if (hasConflict) {
    const firstConflict = conflicts[0];
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 animate-fadeIn">
        <span className="text-base leading-none">⚠️</span>
        <div className="flex-1">
          <div className="font-bold text-amber-900 mb-0.5">
            Peringatan Bentrok Jadwal (HTTP 409 Conflict)
          </div>
          <p className="text-amber-800 leading-relaxed mb-1.5">
            Slot waktu <strong>{startTime} – {endTime}</strong> bertabrakan dengan agenda yang sudah terdaftar:
          </p>
          <div className="bg-white/80 border border-amber-200 rounded-md p-2 font-mono text-[11px] text-amber-900">
            <strong>{firstConflict.organization}</strong> ({firstConflict.borrower_name}) —{' '}
            {firstConflict.start_time.slice(0, 5)} s/d {firstConflict.end_time.slice(0, 5)} WIB{' '}
            <span className="inline-block px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold ml-1">
              {firstConflict.status}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700">
            💡 <strong>Rekomendasi:</strong> Geser jam mulai atau pilih slot di luar jam bentrok tersebut.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#A7D8CF] bg-[#E6F4F1] p-3 text-xs text-[#006569] flex items-center gap-2 animate-fadeIn">
      <span className="text-sm font-bold">✓</span>
      <div>
        <strong>Slot Waktu Tersedia!</strong> Tidak ada agenda yang bertabrakan pada rentang jam {startTime} – {endTime}.
      </div>
    </div>
  );
};
