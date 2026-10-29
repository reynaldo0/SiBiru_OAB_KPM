import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="page-container flex min-h-[62vh] items-center justify-center py-14">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-ink-border bg-white p-8 text-center shadow-card sm:p-12">
        <span
          className="pointer-events-none absolute -left-14 -bottom-16 h-48 w-48 rounded-full border border-sibiru-500/10"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold-100/70"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="font-display text-[clamp(4rem,10vw,6rem)] font-semibold leading-none tracking-[-0.05em] text-sibiru-100">
            404
          </p>
          <div className="mx-auto -mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-sibiru-100 bg-white text-sibiru-600 shadow-subtle">
            <Compass size={24} strokeWidth={1.6} />
          </div>

          <h1 className="mt-4 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-tight tracking-[-0.03em] text-ink-heading">
            Ruang ini tidak ada di peta.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-ink-muted">
            Tautan mungkin sudah berubah atau halaman telah dipindahkan. Kembali ke katalog untuk
            menemukan ruang yang Anda butuhkan.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              to="/katalog"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sibiru-500 px-4 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-sibiru-600"
            >
              Jelajahi katalog
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
        </div>
      </div>
    </div>
  );
};
