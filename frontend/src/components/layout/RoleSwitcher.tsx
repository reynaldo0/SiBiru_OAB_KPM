import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Compass, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/use-auth';
import { Avatar } from '../ui/Field';
import { Badge } from '../ui/Badge';

interface RoleSwitcherProps {
  align?: 'left' | 'right';
  tone?: 'light' | 'dark';
  className?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  align = 'right',
  tone = 'light',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success('Sesi berhasil diakhiri.');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all duration-200',
          tone === 'dark'
            ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
            : 'border-ink-border bg-white text-ink-heading hover:border-sibiru-200 hover:bg-sibiru-50/50 shadow-subtle',
        )}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[10rem] truncate text-[0.75rem] font-bold leading-tight">
            {user.name.split(',')[0]}
          </span>
          <span
            className={cn(
              'mt-0.5 block text-[0.5625rem] font-semibold uppercase tracking-[0.08em]',
              tone === 'dark' ? 'text-white/60' : 'text-ink-muted',
            )}
          >
            {user.role === 'ADMIN' ? 'Pengelola Fasilitas' : user.organization || 'Peminjam'}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-ink-muted transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className={cn(
              'absolute top-[calc(100%+0.55rem)] z-50 w-72 overflow-hidden rounded-2xl border border-ink-border bg-white shadow-lift',
              align === 'right' ? 'right-0' : 'left-0',
            )}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* User Profile Header */}
            <div className="border-b border-ink-border bg-gradient-to-br from-sibiru-50/60 to-white p-3.5">
              <div className="flex items-start gap-3">
                <Avatar name={user.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink-heading">{user.name}</p>
                  <p className="mt-0.5 font-mono text-[0.625rem] text-ink-muted">
                    {user.identifier}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant={user.role === 'ADMIN' ? 'gold' : 'active'} dot={false} className="text-[0.5625rem]">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Peminjam'}
                    </Badge>
                    {user.organization && (
                      <span className="truncate text-[0.625rem] text-ink-muted">
                        · {user.organization}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-1 p-2">
              {user.role === 'ADMIN' && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    navigate('/admin');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-sibiru-700 transition-colors hover:bg-sibiru-50"
                >
                  <ShieldCheck size={15} />
                  <span>Portal Pengelola</span>
                  <ArrowUpRight size={13} className="ml-auto text-sibiru-500" />
                </button>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate('/pengajuan-saya');
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink-heading transition-colors hover:bg-ink-soft"
              >
                <UserRound size={15} className="text-ink-muted" />
                <span>Pengajuan Saya</span>
                <ArrowUpRight size={13} className="ml-auto text-ink-muted" />
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate('/katalog');
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink-heading transition-colors hover:bg-ink-soft"
              >
                <Compass size={15} className="text-ink-muted" />
                <span>Katalog Ruangan</span>
                <ArrowUpRight size={13} className="ml-auto text-ink-muted" />
              </button>
            </div>

            {/* Logout Footer */}
            <div className="border-t border-ink-border bg-ink-soft/30 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                <LogOut size={15} className="text-red-500" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
