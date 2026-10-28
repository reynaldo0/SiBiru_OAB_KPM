import React, { useState, useEffect } from 'react';
import type { Room } from '../../types';
import { useRoomAvailability } from '../../hooks/use-rooms';
import { useCreateBooking } from '../../hooks/use-bookings';
import { useAuthStore } from '../../store/auth.store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TimeSlotScrubber } from '../timeline/TimeSlotScrubber';
import { ConflictSensorBanner, detectConflict } from './ConflictSensorBanner';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
  defaultDate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const { currentUser } = useAuthStore();
  const createBooking = useCreateBooking();

  const [date, setDate] = useState<string>(defaultDate || todayStr);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [organization, setOrganization] = useState<string>(currentUser?.organization || 'HIMA Informatika');
  const [purpose, setPurpose] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.organization) {
      setOrganization(currentUser.organization);
    }
  }, [currentUser]);

  // Fetch real-time availability for the chosen room and date
  const { data: availability, isLoading: isAvailabilityLoading } = useRoomAvailability(
    room?.id || '',
    date
  );

  const bookedIntervals = availability?.booked_intervals || [];
  const conflicts = detectConflict(startTime, endTime, bookedIntervals);
  const hasConflict = conflicts.length > 0;
  const isPurposeValid = purpose.trim().length >= 10;
  const isTimeValid = startTime < endTime;
  const canSubmit = !hasConflict && isPurposeValid && isTimeValid && !createBooking.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !canSubmit) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await createBooking.mutateAsync({
        room_id: room.id,
        organization,
        purpose: purpose.trim(),
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
      });

      setSuccessMsg('Pengajuan peminjaman berhasil dikirim! Status: PENDING.');
      setTimeout(() => {
        setSuccessMsg(null);
        setPurpose('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengajukan peminjaman. Silakan coba lagi.');
    }
  };

  if (!room) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Form Pengajuan Peminjaman Ruangan"
      description={`Ajukan reservasi untuk ${room.name} (${room.location})`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Kegiatan
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jam Mulai
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jam Selesai
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
              required
            />
          </div>
        </div>

        {/* Live Timeline Scrubber for the selected room */}
        <div>
          {isAvailabilityLoading ? (
            <div className="h-20 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center text-xs text-slate-500">
              Memuat ketersediaan slot jam...
            </div>
          ) : (
            <TimeSlotScrubber
              bookedIntervals={bookedIntervals}
              selectedStartTime={startTime}
              selectedEndTime={endTime}
              onSelectSlot={(s, e) => {
                setStartTime(s);
                setEndTime(e);
              }}
            />
          )}
        </div>

        {/* Live Conflict Sensor Banner */}
        <ConflictSensorBanner
          bookedIntervals={bookedIntervals}
          startTime={startTime}
          endTime={endTime}
        />

        {/* Organization Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Organisasi / Unit Pengaju
          </label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="HIMA, UKM, Prodi, atau Unit Kerja"
            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        {/* Purpose with Live Character Meter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Keperluan / Nama Kegiatan
            </label>
            <span
              className={`text-[11px] font-mono ${
                isPurposeValid ? 'text-[#006569] font-bold' : 'text-amber-700'
              }`}
            >
              {purpose.trim().length}/10 Karakter (Min 10)
            </span>
          </div>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            placeholder="Contoh: Seminar Nasional Kecerdasan Buatan dan Transformasi Digital (Minimal 10 karakter)"
            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
            required
          />
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
            {successMsg}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={!canSubmit}
            isLoading={createBooking.isPending}
          >
            Ajukan Peminjaman
          </Button>
        </div>
      </form>
    </Modal>
  );
};
