import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock3, LayoutDashboard, LogIn, Menu, ShieldCheck, X } from 'lucide-react';
import { NAV_ITEMS, APP_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth.store';
import { Logo } from './Logo';
import { RoleSwitcher } from './RoleSwitcher';

export const PublicShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-ink-light text-ink-body">
      <a href="#main-content" className="skip-link">
        Lompat ke konten utama
      </a>

      <header className="sticky top-0 z-40">
        <div className="bg-sibiru-900 text-white/60">
          <div className="page-container flex h-8 items-center justify-between gap-4 text-[0.625rem] font-medium tracking-wide">
            <span className="truncate">
              Layanan Fasilitas Akademik <span className="mx-1.5 text-white/25">·</span> Akses publik terbuka
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Clock3 size={11} className="text-gold-400" />
              Jam operasional {APP_CONFIG.OPERATING_HOURS.LABEL}
            </span>
          </div>
        </div>

        <div className="border-b border-ink-border bg-white/95 backdrop-blur-md">
          <div className="page-container flex h-[4.25rem] items-center justify-between gap-4">
            <Logo />

            <nav className="hidden h-full items-center lg:flex" aria-label="Navigasi utama">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn('nav-link', isActive && 'nav-link-active')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Button Dashboard Pengelola */}
              {user?.role === 'ADMIN' ? (
                <Link
                  to="/admin"
                  className="hidden h-9 items-center gap-1.5 rounded-xl border border-sibiru-600 bg-sibiru-900 px-3.5 text-xs font-bold text-white shadow-subtle transition-all duration-200 hover:bg-sibiru-800 sm:inline-flex"
                >
                  <LayoutDashboard size={14} className="text-gold-400" />
                  Dashboard Pengelola
                </Link>
              ) : (
                <Link
                  to="/login?next=/admin"
                  className="hidden h-9 items-center gap-1.5 rounded-xl border border-ink-borderStrong bg-ink-soft/70 px-3 text-xs font-semibold text-ink-heading shadow-subtle transition-all duration-200 hover:border-sibiru-300 hover:bg-sibiru-50 sm:inline-flex"
                >
                  <LayoutDashboard size={14} className="text-sibiru-600" />
                  Portal Pengelola
                </Link>
              )}

              {user ? (
                <RoleSwitcher />
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/login?mode=register"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-borderStrong bg-white px-3 text-xs font-semibold text-ink-heading shadow-subtle transition-colors hover:border-sibiru-300 hover:bg-sibiru-50"
                  >
                    Daftar Akun
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sibiru-500 bg-sibiru-500 px-3.5 text-xs font-semibold text-white shadow-subtle transition-colors hover:bg-sibiru-600"
                  >
                    <LogIn size={14} />
                    Masuk
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-ink-border p-2 text-ink-body transition-colors hover:bg-ink-soft lg:hidden"
                aria-label="Buka menu navigasi"
                aria-expanded={mobileOpen}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-sibiru-950/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 right-0 flex w-[84%] max-w-sm flex-col bg-white shadow-lift"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b border-ink-border px-5 py-4">
                <Logo compact />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-ink-muted hover:bg-ink-soft"
                  aria-label="Tutup menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navigasi seluler">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-sibiru-50 text-sibiru-700'
                          : 'text-ink-body hover:bg-ink-soft',
                      )
                    }
                  >
                    {item.label}
                    <ArrowRight size={15} className="text-ink-muted" />
                  </NavLink>
                ))}
                <div className="pt-2">
                  <Link
                    to={user?.role === 'ADMIN' ? '/admin' : '/login?next=/admin'}
                    className="flex items-center justify-between rounded-xl border border-sibiru-200 bg-sibiru-50 px-3.5 py-3 text-sm font-bold text-sibiru-800 transition-colors hover:bg-sibiru-100"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard size={16} className="text-sibiru-600" />
                      Dashboard Pengelola
                    </span>
                    <ArrowRight size={15} className="text-sibiru-500" />
                  </Link>
                </div>
              </nav>

              <div className="border-t border-ink-border p-4">
                {user ? (
                  <RoleSwitcher className="w-full [&>button]:w-full" />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-sibiru-500 text-sm font-semibold text-white shadow-subtle hover:bg-sibiru-600"
                    >
                      <LogIn size={15} />
                      Masuk ke Akun
                    </Link>
                    <Link
                      to="/login?mode=register"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-border bg-white text-sm font-semibold text-ink-heading shadow-subtle hover:bg-ink-soft"
                    >
                      Daftar Akun Baru
                    </Link>
                  </div>
                )}
                <p className="mt-3 text-center text-[0.625rem] leading-relaxed text-ink-muted">
                  Informasi ruang dapat dibaca tanpa masuk. Pengajuan memerlukan akun.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main id="main-content" className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="relative overflow-hidden bg-sibiru-900 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-dot-grid" aria-hidden="true" />
        <div className="page-container relative py-12 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
            <div>
              <Logo tone="light" />
              <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/55">
                {APP_CONFIG.DESCRIPTION}
              </p>
              <div className="mt-5 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
                <span className="h-px w-6 bg-gold-400/70" />
                Sistem internal kampus
              </div>
            </div>

            <div>
              <h3 className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/40">
                Jelajahi
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-white/65">
                <li><Link to="/" className="transition-colors hover:text-gold-300">Beranda</Link></li>
                <li><Link to="/katalog" className="transition-colors hover:text-gold-300">Katalog ruangan</Link></li>
                <li><Link to="/katalog?kapasitas=100" className="transition-colors hover:text-gold-300">Ruang besar</Link></li>
                <li><Link to="/katalog?q=lab" className="transition-colors hover:text-gold-300">Laboratorium</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/40">
                Akses
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-white/65">
                <li><Link to="/pengajuan-saya" className="transition-colors hover:text-gold-300">Pengajuan saya</Link></li>
                <li><Link to="/login" className="transition-colors hover:text-gold-300">Masuk akun</Link></li>
                <li><Link to="/admin" className="transition-colors hover:text-gold-300">Portal pengelola</Link></li>
                <li><Link to="/login?next=/pengajuan-saya" className="transition-colors hover:text-gold-300">Panduan pengajuan</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/40">
                Jam layanan
              </h3>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-mono text-base text-white">{APP_CONFIG.OPERATING_HOURS.LABEL}</p>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-white/50">
                  Senin–Jumat · Waktu Indonesia Barat
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[0.625rem] font-semibold text-gold-400">
                  <ShieldCheck size={12} />
                  Proteksi bentrok otomatis
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-[0.625rem] text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} SIBIRU · {APP_CONFIG.FULL_NAME}</span>
            <span>Dikembangkan untuk OAB KPM UNJ · Waktu dalam WIB</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
