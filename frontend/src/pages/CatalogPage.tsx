import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useRooms } from '../hooks/use-rooms';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { RoomCard } from '../components/booking/RoomCard';
import { RoomCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { DateStepper } from '../components/ui/DateStepper';
import { formatDateLong, todayISO } from '../lib/dates';
import { CAPACITY_OPTIONS } from '../lib/constants';
import { cn, isLabRoom, isLargeVenue } from '../lib/utils';

type CategoryFilter = 'ALL' | 'LAB' | 'LARGE' | 'ACADEMIC';
type SortMode = 'name' | 'capacity';

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Laboratorium', value: 'LAB' },
  { label: 'Ruang besar', value: 'LARGE' },
  { label: 'Ruang akademik', value: 'ACADEMIC' },
];

function matchesCategory(room: { name: string; capacity: number }, category: CategoryFilter): boolean {
  if (category === 'ALL') return true;
  if (category === 'LAB') return isLabRoom(room);
  if (category === 'LARGE') return !isLabRoom(room) && isLargeVenue(room);
  return !isLabRoom(room) && !isLargeVenue(room);
}

export const CatalogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramQuery = searchParams.get('q') ?? '';
  const paramCapacity = Number(searchParams.get('kapasitas') ?? '');

  const [search, setSearch] = useState(paramQuery);
  const [capacity, setCapacity] = useState<number | undefined>(
    Number.isFinite(paramCapacity) && paramCapacity > 0 ? paramCapacity : undefined,
  );
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [facility, setFacility] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('name');
  const [date, setDate] = useState(todayISO());

  const debouncedSearch = useDebouncedValue(search, 320);

  useEffect(() => {
    setSearch(paramQuery);
  }, [paramQuery]);

  const { data: rooms, isLoading, error, isFetching } = useRooms({
    is_active_only: true,
    min_capacity: capacity,
    search: debouncedSearch.trim() || undefined,
  });

  const facilities = useMemo(() => {
    const all = new Set<string>();
    rooms?.forEach((room) => room.facilities.forEach((item) => all.add(item)));
    return Array.from(all).slice(0, 8);
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    const filtered = (rooms ?? []).filter((room) => {
      if (!matchesCategory(room, category)) return false;
      if (facility && !room.facilities.some((item) => item === facility)) return false;
      return true;
    });

    return filtered.sort((a, b) =>
      sort === 'capacity' ? b.capacity - a.capacity : a.name.localeCompare(b.name, 'id'),
    );
  }, [rooms, category, facility, sort]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    typeof capacity === 'number' ||
    category !== 'ALL' ||
    Boolean(facility) ||
    date !== todayISO();

  const resetFilters = () => {
    setSearch('');
    setCapacity(undefined);
    setCategory('ALL');
    setFacility(null);
    setDate(todayISO());
    setSort('name');
  };

  return (
    <div className="page-container py-10 sm:py-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Katalog ruangan</p>
          <h1 className="display-title mt-4 text-[clamp(2.1rem,4.4vw,3.4rem)]">
            Temukan ruang yang <span className="text-sibiru-600">sesuai</span> dengan agenda Anda.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
            Saring berdasarkan kapasitas, jenis ruang, dan fasilitas. Timeline pada setiap kartu
            menunjukkan ketersediaan nyata pada tanggal acuan.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <DateStepper value={date} onChange={setDate} label="Tanggal acuan" />
          <p className="font-mono text-[0.625rem] text-ink-muted">{formatDateLong(date)}</p>
        </div>
      </header>

      {/* Filter surface */}
      <section className="mt-8 rounded-2xl border border-ink-border bg-white p-4 shadow-subtle sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-border bg-ink-soft/60 px-2.5 py-2 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              <SlidersHorizontal size={12} />
              Kapasitas
            </span>
            {CAPACITY_OPTIONS.map((option) => {
              const active = capacity === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setCapacity(option.value)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-[0.6875rem] font-semibold transition-colors',
                    active
                      ? 'border-sibiru-500 bg-sibiru-500 text-white'
                      : 'border-ink-border bg-white text-ink-body hover:border-sibiru-200 hover:bg-sibiru-50',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-ink-border/70 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              <Filter size={12} />
              Jenis
            </span>
            {categoryOptions.map((option) => {
              const active = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors',
                    active
                      ? 'border-sibiru-200 bg-sibiru-50 text-sibiru-700'
                      : 'border-ink-border bg-white text-ink-muted hover:bg-ink-soft hover:text-ink-body',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {facilities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
                Fasilitas
              </span>
              {facilities.map((item) => {
                const active = facility === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFacility(active ? null : item)}
                    className={cn(
                      'rounded-md border px-2 py-1 text-[0.625rem] font-medium transition-colors',
                      active
                        ? 'border-gold-300 bg-gold-50 text-gold-900'
                        : 'border-ink-border bg-white text-ink-body hover:bg-ink-soft',
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Results header */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[0.75rem] font-semibold text-ink-heading">
            {visibleRooms.length} ruangan
            {hasActiveFilters && <span className="font-normal text-ink-muted"> sesuai filter</span>}
          </p>
          {isFetching && !isLoading && (
            <span className="inline-flex items-center gap-1.5 text-[0.625rem] text-ink-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sibiru-500" />
              memperbarui
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="catalog-sort" className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
            Urutkan
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="input h-9 w-auto py-0 text-[0.6875rem]"
          >
            <option value="name">Nama ruangan</option>
            <option value="capacity">Kapasitas terbesar</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw size={13} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800">
          <p className="font-bold">Katalog belum dapat dimuat</p>
          <p className="mt-1 text-xs leading-relaxed text-red-700">
            Tidak dapat terhubung ke server SIBIRU. Periksa koneksi internet Anda atau coba beberapa saat lagi.
          </p>
        </div>
      ) : visibleRooms.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={Search}
          title="Tidak ada ruangan yang cocok"
          description="Coba longgarkan kapasitas minimum, hapus filter fasilitas, atau gunakan kata kunci lain."
          action={
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw size={14} />
              Atur ulang filter
            </Button>
          }
        />
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} selectedDate={date} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
