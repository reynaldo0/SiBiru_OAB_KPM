import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  DoorOpen,
  MapPin,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRooms } from '../../hooks/use-rooms';
import { useToggleRoomStatus } from '../../hooks/use-admin';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import type { Room } from '../../types';
import { RoomFormModal } from '../../components/admin/RoomFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { RoomCardSkeleton } from '../../components/ui/Skeleton';
import { formatNumber, roomCategory, roomImage } from '../../lib/utils';

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export const RoomManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: rooms, isLoading, error, refetch, isFetching } = useRooms({
    search: debouncedSearch.trim() || undefined,
  });
  const toggleStatus = useToggleRoomStatus();

  const allRooms = rooms ?? [];

  const counts = useMemo(
    () => ({
      ALL: allRooms.length,
      ACTIVE: allRooms.filter((room) => room.is_active).length,
      INACTIVE: allRooms.filter((room) => !room.is_active).length,
    }),
    [allRooms],
  );

  const visibleRooms = useMemo(() => {
    return [...allRooms]
      .filter((room) => {
        if (activeFilter === 'ACTIVE') return room.is_active;
        if (activeFilter === 'INACTIVE') return !room.is_active;
        return true;
      })
      .sort((a, b) => {
        if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
        return a.name.localeCompare(b.name, 'id');
      });
  }, [allRooms, activeFilter]);

  const totalCapacity = useMemo(
    () => visibleRooms.reduce((sum, room) => sum + room.capacity, 0),
    [visibleRooms],
  );

  const openCreate = () => {
    setEditingRoom(null);
    setFormOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setFormOpen(true);
  };

  const handleToggle = async (room: Room) => {
    try {
      await toggleStatus.mutateAsync({ id: room.id, is_active: !room.is_active });
      toast.success(room.is_active ? 'Ruangan dinonaktifkan' : 'Ruangan diaktifkan kembali', {
        description: room.is_active
          ? `${room.name} disembunyikan dari katalog publik.`
          : `${room.name} kembali dapat diajukan.`,
      });
    } catch (toggleError) {
      toast.error('Status ruangan tidak dapat diubah', {
        description:
          toggleError instanceof Error
            ? toggleError.message
            : 'Silakan coba lagi beberapa saat lagi.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Master ruangan</p>
          <h2 className="display-title mt-3 text-[clamp(1.85rem,3vw,2.6rem)]">
            Fasilitas yang <span className="text-sibiru-600">selalu akurat</span>.
          </h2>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-muted">
            Kelola identitas ruangan, kapasitas, fasilitas, dan status operasional. Perubahan langsung
            memengaruhi katalog serta formulir pengajuan peminjam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} isLoading={isFetching}>
            <DoorOpen size={14} />
            Segarkan
          </Button>
          <Button variant="accent" onClick={openCreate}>
            <Plus size={15} />
            Tambah ruangan
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan ruangan">
        <SummaryTile
          label="Total ruangan"
          value={counts.ALL}
          hint="Seluruh master fasilitas"
          icon={Building2}
          tone="neutral"
        />
        <SummaryTile
          label="Aktif"
          value={counts.ACTIVE}
          hint="Tampil di katalog publik"
          icon={CheckCircle2}
          tone="teal"
        />
        <SummaryTile
          label="Nonaktif"
          value={counts.INACTIVE}
          hint="Disembunyikan sementara"
          icon={ToggleLeft}
          tone="gold"
        />
        <SummaryTile
          label="Kapasitas tampil"
          value={totalCapacity}
          hint={`${visibleRooms.length} ruangan sesuai filter`}
          icon={Users}
          tone="teal"
          format
        />
      </section>

      <section className="rounded-2xl border border-ink-border bg-white p-4 shadow-subtle sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama ruangan atau lokasi gedung…"
              className="input pl-9"
              aria-label="Cari ruangan"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:bg-ink-soft hover:text-ink-heading"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              <SlidersHorizontal size={12} />
              Status
            </span>
            <SegmentedControl
              value={activeFilter}
              onChange={setActiveFilter}
              ariaLabel="Filter status ruangan"
              options={[
                { label: 'Semua', value: 'ALL', count: counts.ALL },
                { label: 'Aktif', value: 'ACTIVE', count: counts.ACTIVE },
                { label: 'Nonaktif', value: 'INACTIVE', count: counts.INACTIVE },
              ]}
            />
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800">
          <p className="font-bold">Master ruangan belum dapat dimuat</p>
          <p className="mt-1 text-xs leading-relaxed text-red-700">
            Pastikan layanan backend aktif dan sesi pengelola masih berlaku.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      {!isLoading && !error && visibleRooms.length === 0 && (
        <EmptyState
          icon={DoorOpen}
          title={search.trim() ? 'Tidak ada ruangan yang cocok' : 'Belum ada ruangan'}
          description={
            search.trim()
              ? 'Gunakan kata kunci lain atau atur ulang filter status.'
              : 'Tambahkan ruangan pertama agar peminjam dapat melihat fasilitas kampus.'
          }
          action={
            search.trim() ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setActiveFilter('ALL');
                }}
              >
                <X size={14} />
                Atur ulang filter
              </Button>
            ) : (
              <Button variant="accent" onClick={openCreate}>
                <Plus size={15} />
                Tambah ruangan
              </Button>
            )
          }
        />
      )}

      {!isLoading && !error && visibleRooms.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRooms.map((room) => (
            <RoomManagementCard
              key={room.id}
              room={room}
              isToggling={toggleStatus.isPending && toggleStatus.variables?.id === room.id}
              onEdit={() => openEdit(room)}
              onToggle={() => void handleToggle(room)}
            />
          ))}
        </div>
      )}

      <RoomFormModal
        isOpen={formOpen}
        room={editingRoom}
        onClose={() => {
          setFormOpen(false);
          setEditingRoom(null);
        }}
      />
    </div>
  );
};

const RoomManagementCard: React.FC<{
  room: Room;
  isToggling: boolean;
  onEdit: () => void;
  onToggle: () => void;
}> = ({ room, isToggling, onEdit, onToggle }) => {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-border bg-white shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative h-40 overflow-hidden bg-sibiru-50">
        <img
          src={roomImage(room)}
          alt={`Ilustrasi ${room.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sibiru-950/55 via-sibiru-950/5 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <Badge variant={room.is_active ? 'active' : 'inactive'} className="bg-white/95 shadow-subtle">
            {room.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
          <span className="rounded-md bg-white/90 px-1.5 py-0.5 font-mono text-[0.5rem] font-semibold text-ink-body backdrop-blur">
            {room.id.slice(-8)}
          </span>
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <p className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-gold-300">
            {roomCategory(room)}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-bold text-white">{room.name}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.6875rem] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="text-sibiru-500" />
            {room.location}
          </span>
          <span className="inline-flex items-center gap-1 font-mono">
            <Users size={11} className="text-sibiru-500" />
            {formatNumber(room.capacity)} orang
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.facilities.length > 0 ? (
            room.facilities.slice(0, 4).map((facility) => (
              <span
                key={facility}
                className="rounded-md border border-ink-border bg-ink-soft px-1.5 py-0.5 text-[0.5625rem] font-medium text-ink-body"
              >
                {facility}
              </span>
            ))
          ) : (
            <span className="text-[0.5625rem] italic text-ink-muted">Fasilitas belum dicatat</span>
          )}
          {room.facilities.length > 4 && (
            <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[0.5625rem] text-ink-muted">
              +{room.facilities.length - 4}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-border/70 pt-3.5">
          <button
            type="button"
            role="switch"
            aria-checked={room.is_active}
            aria-label={room.is_active ? `Nonaktifkan ${room.name}` : `Aktifkan ${room.name}`}
            onClick={onToggle}
            disabled={isToggling}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[0.625rem] font-semibold transition-colors disabled:opacity-50 ${
              room.is_active
                ? 'border-sibiru-200 bg-sibiru-50 text-sibiru-700 hover:bg-sibiru-100'
                : 'border-ink-border bg-ink-soft text-ink-muted hover:bg-white'
            }`}
          >
            {room.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
            {isToggling ? 'Menyimpan…' : room.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </button>

          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil size={13} />
            Ubah
          </Button>
        </div>
      </div>
    </article>
  );
};

const SummaryTile: React.FC<{
  label: string;
  value: number;
  hint: string;
  icon: React.ElementType;
  tone: 'teal' | 'gold' | 'neutral';
  format?: boolean;
}> = ({ label, value, hint, icon: Icon, tone, format }) => {
  const toneClasses = {
    teal: 'border-sibiru-100 bg-sibiru-50 text-sibiru-600',
    gold: 'border-gold-200 bg-gold-50 text-gold-700',
    neutral: 'border-ink-border bg-ink-soft text-ink-body',
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-ink-border bg-white p-4 shadow-subtle">
      <div className="min-w-0">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold text-ink-heading">
          {format ? formatNumber(value) : value}
        </p>
        <p className="mt-0.5 truncate text-[0.5625rem] text-ink-muted">{hint}</p>
      </div>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>
        <Icon size={17} strokeWidth={1.8} />
      </span>
    </div>
  );
};
