import React, { useState } from 'react';
import type { BookedInterval } from '../../types';
import { Badge } from '../ui/Badge';

interface TimeSlotScrubberProps {
  bookedIntervals: BookedInterval[];
  selectedStartTime?: string;
  selectedEndTime?: string;
  onSelectSlot?: (startTime: string, endTime: string) => void;
  readOnly?: boolean;
}

// Jam operasional kampus: 07:00 - 21:00 (14 jam)
const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function timeToFraction(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  const hourVal = h + (m || 0) / 60;
  const clamped = Math.max(START_HOUR, Math.min(END_HOUR, hourVal));
  return (clamped - START_HOUR) / TOTAL_HOURS;
}

export const TimeSlotScrubber: React.FC<TimeSlotScrubberProps> = ({
  bookedIntervals,
  selectedStartTime,
  selectedEndTime,
  onSelectSlot,
  readOnly = false,
}) => {
  const [hoveredInterval, setHoveredInterval] = useState<BookedInterval | null>(null);

  // Daftar jam untuk label grid (07:00, 09:00, 11:00, 13:00, 15:00, 17:00, 19:00, 21:00)
  const hourMarkers = [7, 9, 11, 13, 15, 17, 19, 21];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-slate-700">Visualisasi Jadwal Operasional (07:00 – 21:00 WIB)</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#006569]"></span>
            <span className="text-slate-600">Disetujui (Approved)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#F59E0B]"></span>
            <span className="text-slate-600">Menunggu (Pending)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-slate-300 bg-slate-50"></span>
            <span className="text-slate-600">Tersedia</span>
          </div>
        </div>
      </div>

      {/* Scrubber Container */}
      <div className="relative w-full h-14 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        {/* Hour Grid Lines */}
        {hourMarkers.map((hour) => {
          const leftPercent = ((hour - START_HOUR) / TOTAL_HOURS) * 100;
          return (
            <div
              key={hour}
              className="absolute top-0 bottom-0 border-r border-slate-200/80 pointer-events-none"
              style={{ left: `${leftPercent}%` }}
            />
          );
        })}

        {/* Selected Slot Highlight */}
        {selectedStartTime && selectedEndTime && (
          <div
            className="absolute top-0 bottom-0 bg-[#006569]/20 border-x-2 border-[#006569] z-10 transition-all pointer-events-none"
            style={{
              left: `${timeToFraction(selectedStartTime) * 100}%`,
              width: `${(timeToFraction(selectedEndTime) - timeToFraction(selectedStartTime)) * 100}%`,
            }}
          >
            <div className="absolute top-1 left-1.5 bg-[#006569] text-white text-[10px] font-mono font-bold px-1 rounded shadow-xs">
              Pilihan: {selectedStartTime} - {selectedEndTime}
            </div>
          </div>
        )}

        {/* Booked Intervals Blocks */}
        {bookedIntervals.map((interval) => {
          const left = timeToFraction(interval.start_time) * 100;
          const right = timeToFraction(interval.end_time) * 100;
          const width = Math.max(1, right - left);
          const isApproved = interval.status === 'APPROVED';

          return (
            <div
              key={interval.booking_id}
              onMouseEnter={() => setHoveredInterval(interval)}
              onMouseLeave={() => setHoveredInterval(null)}
              className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all flex items-center justify-center overflow-hidden px-2 z-20 ${
                isApproved
                  ? 'bg-[#006569] text-white hover:bg-[#005457]'
                  : 'bg-[#F59E0B] text-slate-950 font-semibold hover:bg-[#D97706]'
              }`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
            >
              <span className="text-[11px] font-mono truncate">
                {interval.start_time.slice(0, 5)} - {interval.end_time.slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hour Labels */}
      <div className="relative w-full h-5 mt-1.5 text-[10px] font-mono text-slate-400">
        {hourMarkers.map((hour) => {
          const leftPercent = ((hour - START_HOUR) / TOTAL_HOURS) * 100;
          return (
            <span
              key={hour}
              className="absolute -translate-x-1/2"
              style={{ left: `${leftPercent}%` }}
            >
              {String(hour).padStart(2, '0')}:00
            </span>
          );
        })}
      </div>

      {/* Tooltip / Hover Detail Info */}
      {hoveredInterval && (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-between animate-fadeIn">
          <div>
            <span className="font-semibold">{hoveredInterval.organization}</span>
            <span className="text-slate-400 mx-1.5">•</span>
            <span className="text-slate-300">Peminjam: {hoveredInterval.borrower_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px]">
              {hoveredInterval.start_time.slice(0, 5)} – {hoveredInterval.end_time.slice(0, 5)} WIB
            </span>
            <Badge status={hoveredInterval.status}>{hoveredInterval.status}</Badge>
          </div>
        </div>
      )}

      {/* Fast Slot Selector Buttons */}
      {!readOnly && onSelectSlot && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Pilihan Slot Cepat:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSelectSlot('08:00', '10:00')}
              className="px-2 py-1 bg-slate-100 hover:bg-[#E6F3F3] hover:text-[#006569] rounded transition-colors"
            >
              Pagi (08:00 – 10:00)
            </button>
            <button
              type="button"
              onClick={() => onSelectSlot('10:00', '12:00')}
              className="px-2 py-1 bg-slate-100 hover:bg-[#E6F3F3] hover:text-[#006569] rounded transition-colors"
            >
              Siang (10:00 – 12:00)
            </button>
            <button
              type="button"
              onClick={() => onSelectSlot('13:00', '16:00')}
              className="px-2 py-1 bg-slate-100 hover:bg-[#E6F3F3] hover:text-[#006569] rounded transition-colors"
            >
              Sore (13:00 – 16:00)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
