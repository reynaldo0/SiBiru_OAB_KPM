import React, { useState } from 'react';
import type { Room } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BookingModal } from './BookingModal';
import { useRoomAvailability } from '../../hooks/use-rooms';

interface RoomCardProps {
  room: Room;
  selectedDate: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, selectedDate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: availability } = useRoomAvailability(room.id, selectedDate);
  const bookedCount = availability?.booked_intervals?.length || 0;

  // Selected illustrations from MATRA reference assets
  const illustrationMap: Record<string, string> = {
    room_auditorium: '/assets/ilustrasi/main.webp',
    room_lab_c201: '/assets/ilustrasi/lab-komputer.webp',
    room_seminar_b: '/assets/ilustrasi/ruang-kuliah.webp',
    room_rapat_senat: '/assets/ilustrasi/kenali-matra.webp',
  };

  const imageSrc =
    room.image_url ||
    illustrationMap[room.id] ||
    '/assets/ilustrasi/ruang-kuliah.webp';

  const isLab = room.name.toLowerCase().includes('lab');

  return (
    <>
      <article className="editorial-facility-card group overflow-hidden flex flex-col justify-between">
        {/* Card Media Header with MATRA frame */}
        <div className="relative h-48 bg-gradient-to-br from-[#ECF7F5] via-[#F8FBFA] to-[#E4F0EE] overflow-hidden flex items-center justify-center p-4">
          <img
            src={imageSrc}
            alt={room.name}
            className="h-full max-h-40 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 relative z-10"
            loading="lazy"
          />

          {/* Decorative ring element from MATRA */}
          <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full border border-[#006569]/15 pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-[#FFDD00]/25 pointer-events-none" />

          {/* Capacity Tag */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#17324D] border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs z-20">
            👥 {room.capacity} Orang
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-[#006569] text-white px-2 py-0.5 rounded-md shadow-xs">
              {isLab ? 'PRAKTIKUM & LAB' : 'RUANG AKADEMIK'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#006569] mb-1">
                {isLab ? 'Laboratorium Komputer' : 'Ruang Fasilitas'}
              </p>
              <h3 className="font-bold text-base text-[#17324D] group-hover:text-[#006569] transition-colors leading-snug">
                {room.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>📍</span> {room.location}
              </p>
            </div>

            {/* Status indicator pill */}
            <div>
              {bookedCount === 0 ? (
                <Badge variant="approved">Tersedia</Badge>
              ) : (
                <Badge variant="pending">{bookedCount} Terjadwal</Badge>
              )}
            </div>
          </div>

          {/* Facility Chips */}
          <div className="mt-4 flex flex-wrap gap-1.5 flex-1">
            {room.facilities.slice(0, 3).map((facility, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F2F5F7] text-[#334155] border border-slate-200/80"
              >
                {facility}
              </span>
            ))}
            {room.facilities.length > 3 && (
              <span className="inline-flex items-center text-[10px] text-slate-500 px-1.5 py-0.5">
                +{room.facilities.length - 3} lagi
              </span>
            )}
          </div>

          {/* Footer Card Action */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              {selectedDate}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!room.is_active}
              onClick={() => setIsModalOpen(true)}
              className="text-xs group-hover:bg-[#006569] group-hover:text-white group-hover:border-[#006569]"
            >
              Cek & Ajukan →
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
