import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react';
import type { Room } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BookingModal } from './BookingModal';
import { AvailabilityTimeline } from '../timeline/AvailabilityTimeline';
import { useRoomAvailability } from '../../hooks/use-rooms';
import { formatDateMedium, formatRelativeDay } from '../../lib/dates';
import { isLabRoom, roomCategory, roomImage } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface RoomCardProps {
  room: Room;
  selectedDate: string;
  index?: number;
  className?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, selectedDate, index, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: availability, isLoading } = useRoomAvailability(room.id, selectedDate);
  const bookedIntervals = useMemo(
    () => availability?.booked_intervals ?? [],
    [availability?.booked_intervals],
  );

  const bookedCount = bookedIntervals.length;
  const category = roomCategory(room);
  const lab = isLabRoom(room);

  return (
    <>
      <article
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border border-ink-border bg-white shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:border-sibiru-200 hover:shadow-card',
          !room.is_active && 'opacity-80',
          className,
        )}
      >
        <Link
          to={`/ruangan/${room.id}`}
          className="room-art relative flex h-44 items-center justify-center overflow-hidden px-6"
          aria-label={`Lihat detail ${room.name}`}
        >
          <span
            className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full border border-sibiru-500/10"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-8 right-6 h-20 w-20 rounded-full bg-gold-400/20"
            aria-hidden="true"
          />

          <img
            src={roomImage(room)}
            alt={room.name}
            loading="lazy"
            className="relative z-10 max-h-36 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,42,43,0.12)] transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {typeof index === 'number' && (
            <span className="absolute left-4 top-4 font-mono text-[0.625rem] font-semibold tracking-[0.18em] text-sibiru-700/60">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}

          <span className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-ink-border bg-white/95 px-2.5 py-1 text-[0.625rem] font-semibold text-ink-heading shadow-subtle backdrop-blur">
            <Users size={11} className="text-sibiru-500" />
            {room.capacity} orang
          </span>

          <span className="absolute bottom-3 left-4 z-20 rounded-md bg-sibiru-600 px-2 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-white">
            {lab ? 'Laboratorium' : category}
          </span>

          {!room.is_active && (
            <span className="absolute inset-x-0 bottom-0 z-20 bg-ink-heading/80 py-1 text-center text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-white">
              Ruangan nonaktif
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-sibiru-600">
                {category}
              </p>
              <h3 className="mt-1 text-[0.9375rem] font-bold leading-snug text-ink-heading">
                <Link
                  to={`/ruangan/${room.id}`}
                  className="transition-colors hover:text-sibiru-600 focus-visible:outline-none"
                >
                  {room.name}
                </Link>
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-ink-muted">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{room.location}</span>
              </p>
            </div>

            <Badge
              variant={!room.is_active ? 'inactive' : bookedCount === 0 ? 'approved' : 'pending'}
              className="shrink-0"
            >
              {!room.is_active ? 'Nonaktif' : bookedCount === 0 ? 'Tersedia' : `${bookedCount} agenda`}
            </Badge>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {room.facilities.slice(0, 3).map((facility) => (
              <span key={facility} className="chip">
                {facility}
              </span>
            ))}
            {room.facilities.length > 3 && (
              <span className="chip border-dashed text-ink-muted">+{room.facilities.length - 3}</span>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
                <CalendarDays size={10} />
                {formatRelativeDay(selectedDate)}
              </span>
              <span className="font-mono text-[0.5625rem] text-ink-muted">
                {formatDateMedium(selectedDate)}
              </span>
            </div>
            <AvailabilityTimeline
              date={selectedDate}
              bookedIntervals={bookedIntervals}
              isLoading={isLoading}
              compact
              className="border-ink-border/80"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink-border/70 pt-3.5">
            <Link
              to={`/ruangan/${room.id}`}
              className="group/link inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-ink-muted transition-colors hover:text-sibiru-600"
            >
              Lihat detail
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              />
            </Link>

            <Button
              size="sm"
              variant="outline"
              disabled={!room.is_active}
              onClick={() => setIsModalOpen(true)}
              className="group-hover:border-sibiru-300 group-hover:bg-sibiru-50"
            >
              Ajukan
            </Button>
          </div>
        </div>
      </article>

      <BookingModal
        room={room}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
      />
    </>
  );
};
