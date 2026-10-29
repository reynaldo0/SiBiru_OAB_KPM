import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Sparkles, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Room } from '../../types';
import { useCreateRoom, useDeleteRoom, useUpdateRoom } from '../../hooks/use-admin';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { cn } from '../../lib/utils';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
}

const IMAGE_PRESETS = [
  { label: 'Ruang besar', value: '/assets/ilustrasi/main.webp' },
  { label: 'Ruang kuliah', value: '/assets/ilustrasi/ruang-kuliah.webp' },
  { label: 'Laboratorium', value: '/assets/ilustrasi/lab-komputer.webp' },
];

export const RoomFormModal: React.FC<RoomFormModalProps> = ({ isOpen, onClose, room }) => {
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const isEditing = Boolean(room);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('40');
  const [facilitiesText, setFacilitiesText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(room?.name ?? '');
    setLocation(room?.location ?? '');
    setCapacity(room ? String(room.capacity) : '40');
    setFacilitiesText(room?.facilities.join(', ') ?? 'AC, Proyektor, Wi-Fi / LAN');
    setImageUrl(room?.image_url ?? '');
    setIsActive(room?.is_active ?? true);
    setError(null);
    setConfirmDelete(false);
  }, [isOpen, room]);

  const facilities = useMemo(
    () =>
      facilitiesText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, index, array) => array.indexOf(item) === index),
    [facilitiesText],
  );

  const isPending = createRoom.isPending || updateRoom.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const numericCapacity = Number(capacity);

    if (trimmedName.length < 2) {
      setError('Nama ruangan minimal 2 karakter.');
      return;
    }
    if (trimmedLocation.length < 2) {
      setError('Lokasi ruangan minimal 2 karakter.');
      return;
    }
    if (!Number.isFinite(numericCapacity) || numericCapacity <= 0) {
      setError('Kapasitas harus berupa angka lebih besar dari 0.');
      return;
    }

    setError(null);

    try {
      if (room) {
        await updateRoom.mutateAsync({
          id: room.id,
          payload: {
            name: trimmedName,
            location: trimmedLocation,
            capacity: Math.round(numericCapacity),
            is_active: isActive,
            image_url: imageUrl || null,
            facilities,
          },
        });
        toast.success('Master ruangan diperbarui', {
          description: `${trimmedName} · ${trimmedLocation}`,
        });
      } else {
        await createRoom.mutateAsync({
          name: trimmedName,
          location: trimmedLocation,
          capacity: Math.round(numericCapacity),
          is_active: isActive,
          image_url: imageUrl || null,
          facilities,
        });
        toast.success('Ruang baru ditambahkan', {
          description: `${trimmedName} siap digunakan pada katalog.`,
        });
      }
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Data ruangan tidak dapat disimpan. Silakan coba lagi.',
      );
    }
  };

  const handleDelete = async () => {
    if (!room) return;
    setError(null);
    try {
      await deleteRoom.mutateAsync(room.id);
      toast.success('Ruangan berhasil dihapus', {
        description: `${room.name} telah dihapus dari master fasilitas.`,
      });
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Ruangan tidak dapat dihapus. Pastikan tidak ada peminjaman aktif.',
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Master fasilitas"
      title={isEditing ? 'Ubah data ruangan' : 'Tambah ruangan baru'}
      description={
        isEditing
          ? 'Perubahan langsung memengaruhi katalog dan pengajuan berikutnya.'
          : 'Lengkapi identitas ruangan agar peminjam dapat menilai kesesuaiannya.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama ruangan" htmlFor="room-name" required>
            <input
              id="room-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Ruang Seminar C"
              className="input"
              minLength={2}
              maxLength={100}
              required
            />
          </Field>

          <Field label="Lokasi" htmlFor="room-location" required>
            <input
              id="room-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Gedung A lt. 3"
              className="input"
              minLength={2}
              maxLength={100}
              required
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kapasitas (orang)" htmlFor="room-capacity" required hint="Maksimal peserta yang dapat ditampung.">
            <input
              id="room-capacity"
              type="number"
              inputMode="numeric"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="input input-mono"
              required
            />
          </Field>

          <Field
            label="Status operasional"
            hint={isActive ? 'Ruangan tampil dan dapat diajukan.' : 'Ruangan disembunyikan dari katalog publik.'}
          >
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((value) => !value)}
              className={cn(
                'flex h-[2.6rem] w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold transition-colors',
                isActive
                  ? 'border-sibiru-200 bg-sibiru-50 text-sibiru-700'
                  : 'border-ink-border bg-ink-soft text-ink-muted',
              )}
            >
              <span>{isActive ? 'Aktif & dapat dipinjam' : 'Nonaktif sementara'}</span>
              {isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
          </Field>
        </div>

        <Field
          label="Fasilitas"
          htmlFor="room-facilities"
          hint="Pisahkan dengan koma. Contoh: AC, Proyektor, Whiteboard."
          counter={`${facilities.length} item`}
        >
          <input
            id="room-facilities"
            type="text"
            value={facilitiesText}
            onChange={(event) => setFacilitiesText(event.target.value)}
            placeholder="AC, Proyektor, Sound System"
            className="input"
          />
        </Field>

        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facilities.map((facility) => (
              <span key={facility} className="chip">
                <Check size={10} className="text-sibiru-500" />
                {facility}
              </span>
            ))}
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-heading">
            Ilustrasi ruangan
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-[0.625rem] font-semibold transition-colors',
                imageUrl === ''
                  ? 'border-sibiru-300 bg-sibiru-50 text-sibiru-700'
                  : 'border-ink-border bg-white text-ink-muted hover:bg-ink-soft',
              )}
            >
              <Sparkles size={17} />
              Otomatis
            </button>

            {IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setImageUrl(preset.value)}
                className={cn(
                  'group relative flex h-[4.5rem] items-center justify-center overflow-hidden rounded-xl border p-1.5 transition-colors',
                  imageUrl === preset.value
                    ? 'border-sibiru-400 bg-sibiru-50'
                    : 'border-ink-border bg-ink-light/60 hover:border-sibiru-200',
                )}
              >
                <img
                  src={preset.value}
                  alt={preset.label}
                  className="max-h-12 w-auto object-contain"
                />
                {imageUrl === preset.value && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sibiru-500 text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-white/90 py-0.5 text-center text-[0.5rem] font-semibold text-ink-body">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.6875rem] leading-relaxed text-red-800">
            {error}
          </div>
        )}

        {isEditing && confirmDelete && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-900">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <p className="font-bold">Konfirmasi hapus ruangan {room?.name}?</p>
                <p className="mt-1 text-[0.6875rem] text-red-700">
                  Tindakan ini permanen. Ruangan hanya dapat dihapus bila tidak ada peminjaman aktif di masa mendatang.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    isLoading={deleteRoom.isPending}
                    onClick={() => void handleDelete()}
                  >
                    Ya, hapus permanen
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Batalkan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-ink-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isEditing && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} />
                Hapus ruangan
              </Button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending || deleteRoom.isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="accent"
              isLoading={isPending}
              disabled={deleteRoom.isPending}
            >
              {isEditing ? 'Simpan perubahan' : 'Tambah ruangan'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
