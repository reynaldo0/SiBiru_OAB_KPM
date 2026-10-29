import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarRange,
  ClipboardCheck,
  DoorOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { formatDateLong, todayISO } from '../../lib/dates';
import { useAuthStore } from '../../store/auth.store';
import { useAdminMetrics } from '../../hooks/use-admin';
import { useLogout } from '../../hooks/use-auth';
import { Logo } from './Logo';
import { RoleSwitcher } from './RoleSwitcher';
import { Avatar } from '../ui/Field';
import { Badge } from '../ui/Badge';

interface AdminNavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  end?: boolean;
  badge?: number;
}

const pageMeta: Array<{ path: string; title: string; kicker: string }> = [
  { path: '/admin/antrean', title: 'Antrean Pengajuan', kicker: 'Peminjaman' },
  { path: '/admin/jadwal', title: 'Master Jadwal', kicker: 'Jadwal & alokasi' },
  { path: '/admin/ruangan', title: 'Master Ruangan', kicker: 'Fasilitas' },
  { path: '/admin', title: 'Ringkasan Operasional', kicker: 'Portal pengelola' },
];

export const AdminShell: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { data: metrics } = useAdminMetrics();

  const meta =
    pageMeta.find((item) =>
      item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path),
    ) ?? pageMeta[3];

  const navItems: AdminNavItem[] = [
    { label: 'Ringkasan', to: '/admin', icon: LayoutDashboard, end: true },
    {
      label: 'Antrean Pengajuan',
      to: '/admin/antrean',
      icon: ClipboardCheck,
      badge: metrics?.pending_count,
    },
    { label: 'Master Jadwal', to: '/admin/jadwal', icon: CalendarRange },
    { label: 'Master Ruangan', to: '/admin/ruangan', icon: DoorOpen },
  ];

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Sesi pengelola diakhiri.');
    navigate('/login');
  };

  const renderNav = (onNavigate?: () => void) => (
    <nav className="space-y-1" aria-label="Navigasi pengelola">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => cn('admin-link', isActive && 'admin-link-active')}
          >
            <Icon size={17} strokeWidth={1.8} className="admin-link-icon shrink-0" />
            <span className="flex-1">{item.label}</span>
            {typeof item.badge === 'number' && item.badge > 0 && (
              <span className="rounded-full bg-gold-400 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-sibiru-900">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const sidebarContent = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo tone="light" to="/admin" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
        <p className="px-2.5 pb-2 text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-white/35">
          Operasional
        </p>
        {renderNav(onNavigate)}

        <div className="my-5 h-px bg-white/10" />

        <p className="px-2.5 pb-2 text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-white/35">
          Akses lain
        </p>
        <Link
          to="/katalog"
          onClick={onNavigate}
          className="admin-link"
        >
          <ExternalLink size={17} strokeWidth={1.8} className="admin-link-icon shrink-0" />
          <span className="flex-1">Lihat situs publik</span>
          <ArrowUpRight size={13} className="text-white/40" />
        </Link>

        <div className="mt-5 rounded-xl border border-gold-400/20 bg-gold-400/[0.06] p-3.5">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-gold-300">
            Pengingat
          </p>
          <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-white/55">
            Setiap keputusan tercatat pada riwayat pengajuan. Periksa bentrok sebelum menyetujui.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
          <Avatar name={user?.name ?? 'Admin'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.6875rem] font-bold text-white">{user?.name ?? 'Pengelola'}</p>
            <p className="mt-0.5 truncate text-[0.5625rem] uppercase tracking-[0.1em] text-white/45">
              Administrator
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Keluar dari portal pengelola"
          >
            <LogOut size={15} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[0.625rem] font-semibold text-white/45 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={12} />
          Akhiri sesi
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-light">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] overflow-hidden bg-sibiru-900 lg:block">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-dot-grid" aria-hidden="true" />
        <div className="relative h-full">{sidebarContent()}</div>
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-sibiru-950/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-sibiru-900"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Tutup menu"
              >
                <X size={18} />
              </button>
              {sidebarContent(() => setDrawerOpen(false))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 border-b border-ink-border bg-white/95 backdrop-blur-md">
          <div className="flex h-[4.25rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-xl border border-ink-border p-2 text-ink-body hover:bg-ink-soft lg:hidden"
                aria-label="Buka menu pengelola"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <p className="hidden text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-ink-muted sm:block">
                  {meta.kicker}
                </p>
                <h1 className="truncate text-sm font-bold text-ink-heading sm:text-base">{meta.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="approved" className="hidden xl:inline-flex">
                Portal pengelola
              </Badge>
              <span className="hidden items-center gap-1.5 rounded-lg border border-ink-border px-2.5 py-1.5 text-[0.625rem] font-medium text-ink-muted md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                {formatDateLong(todayISO())}
              </span>
              <RoleSwitcher />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
