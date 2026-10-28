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

  // Placeholder images based on room type
  const defaultImages: Record<string, string> = {
    room_auditorium: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    room_lab_c201: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80',
    room_seminar_b: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    room_rapat_senat: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
  };

  const imageSrc =
    room.image_url ||
    defaultImages[room.id] ||
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#006569]/30 transition-all flex flex-col group">
        {/* Media Header */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={imageSrc}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Capacity Tag */}
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            👥 {room.capacity} Orang
          </div>

          {/* Active status indicator */}
          <div className="absolute bottom-3 left-3">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                room.is_active
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}
            >
              {room.is_active ? 'Siap Digunakan' : 'Nonaktif'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-base text-slate-900 group-hover:text-[#006569] transition-colors leading-snug">
            {room.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <span>📍</span> {room.location}
          </p>

          {/* Facility Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5 flex-1">
            {room.facilities.slice(0, 3).map((facility, idx) => (
              <Badge key={idx} variant="facility">
                {facility}
              </Badge>
            ))}
            {room.facilities.length > 3 && (
              <Badge variant="neutral" className="text-slate-500">
                +{room.facilities.length - 3} lagi
              </Badge>
            )}
          </div>

          {/* Footer Info & Action */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              {bookedCount === 0 ? (
                <span className="text-[#006569] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006569]"></span> Slot Kosong Penuh
                </span>
              ) : (
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> {bookedCount} Slot Terisi
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!room.is_active}
              onClick={() => setIsModalOpen(true)}
              className="text-xs group-hover:bg-[#006569] group-hover:text-white group-hover:border-[#006569]"
            >
              Cek & Pinjam →
            </Button>
          </div>
        </div>
      </div>

      <BookingModal
        room={room}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
      />
    </>
  );
};
