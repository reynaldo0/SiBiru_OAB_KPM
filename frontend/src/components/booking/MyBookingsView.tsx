import React, { useState } from 'react';
import { useMyBookings } from '../../hooks/use-bookings';
import type { BookingStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { formatTimeRange, formatDateIndo } from '../../lib/utils';

export const MyBookingsView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const { data: bookings, isLoading, error } = useMyBookings(statusFilter);

  const filterTabs: Array<{ label: string; value: BookingStatus | undefined }> = [
    { label: 'Semua', value: undefined },
    { label: 'Menunggu (Pending)', value: 'PENDING' },
    { label: 'Disetujui (Approved)', value: 'APPROVED' },
    { label: 'Ditolak (Rejected)', value: 'REJECTED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengajuan Saya</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status verifikasi peminjaman ruangan yang telah Anda ajukan.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          Gagal memuat riwayat pengajuan. Pastikan server backend sedang aktif.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bookings && bookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="font-semibold text-slate-800 text-sm">Belum Ada Pengajuan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Anda belum memiliki permohonan peminjaman ruangan dengan filter ini. Silakan buka katalog untuk mulai mengajukan.
          </p>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings?.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#006569] uppercase tracking-wider block">
                  {b.room_name || b.room_id}
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  {b.purpose}
                </h3>
              </div>
              <Badge status={b.status}>{b.status}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                <span>{formatDateIndo(b.booking_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span>🕒</span>
                <span>{formatTimeRange(b.start_time, b.end_time)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🏛️</span>
                <span>Organisasi: {b.organization}</span>
              </div>
            </div>

            {/* Rejection Alert Card if REJECTED */}
            {b.status === 'REJECTED' && b.rejection_reason && (
              <div className="mt-2 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-950 flex items-start gap-2.5">
                <span className="text-base leading-none text-red-600">🛑</span>
                <div className="flex-1">
                  <span className="font-bold text-red-900 block mb-0.5">Alasan Penolakan dari Admin:</span>
                  <p className="text-red-800 italic leading-relaxed">
                    "{b.rejection_reason}"
                  </p>
                  <div className="mt-2 text-[11px] text-red-700">
                    💡 Anda dapat mengajukan permohonan baru pada slot waktu atau ruangan lain.
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
