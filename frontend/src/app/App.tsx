import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useRooms } from '../hooks/use-rooms';
import { RoomCard } from '../components/booking/RoomCard';
import { MyBookingsView } from '../components/booking/MyBookingsView';
import { AdminDashboardView } from '../components/admin/AdminDashboardView';
import {
  Building2,
  Monitor,
  CalendarDays,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle2,
  Clock3,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const App: React.FC = () => {
  const { activeToken, switchDemoUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'katalog' | 'pengajuan' | 'admin'>('katalog');

  // Search and filter states for room catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const demoAccounts = [
    {
      id: 'usr_admin_01',
      name: 'Budi Santoso, S.Kom.',
      role: 'ADMIN',
      badgeClass: 'bg-emerald-50 text-[#006569] border-[#006569]/30',
    },
    {
      id: 'usr_mhs_01',
      name: 'Ahmad Zaki',
      role: 'BORROWER (MHS)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    {
      id: 'usr_dosen_01',
      name: 'Dr. Siti Rahma, M.T.',
      role: 'BORROWER (DOSEN)',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    },
  ];

  const currentAccount = demoAccounts.find((a) => a.id === activeToken) || demoAccounts[1];
  const isAdmin = currentAccount.role === 'ADMIN';

  // Fetch rooms from backend service
  const { data: rooms, isLoading: isRoomsLoading, error: roomsError } = useRooms({
    is_active_only: true,
    min_capacity: capacityFilter,
    search: searchQuery || undefined,
  });

  const shortcuts = [
    { title: 'Auditorium Utama', icon: Building2, desc: 'Kapasitas 300 orang', filter: 100 },
    { title: 'Lab Komputer', icon: Monitor, desc: 'Fasilitas 40 PC & LAN', search: 'Lab' },
    { title: 'Ruang Seminar', icon: CalendarDays, desc: 'Kapasitas 80 orang', search: 'Seminar' },
    { title: 'Ruang Rapat Senat', icon: ShieldCheck, desc: 'Kapasitas 25 orang', search: 'Rapat' },
    { title: 'Pengajuan Saya', icon: ClipboardCheck, action: () => setActiveTab('pengajuan') },
    { title: 'Portal Admin', icon: Sparkles, action: () => setActiveTab('admin'), adminOnly: true },
  ];

  const steps = [
    { number: '01', name: 'Temukan', desc: 'Pilih ruang kuliah atau lab komputer', icon: Search },
    { number: '02', name: 'Periksa', desc: 'Cek jadwal & slot kosong 07:00–21:00', icon: CalendarDays },
    { number: '03', name: 'Ajukan', desc: 'Kirim permohonan nama kegiatan', icon: ClipboardCheck },
    { number: '04', name: 'Tinjau', desc: 'Admin memvalidasi ketersediaan', icon: ShieldCheck },
    { number: '05', name: 'Gunakan', desc: 'Agenda resmi aman tanpa bentrok', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#FCFDFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Navbar dengan Gaya MATRA */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE5E8] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo SIBIRU */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('katalog')}>
              <div className="w-10 h-10 rounded-xl bg-[#006569] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                🏛️
              </div>
              <div>
                <span className="font-bold text-xl text-[#006569] tracking-tight block">SIBIRU</span>
                <span className="text-[10px] block text-slate-500 font-medium uppercase tracking-wider -mt-0.5">
                  Fasilitas & Jadwal Kampus
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('katalog')}
                className={`relative px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'katalog'
                    ? 'text-[#006569]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Katalog Ruangan
                {activeTab === 'katalog' && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.75 bg-[#FFDD00] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('pengajuan')}
                className={`relative px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'pengajuan'
                    ? 'text-[#006569]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengajuan Saya
                {activeTab === 'pengajuan' && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.75 bg-[#FFDD00] rounded-full" />
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`relative px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'text-[#006569]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portal Pengelola (Admin)
                  {activeTab === 'admin' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.75 bg-[#FFDD00] rounded-full" />
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#17324D]">{currentAccount.name}</div>
              <div className="text-[10px] font-mono text-slate-400">{currentAccount.id}</div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${currentAccount.badgeClass}`}
            >
              {currentAccount.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TAB 1: KATALOG & HOME EXPERIENCE MATRA STYLE */}
        {activeTab === 'katalog' && (
          <div className="space-y-12">
            {/* Hero Editorial Section */}
            <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] pt-4 pb-8">
              <div className="relative z-10">
                <p className="editorial-eyebrow mb-4">
                  <span className="editorial-eyebrow-line" />
                  SISTEM INFORMASI RUANGAN INTERNAL
                </p>

                <h1 className="editorial-hero-title">
                  Temukan ruang.{' '}
                  <span className="block text-[#006569]">
                    Pastikan{' '}
                    <span className="relative inline-block whitespace-nowrap">
                      jadwalnya
                      <span className="hero-yellow-underline" aria-hidden="true" />
                    </span>
                    .
                  </span>
                </h1>

                <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-[#334155]">
                  Satu platform terintegrasi untuk memeriksa ketersediaan ruang kuliah, auditorium, dan
                  laboratorium komputer dengan jadwal real-time dan proteksi bentrok otomatis.
                </p>

                <p className="mt-2 max-w-lg text-xs leading-relaxed text-[#64748B]">
                  Lihat ketersediaan jam operasional secara mandiri tanpa harus login terlebih dahulu.
                  Pengajuan terlindungi dengan formula deteksi overlap presisi.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('search-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#006569] text-white text-xs font-bold hover:bg-[#00494B] shadow-sm transition-all"
                  >
                    <span>Cari Ruang & Lab</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={() => setActiveTab('pengajuan')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#DCE5E8] text-[#17324D] text-xs font-bold hover:bg-[#F2F5F7] shadow-xs transition-all"
                  >
                    <CalendarDays size={15} className="text-[#006569]" />
                    <span>Status Pengajuan Saya</span>
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[#64748B]">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#006569]" /> Akses informasi tanpa login
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} className="text-[#006569]" /> Seluruh waktu dalam WIB
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#006569]" /> Anti Double-Booking Lock
                  </span>
                </div>
              </div>

              {/* Hero Artwork Composition (MATRA Inspiration) */}
              <div className="hero-artwork relative mx-auto flex w-full max-w-lg items-center justify-center overflow-hidden rounded-3xl p-6">
                <div className="hero-artwork-disc" aria-hidden="true" />
                <div className="hero-artwork-scribble" aria-hidden="true" />
                <span aria-hidden="true" className="hero-asterisk">✳</span>

                <img
                  src="/assets/ilustrasi/main.webp"
                  alt="Ilustrasi Mahasiswa Kampus SIBIRU"
                  className="hero-main-webp relative z-10"
                />

                <div className="hero-floating-note">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F4F3] text-[#006569] shrink-0">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <strong className="block text-xs text-[#17324D]">Jadwal Kampus Terpadu</strong>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">Tersusun real-time per ruangan</span>
                  </div>
                </div>

                <div className="hero-floating-dot" aria-hidden="true" />
              </div>
            </section>

            {/* Quick Access Shortcuts Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="editorial-eyebrow text-[10px]">AKSES CEPAT</p>
                  <h2 className="section-title mt-1">Cari fasilitas yang Anda butuhkan.</h2>
                </div>
                <span className="text-xs text-[#64748B] hidden sm:block">Satu pintu fasilitas akademik</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {shortcuts.map((sc, idx) => {
                  if (sc.adminOnly && !isAdmin) return null;
                  const Icon = sc.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (sc.action) sc.action();
                        if (sc.search) setSearchQuery(sc.search);
                        if (sc.filter) setCapacityFilter(sc.filter);
                      }}
                      className="shortcut-tile group"
                    >
                      <span className="shortcut-icon">
                        <Icon size={22} strokeWidth={1.75} />
                      </span>
                      <span className="mt-3 block text-center text-xs font-bold text-[#17324D]">
                        {sc.title}
                      </span>
                      <span className="text-[10px] text-slate-400 text-center block mt-0.5">
                        {sc.desc || 'Lihat agenda'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Search & Filter Panel */}
            <section id="search-catalog" className="bg-[#F6F9F8] rounded-2xl border border-[#DFEBEA] p-5 sm:p-6 shadow-xs">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="editorial-eyebrow text-[10px]">PENCARIAN KETERSEDIAAN</p>
                  <h2 className="mt-1 text-lg font-bold text-[#17324D]">Filter Ruangan & Slot Waktu</h2>
                </div>
                <span className="inline-flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="h-2 w-2 rounded-full bg-[#006569]" />
                  Sinkronisasi langsung dengan API backend
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Search Input */}
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-[#17324D] mb-1.5">
                    Nama Ruangan / Gedung
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari auditorium, lab, ruang seminar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
                    />
                    <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                  </div>
                </div>

                {/* Capacity Pills */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-[#17324D] mb-1.5">
                    Kapasitas Minimum
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCapacityFilter(undefined)}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold transition-all ${
                        capacityFilter === undefined
                          ? 'bg-[#006569] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapacityFilter(30)}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold transition-all ${
                        capacityFilter === 30
                          ? 'bg-[#006569] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ≥ 30 Orang
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapacityFilter(50)}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold transition-all ${
                        capacityFilter === 50
                          ? 'bg-[#006569] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ≥ 50 Orang
                    </button>
                  </div>
                </div>

                {/* Target Date Picker */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-[#17324D] mb-1.5">
                    Tanggal Peminjaman
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
                  />
                </div>
              </div>
            </section>

            {/* Room Cards Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="editorial-eyebrow text-[10px]">DAFTAR RUANGAN</p>
                  <h2 className="section-title mt-1">Katalog Fasilitas Siap Pakai</h2>
                </div>
                <span className="text-xs text-[#64748B]">
                  Ditemukan {rooms?.length ?? 0} ruangan aktif
                </span>
              </div>

              {isRoomsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-slate-200" />
                  ))}
                </div>
              )}

              {roomsError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  Gagal memuat katalog ruangan dari backend service. Pastikan uvicorn server aktif di port 8000.
                </div>
              )}

              {!isRoomsLoading && rooms && rooms.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                  Tidak ada ruangan yang cocok dengan filter pencarian Anda.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms?.map((room) => (
                  <RoomCard key={room.id} room={room} selectedDate={selectedDate} />
                ))}
              </div>
            </section>

            {/* Process Track: Alur Peminjaman (Inspirasi MATRA) */}
            <section className="pt-8 pb-12 border-t border-slate-200">
              <p className="editorial-eyebrow">ALUR PEMINJAMAN</p>
              <h2 className="section-title mt-1">Dari mencari hingga menggunakan ruangan.</h2>

              <div className="process-track mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {steps.map((st) => {
                  const Icon = st.icon;
                  return (
                    <div key={st.number} className="process-step">
                      <div className="process-circle">
                        <Icon size={24} strokeWidth={1.6} />
                      </div>
                      <span className="mt-3 block text-xs font-bold text-[#006569]">{st.number}</span>
                      <h3 className="mt-0.5 text-xs font-bold text-[#17324D]">{st.name}</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: PENGAJUAN SAYA */}
        {activeTab === 'pengajuan' && <MyBookingsView />}

        {/* TAB 3: PORTAL ADMIN */}
        {activeTab === 'admin' && isAdmin && <AdminDashboardView />}
      </main>

      {/* Floating Demo Role Switcher */}
      <aside className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl p-3.5 shadow-xl max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006569] animate-pulse" />
            Switch Akun Demo (X-User-Id)
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {demoAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => {
                switchDemoUser(acc.id);
                if (acc.role !== 'ADMIN' && activeTab === 'admin') {
                  setActiveTab('katalog');
                }
              }}
              className={`text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                activeToken === acc.id
                  ? 'bg-[#006569] text-white font-semibold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <span className="block">{acc.name}</span>
                <span className="text-[10px] opacity-75 font-mono">{acc.id}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  activeToken === acc.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {acc.role.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Footer MATRA Style */}
      <footer className="border-t border-[#DCE5E8] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#006569]">SIBIRU</span>
            <span>• Sistem Informasi Peminjaman Ruangan Kampus</span>
          </div>
          <div className="text-[11px]">
            FastAPI REST API + React 19 Editorial Frontend • Referensi Desain MATRA
          </div>
        </div>
      </footer>
    </div>
  );
};
