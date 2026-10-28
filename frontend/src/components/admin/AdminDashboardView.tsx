import React, { useState } from 'react';
import {
  useAdminMetrics,
  useAdminBookings,
  useUpdateBookingStatus,
  useMasterSchedule,
  useToggleRoomStatus,
  useCreateRoom,
} from '../../hooks/use-admin';
import { useRooms } from '../../hooks/use-rooms';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatDateIndo, formatTimeRange } from '../../lib/utils';
import type { Booking } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'antrean' | 'jadwal' | 'ruangan'>('antrean');

  // Metrics
  const { data: metrics, isLoading: isMetricsLoading } = useAdminMetrics();

  // Bookings queue (Pending)
  const { data: bookings, isLoading: isBookingsLoading } = useAdminBookings();
  const updateStatus = useUpdateBookingStatus();
  const toggleRoomStatus = useToggleRoomStatus();
  const createRoom = useCreateRoom();

  // Rooms for management
  const { data: allRooms } = useRooms({ is_active_only: false });

  // Schedule range (today to 7 days later)
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  const { data: schedule } = useMasterSchedule(todayStr, nextWeekStr);

  // Rejection Modal State
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // New Room Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomLocation, setNewRoomLocation] = useState<string>('');
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(50);
  const [newRoomFacilities, setNewRoomFacilities] = useState<string>('AC, Proyektor, Whiteboard');

  const quickReasonChips = [
    'Ruangan dialokasikan untuk kegiatan resmi universitas.',
    'Fasilitas ruangan sedang dalam perbaikan dan pemeliharaan berkala.',
    'Di luar batas jam operasional dan izin penggunaan gedung kampus.',
    'Kapasitas ruangan tidak sesuai dengan estimasi peserta kegiatan.',
  ];

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'APPROVED' });
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui peminjaman');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    if (rejectionReason.trim().length < 3) {
      setRejectError('Alasan penolakan wajib diisi minimal 3 karakter.');
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: rejectingBooking.id,
        status: 'REJECTED',
        rejection_reason: rejectionReason.trim(),
      });
      setRejectingBooking(null);
      setRejectionReason('');
      setRejectError(null);
    } catch (err: any) {
      setRejectError(err.message || 'Gagal menolak peminjaman');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const facilitiesArray = newRoomFacilities
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      await createRoom.mutateAsync({
        name: newRoomName.trim(),
        location: newRoomLocation.trim(),
        capacity: Number(newRoomCapacity),
        facilities: facilitiesArray,
      });

      setIsAddRoomOpen(false);
      setNewRoomName('');
      setNewRoomLocation('');
      setNewRoomCapacity(50);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan ruangan');
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block mb-1">
            Menunggu Persetujuan
          </span>
          <div className="text-3xl font-bold text-amber-600 font-mono">
            {isMetricsLoading ? '...' : metrics?.pending_count ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Perlu tindakan verifikasi</span>
          <div className="w-1.5 h-full bg-[#F59E0B] absolute left-0 top-0" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <span className="text-xs font-semibold text-[#006569] uppercase tracking-wider block mb-1">
            Telah Disetujui
          </span>
          <div className="text-3xl font-bold text-[#006569] font-mono">
            {isMetricsLoading ? '...' : metrics?.approved_count ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Peminjaman aktif disahkan</span>
          <div className="w-1.5 h-full bg-[#006569] absolute left-0 top-0" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
            Peminjaman Hari Ini
          </span>
          <div className="text-3xl font-bold text-slate-800 font-mono">
            {isMetricsLoading ? '...' : metrics?.today_bookings_count ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Agenda berlangsung hari ini</span>
          <div className="w-1.5 h-full bg-slate-400 absolute left-0 top-0" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Ruangan Siap Pakai
          </span>
          <div className="text-3xl font-bold text-emerald-700 font-mono">
            {isMetricsLoading ? '...' : `${metrics?.active_rooms ?? 0}/${metrics?.total_rooms ?? 0}`}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Master fasilitas aktif</span>
          <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0" />
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveAdminSubTab('antrean')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeAdminSubTab === 'antrean'
              ? 'border-[#006569] text-[#006569]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Antrean Pengajuan</span>
          {metrics && metrics.pending_count > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
              {metrics.pending_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminSubTab('jadwal')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeAdminSubTab === 'jadwal'
              ? 'border-[#006569] text-[#006569]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Jadwal Master Kampus
        </button>

        <button
          onClick={() => setActiveAdminSubTab('ruangan')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeAdminSubTab === 'ruangan'
              ? 'border-[#006569] text-[#006569]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kelola Master Ruangan
        </button>
      </div>

      {/* SUBTAB 1: ANTREAN PENGAJUAN */}
      {activeAdminSubTab === 'antrean' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Permohonan Peminjaman Masuk
            </h3>
            <span className="text-xs text-slate-500">
              Total {bookings?.length ?? 0} data tercatat
            </span>
          </div>

          {isBookingsLoading && (
            <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
          )}

          {!isBookingsLoading && bookings?.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              Tidak ada pengajuan peminjaman saat ini.
            </div>
          )}

          <div className="space-y-3">
            {bookings?.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{b.borrower_name}</span>
                    <span className="text-xs text-slate-500">({b.organization})</span>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    🏛️ <strong>{b.room_name || b.room_id}</strong> — "{b.purpose}"
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    📅 {formatDateIndo(b.booking_date)} • 🕒 {formatTimeRange(b.start_time, b.end_time)}
                  </div>
                </div>

                {/* Actions for PENDING */}
                {b.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(b.id)}
                      isLoading={updateStatus.isPending}
                    >
                      ✓ Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setRejectingBooking(b);
                        setRejectionReason('');
                        setRejectError(null);
                      }}
                    >
                      ✕ Tolak
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: JADWAL MASTER KAMPUS */}
      {activeAdminSubTab === 'jadwal' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Master Schedule Timeline</h3>
              <p className="text-xs text-slate-500">
                Pemanfaatan seluruh ruangan untuk 7 hari ke depan ({todayStr} s/d {nextWeekStr})
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {schedule?.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Tidak ada agenda yang terjadwal dalam rentang tanggal ini.
              </div>
            ) : (
              schedule?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.room_name}</span>
                    <span className="text-slate-600">{item.purpose} • {item.organization}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-slate-700">
                      {item.booking_date} ({item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)})
                    </div>
                    <Badge status={item.status}>{item.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: KELOLA MASTER RUANGAN */}
      {activeAdminSubTab === 'ruangan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Daftar Master Ruangan Kampus</h3>
            <Button size="sm" variant="accent" onClick={() => setIsAddRoomOpen(true)}>
              + Tambah Ruangan Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allRooms?.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-base">{r.name}</h4>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">📍 {r.location} • 👥 Kapasitas: {r.capacity} orang</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {r.facilities.map((f, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Aktivasi Booking:</span>
                  <Button
                    size="sm"
                    variant={r.is_active ? 'outline' : 'primary'}
                    onClick={() => toggleRoomStatus.mutate({ id: r.id, is_active: !r.is_active })}
                    isLoading={toggleRoomStatus.isPending}
                  >
                    {r.is_active ? 'Nonaktifkan' : 'Aktifkan Ruangan'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      <Modal
        isOpen={Boolean(rejectingBooking)}
        onClose={() => setRejectingBooking(null)}
        title="Tolak Pengajuan Peminjaman"
        description="Wajib menyertakan alasan penolakan sesuai ketentuan backend PRD v1.0"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-500 block">Peminjam:</span>
            <strong className="text-slate-800">
              {rejectingBooking?.borrower_name} ({rejectingBooking?.organization})
            </strong>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alasan Penolakan (Minimal 3 Karakter):
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Jadwal bertabrakan dengan agenda resmi rektorat..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#006569] focus:outline-none"
            />
          </div>

          {/* Quick Reason Chips */}
          <div>
            <span className="text-slate-500 block mb-1.5 font-medium">💡 Rekomendasi Alasan Cepat:</span>
            <div className="flex flex-col gap-1.5">
              {quickReasonChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectionReason(chip)}
                  className="text-left text-[11px] p-2 rounded-lg bg-slate-50 hover:bg-[#E6F3F3] hover:text-[#006569] border border-slate-200 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {rejectError && (
            <div className="p-2 rounded bg-red-50 text-red-700 font-semibold">{rejectError}</div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectingBooking(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              isLoading={updateStatus.isPending}
            >
              Konfirmasi Tolak Pengajuan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADD ROOM MODAL */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Tambah Master Ruangan Baru"
        description="Daftarkan fasilitas ruangan baru ke dalam sistem katalog kampus"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Ruangan</label>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Contoh: Ruang Sidang Utama"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lokasi Gedung & Lantai</label>
            <input
              type="text"
              value={newRoomLocation}
              onChange={(e) => setNewRoomLocation(e.target.value)}
              placeholder="Contoh: Gedung Rektorat Lt. 4"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimal (Orang)</label>
            <input
              type="number"
              min={1}
              value={newRoomCapacity}
              onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Daftar Fasilitas (Pisahkan Koma)</label>
            <input
              type="text"
              value={newRoomFacilities}
              onChange={(e) => setNewRoomFacilities(e.target.value)}
              placeholder="AC, Proyektor, Sound System, Mic Wireless"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddRoomOpen(false)}>
              Batal
            </Button>
            <Button variant="accent" size="sm" type="submit" isLoading={createRoom.isPending}>
              Simpan Ruangan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
