import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useRooms } from '../hooks/use-rooms';
import { RoomCard } from '../components/booking/RoomCard';
import { MyBookingsView } from '../components/booking/MyBookingsView';
import { AdminDashboardView } from '../components/admin/AdminDashboardView';

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

  // Fetch rooms from backend
  const { data: rooms, isLoading: isRoomsLoading, error: roomsError } = useRooms({
    is_active_only: true,
    min_capacity: capacityFilter,
    search: searchQuery || undefined,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#006569] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                🏛️
              </div>
              <div>
                <span className="font-bold text-lg text-[#006569] tracking-tight">SIBIRU</span>
                <span className="text-[11px] block text-slate-500 -mt-1 font-medium">
                  Sistem Informasi Peminjaman Ruangan
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('katalog')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'katalog'
                    ? 'bg-[#006569] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Katalog Ruangan
              </button>
              <button
                onClick={() => setActiveTab('pengajuan')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'pengajuan'
                    ? 'bg-[#006569] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Pengajuan Saya
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#006569] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Portal Pengelola (Admin)
                </button>
              )}
            </nav>
          </div>

          {/* Active Profile Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{currentAccount.name}</div>
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

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TAB 1: KATALOG RUANGAN */}
        {activeTab === 'katalog' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#006569] to-[#004f52] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block bg-[#F59E0B] text-slate-950 font-bold text-[11px] uppercase px-2.5 py-0.5 rounded-full mb-3 tracking-wider">
                  Self-Service Ruangan Kampus
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  Katalog & Ketersediaan Ruangan Real-Time
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                  Pilih ruangan yang sesuai kebutuhan kegiatan Anda. Cek slot jam kosong pada tanggal yang
                  diinginkan secara presisi dengan proteksi bentrok jadwal otomatis.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 text-9xl select-none font-bold -mb-4 -mr-4 pointer-events-none">
                SIBIRU
              </div>
            </div>

            {/* Filter and Date Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Cari nama ruangan atau gedung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006569]"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              </div>

              {/* Capacity Filter Segmented Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 mr-1 text-[11px]">Kapasitas:</span>
                <button
                  onClick={() => setCapacityFilter(undefined)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    capacityFilter === undefined
                      ? 'bg-[#006569] text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setCapacityFilter(30)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    capacityFilter === 30
                      ? 'bg-[#006569] text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ≥ 30 Orang
                </button>
                <button
                  onClick={() => setCapacityFilter(50)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    capacityFilter === 50
                      ? 'bg-[#006569] text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ≥ 50 Orang
                </button>
              </div>

              {/* Target Date Picker */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-mono rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006569]"
                />
              </div>
            </div>

            {/* Room Cards Grid */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms?.map((room) => (
                <RoomCard key={room.id} room={room} selectedDate={selectedDate} />
              ))}
            </div>
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
            <span className="w-2 h-2 rounded-full bg-[#006569] animate-pulse"></span>
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        🏛️ SIBIRU • Sistem Informasi Peminjaman Ruangan Internal Kampus (FastAPI + React 19 + TypeScript)
      </footer>
    </div>
  );
};
