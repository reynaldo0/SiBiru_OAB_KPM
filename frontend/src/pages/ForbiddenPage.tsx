import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="page-container flex min-h-[62vh] items-center justify-center py-14">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-ink-border bg-white p-8 text-center shadow-card sm:p-12">
        <span
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-100/70"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-200 bg-gold-50 text-gold-700">
            <ShieldAlert size={28} strokeWidth={1.6} />
          </div>
          <p className="mt-5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-gold-700">
            Galat 403 · Akses ditolak
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em] text-ink-heading">
            Halaman ini khusus pengelola.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-ink-muted">
            Akun Anda tidak memiliki hak akses administrator. Anda tetap dapat menjelajahi katalog,
            memeriksa jadwal, dan mengelola pengajuan pribadi.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              to="/katalog"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sibiru-500 px-4 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-sibiru-600"
            >
              Buka katalog ruangan
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-border bg-white px-4 text-[0.8125rem] font-semibold text-ink-heading transition-colors hover:bg-ink-soft"
            >
              <ArrowLeft size={15} />
              Kembali ke beranda
            </Link>
          </div>

          <p className="mt-5 text-[0.625rem] text-ink-muted">
            Ingin beralih peran? Gunakan menu akun demo pada bilah navigasi.
          </p>
        </div>
      </div>
    </div>
  );
};
