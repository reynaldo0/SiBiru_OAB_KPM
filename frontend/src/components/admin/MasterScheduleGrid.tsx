import React from 'react';
import { CalendarX2 } from 'lucide-react';
import type { MasterScheduleItem, Room } from '../../types';
import {
  formatDayNumber,
  formatDayShort,
  formatMonthShort,
  formatTime,
  todayISO,
} from '../../lib/dates';
import { cn } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';

interface MasterScheduleGridProps {
  rooms: Room[];
  items: MasterScheduleItem[];
  dates: string[];
  onSelect: (item: MasterScheduleItem) => void;
}

export const MasterScheduleGrid: React.FC<MasterScheduleGridProps> = ({
  rooms,
  items,
  dates,
  onSelect,
}) => {
  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Belum ada ruangan untuk ditampilkan"
        description="Tambahkan master ruangan atau ubah filter agar jadwal dapat ditampilkan."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-border bg-white shadow-subtle">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[62rem] border-collapse text-left">
          <thead>
            <tr className="bg-ink-light/80">
              <th
                scope="col"
                className="sticky left-0 z-20 w-[13rem] border-b border-ink-border bg-ink-light/95 px-4 py-3 text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-ink-muted"
              >
                Ruangan
              </th>
              {dates.map((date) => {
                const isToday = date === todayISO();
                const dayItems = items.filter((item) => item.booking_date === date);
                return (
                  <th
                    key={date}
                    scope="col"
                    className={cn(
                      'border-b border-l border-ink-border px-2 py-2.5 text-center',
                      isToday ? 'bg-sibiru-50/80' : 'bg-ink-light/80',
                    )}
                  >
                    <span
                      className={cn(
                        'block text-[0.5625rem] font-bold uppercase tracking-[0.12em]',
                        isToday ? 'text-sibiru-600' : 'text-ink-muted',
                      )}
                    >
                      {formatDayShort(date)}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block font-mono text-base font-semibold leading-none',
                        isToday ? 'text-sibiru-700' : 'text-ink-heading',
                      )}
                    >
                      {formatDayNumber(date)}
                    </span>
                    <span className="mt-0.5 block text-[0.5625rem] text-ink-muted">
                      {formatMonthShort(date)}
                    </span>
                    {dayItems.length > 0 && (
                      <span
                        className={cn(
                          'mt-1.5 inline-flex rounded-full px-1.5 py-0.5 font-mono text-[0.5rem] font-semibold',
                          isToday ? 'bg-sibiru-500 text-white' : 'bg-white text-ink-muted',
                        )}
                      >
                        {dayItems.length}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="group/row">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-ink-border bg-white px-4 py-3 align-top group-last/row:border-b-0"
                >
                  <span className="block truncate text-[0.75rem] font-bold text-ink-heading">
                    {room.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.5625rem] text-ink-muted">
                    {room.capacity} orang
                  </span>
                  {!room.is_active && (
                    <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-slate-500">
                      Nonaktif
                    </span>
                  )}
                </th>

                {dates.map((date) => {
                  const cellItems = items
                    .filter((item) => item.room_id === room.id && item.booking_date === date)
                    .sort((a, b) => (a.start_time < b.start_time ? -1 : 1));

                  return (
                    <td
                      key={`${room.id}-${date}`}
                      className={cn(
                        'border-b border-l border-ink-border p-1.5 align-top group-last/row:border-b-0',
                        date === todayISO() && 'bg-sibiru-50/30',
                      )}
                    >
                      {cellItems.length === 0 ? (
                        <div className="flex h-14 items-center justify-center rounded-md border border-dashed border-ink-border/70">
                          <span className="font-mono text-[0.5625rem] text-ink-borderStrong">—</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {cellItems.slice(0, 3).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => onSelect(item)}
                              className={cn(
                                'block w-full rounded-md border px-1.5 py-1 text-left transition-all hover:shadow-subtle',
                                item.status === 'APPROVED'
                                  ? 'border-sibiru-200 bg-sibiru-50 hover:border-sibiru-300'
                                  : 'border-gold-200 bg-gold-50 hover:border-gold-300',
                              )}
                              title={`${item.purpose} · ${item.organization}`}
                            >
                              <span
                                className={cn(
                                  'block font-mono text-[0.5rem] font-semibold',
                                  item.status === 'APPROVED' ? 'text-sibiru-700' : 'text-gold-800',
                                )}
                              >
                                {formatTime(item.start_time)}–{formatTime(item.end_time)}
                              </span>
                              <span className="mt-0.5 block truncate text-[0.5625rem] font-semibold text-ink-heading">
                                {item.organization}
                              </span>
                            </button>
                          ))}
                          {cellItems.length > 3 && (
                            <button
                              type="button"
                              onClick={() => onSelect(cellItems[3])}
                              className="block w-full rounded-md bg-ink-soft px-1.5 py-1 text-left font-mono text-[0.5rem] font-semibold text-ink-muted transition-colors hover:bg-sibiru-50 hover:text-sibiru-600"
                            >
                              +{cellItems.length - 3} agenda lain
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
