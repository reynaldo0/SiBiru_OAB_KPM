import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  Monitor,
  Presentation,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useRooms } from '../hooks/use-rooms';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDateLong, todayISO } from '../lib/dates';
import { APP_CONFIG } from '../lib/constants';
import { isLabRoom, roomCategory, roomImage } from '../lib/utils';
import type { Room } from '../types';

const steps = [
  {
    number: '01',
    title: 'Temukan ruang',
    description: 'Saring katalog berdasarkan kapasitas, fasilitas, dan lokasi gedung.',
    icon: Building2,
  },
  {
    number: '02',
    title: 'Periksa jadwal',
    description: 'Baca timeline ketersediaan per jam pada tanggal yang Anda rencanakan.',
    icon: Clock3,
  },
  {
    number: '03',
    title: 'Ajukan slot',
    description: 'Kirim permohonan dengan slot waktu yang bebas dari bentrok.',
    icon: ClipboardCheck,
  },
  {
    number: '04',
    title: 'Gunakan ruang',
    description: 'Setelah disetujui pengelola, agenda Anda terlindungi dari double-booking.',
    icon: ShieldCheck,
  },
];

export const HomePage: React.FC = () => {
  const { data: rooms, isLoading, error } = useRooms({ is_active_only: true });

  const featured = rooms?.slice(0, 3) ?? [];
  const maxCapacity = rooms?.reduce((max, room) => Math.max(max, room.capacity), 0) ?? 0;

  const shortcuts = [
    {
      label: 'Auditorium',
      caption: 'Agenda besar kampus',
      icon: Building2,
      room: rooms?.find((room) => /auditorium|aula/i.test(room.name)),
      query: 'auditorium',
    },
    {
      label: 'Laboratorium',
      caption: 'Praktikum & komputer',
      icon: Monitor,
      room: rooms?.find((room) => isLabRoom(room)),
      query: 'lab',
    },
    {
      label: 'Ruang seminar',
      caption: 'Kelas & presentasi',
      icon: Presentation,
      room: rooms?.find((room) => /seminar/i.test(room.name)),
      query: 'seminar',
    },
    {
      label: 'Ruang rapat',
      caption: 'Koordinasi terbatas',
      icon: Users,
      room: rooms?.find((room) => /rapat|sidang/i.test(room.name)),
      query: 'rapat',
    },
  ];

  return (
    <div className="bg-ink-light">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-border bg-gradient-to-b from-white via-ink-light to-ink-light">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5] bg-dot-grid [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]"
          aria-hidden="true"
        />
        <div className="page-container relative grid gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow animate-fade-up">Sistem informasi ruangan kampus</p>

            <h1 className="display-title mt-5 text-[clamp(2.6rem,6vw,4.6rem)] animate-fade-up [animation-delay:80ms]">
              Ruang kampus,
              <span className="mt-1 block text-sibiru-600">
                tanpa{' '}
                <span className="gold-mark">ragu.</span>
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-body animate-fade-up [animation-delay:160ms] sm:text-[0.9375rem]">
              Satu tempat untuk menemukan ruang, membaca jadwal per jam, dan mengajukan peminjaman
              yang bebas tumpang tindih. Dirancang untuk civitas akademika, dikelola oleh satu
              pintu fasilitas.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:220ms]">
              <Link
                to="/katalog"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-sibiru-500 px-6 text-sm font-semibold text-white shadow-card transition-all hover:bg-sibiru-600"
              >
                Jelajahi katalog ruang
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                to="/pengajuan-saya"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-borderStrong bg-white px-5 text-sm font-semibold text-ink-heading shadow-subtle transition-colors hover:border-sibiru-200 hover:bg-sibiru-50"
              >
                <ClipboardCheck size={16} className="text-sibiru-500" />
                Status pengajuan
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.6875rem] font-medium text-ink-muted animate-fade-up [animation-delay:280ms]">
              {[
                'Informasi terbuka tanpa login',
                `Operasional ${APP_CONFIG.OPERATING_HOURS.LABEL}`,
                'Proteksi bentrok otomatis',
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-sibiru-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial artwork composition */}
          <div className="relative mx-auto w-full max-w-[30rem] animate-fade-up [animation-delay:200ms]">
            <div
              className="absolute -inset-5 rounded-[2.75rem] bg-gradient-to-br from-sibiru-100/70 via-white/40 to-gold-100/60 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-ink-border bg-gradient-to-br from-sibiru-50 via-white to-gold-50/70 p-6 shadow-card sm:p-8">
              <span
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sibiru-200/40"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full border border-gold-400/40"
                aria-hidden="true"
              />
              <span
                className="absolute right-5 top-5 z-20 font-display text-2xl text-gold-500"
                aria-hidden="true"
              >
                ✳
              </span>

              <img
                src="/assets/ilustrasi/main.webp"
                alt="Ilustrasi mahasiswa menuju ruang kampus SIBIRU"
                className="relative z-10 mx-auto max-h-[19rem] w-auto object-contain drop-shadow-[0_22px_34px_rgba(0,42,43,0.14)]"
              />

              <div className="absolute -bottom-4 -left-3 z-20 flex items-center gap-2.5 rounded-xl border border-ink-border bg-white/95 px-3.5 py-2.5 shadow-card backdrop-blur sm:-left-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sibiru-50 text-sibiru-600">
                  <CalendarDays size={17} />
                </span>
                <div>
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-sibiru-600">
                    Jadwal terpadu
                  </p>
                  <p className="mt-0.5 font-mono text-[0.625rem] text-ink-muted">
                    {formatDateLong(todayISO())}
                  </p>
                </div>
              </div>

              <div className="absolute -right-2 top-16 z-20 hidden items-center gap-1.5 rounded-full border border-ink-border bg-white/95 px-3 py-1.5 shadow-subtle backdrop-blur sm:flex">
                <ShieldCheck size={13} className="text-sibiru-500" />
                <span className="text-[0.625rem] font-semibold text-ink-heading">Anti bentrok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric strip */}
        <div className="border-t border-ink-border bg-white/60">
          <div className="page-container grid grid-cols-2 divide-x divide-ink-border sm:grid-cols-4">
            {[
              { label: 'Ruang aktif', value: rooms ? String(rooms.length).padStart(2, '0') : '—' },
              { label: 'Kapasitas terbesar', value: maxCapacity ? `${maxCapacity}` : '—', suffix: 'orang' },
              { label: 'Jam operasional', value: '07–21', suffix: 'WIB' },
              { label: 'Double-booking', value: '0', suffix: 'toleransi' },
            ].map((metric) => (
              <div key={metric.label} className="px-4 py-4 first:pl-0 last:pr-0 sm:px-6">
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  {metric.label}
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-ink-heading">
                  {metric.value}
                  {metric.suffix && (
                    <span className="ml-1 text-[0.625rem] font-medium text-ink-muted">
                      {metric.suffix}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shortcuts */}
      <section className="page-container py-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link
                key={shortcut.label}
                to={shortcut.room ? `/ruangan/${shortcut.room.id}` : `/katalog?q=${shortcut.query}`}
                className="group flex items-center gap-3 rounded-xl border border-ink-border bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-sibiru-200 hover:shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sibiru-100 bg-sibiru-50 text-sibiru-600 transition-colors group-hover:bg-sibiru-500 group-hover:text-white">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.75rem] font-bold text-ink-heading">
                    {shortcut.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.625rem] text-ink-muted">
                    {shortcut.caption}
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="ml-auto shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sibiru-600"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured rooms */}
      <section className="page-container pb-14 pt-4">
        <SectionHeading
          eyebrow="Ruang pilihan"
          title="Fasilitas yang paling sering digunakan."
          description="Tiga ruang utama kampus dengan kapasitas dan karakter berbeda. Setiap kartu menampilkan ketersediaan nyata pada tanggal yang dipilih."
          action={
            <Link
              to="/katalog"
              className="group inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-sibiru-600 transition-colors hover:text-sibiru-700"
            >
              Lihat seluruh katalog
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-ink-border bg-white"
              >
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}

          {error && (
            <div className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              Katalog belum dapat dimuat. Pastikan layanan backend aktif di port 8000.
            </div>
          )}

          {featured.map((room, index) => (
            <SpotlightRoom key={room.id} room={room} index={index} />
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-ink-border bg-white">
        <div className="page-container py-14">
          <SectionHeading
            eyebrow="Alur peminjaman"
            title="Empat langkah, satu kepastian."
            description="Prosedur yang sama digunakan oleh peminjam dan pengelola, sehingga status setiap permohonan dapat dilacak."
          />

          <div className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-sibiru-200 via-ink-border to-transparent lg:block"
              aria-hidden="true"
            />
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-border bg-white text-sibiru-600 shadow-subtle">
                    <Icon size={20} strokeWidth={1.7} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 font-mono text-[0.5rem] font-bold text-sibiru-900">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[0.875rem] font-bold text-ink-heading">{step.title}</h3>
                  <p className="mt-1.5 max-w-[15rem] text-[0.75rem] leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing invitation */}
      <section className="page-container py-14">
        <div className="relative overflow-hidden rounded-3xl bg-sibiru-900 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] bg-dot-grid"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-gold-400/20"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-gold-400">
                <span className="h-px w-6 bg-gold-400/70" />
                Mulai dari ruang yang tepat
              </p>
              <h2 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,2.8rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-white">
                Agenda kampus Anda layak mendapat ruang yang pasti.
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-white/60 sm:text-[0.8125rem]">
                Periksa slot kosong, ajukan dalam beberapa langkah, lalu pantau keputusan pengelola
                pada satu halaman yang sama.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/katalog"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-400 px-5 text-[0.8125rem] font-bold text-sibiru-900 transition-colors hover:bg-gold-300"
                >
                  Mulai dari katalog
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-[0.8125rem] font-semibold text-white/85 transition-colors hover:bg-white/10"
                >
                  <Sparkles size={15} className="text-gold-400" />
                  Masuk dengan akun kampus
                </Link>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-xs lg:block">
              <span
                className="absolute inset-x-4 bottom-2 top-6 rounded-[50%] bg-gold-400/20 blur-2xl"
                aria-hidden="true"
              />
              <img
                src="/assets/ilustrasi/ruang-kuliah.webp"
                alt="Ilustrasi ruang kuliah kampus"
                className="relative z-10 w-full object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SpotlightRoom: React.FC<{ room: Room; index: number }> = ({ room, index }) => {
  return (
    <Link
      to={`/ruangan/${room.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-border bg-white shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:border-sibiru-200 hover:shadow-card"
    >
      <div className="room-art relative flex h-44 items-center justify-center overflow-hidden px-6">
        <span
          className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full border border-sibiru-500/10"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-6 right-5 h-16 w-16 rounded-full bg-gold-400/20"
          aria-hidden="true"
        />
        <span className="absolute left-4 top-4 z-20 font-mono text-[0.625rem] font-semibold tracking-[0.18em] text-sibiru-700/60">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-ink-border bg-white/95 px-2.5 py-1 text-[0.625rem] font-semibold text-ink-heading shadow-subtle backdrop-blur">
          <Users size={11} className="text-sibiru-500" />
          {room.capacity}
        </span>
        <img
          src={roomImage(room)}
          alt={room.name}
          loading="lazy"
          className="relative z-10 max-h-36 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,42,43,0.12)] transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-sibiru-600">
          {roomCategory(room)}
        </p>
        <h3 className="mt-1 text-[0.9375rem] font-bold leading-snug text-ink-heading transition-colors group-hover:text-sibiru-600">
          {room.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-ink-muted">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{room.location}</span>
        </p>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {room.facilities.slice(0, 3).map((facility) => (
            <span key={facility} className="chip">
              {facility}
            </span>
          ))}
          {room.facilities.length > 3 && (
            <span className="chip border-dashed text-ink-muted">
              +{room.facilities.length - 3}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink-border/70 pt-3.5">
          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-sibiru-600">
            Periksa ketersediaan
          </span>
          <ArrowUpRight
            size={15}
            className="text-sibiru-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
};
