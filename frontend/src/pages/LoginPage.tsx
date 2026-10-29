import React, { useState } from 'react';
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthSession, useLogin, useRegister } from '../hooks/use-auth';
import { ScreenLoader } from '../components/layout/LoadingDots';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import type { User, UserRole } from '../types';

interface DemoCredential {
  id: string;
  name: string;
  subtitle: string;
  identifier: string;
  password: string;
  role: 'ADMIN' | 'Mahasiswa' | 'Dosen';
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    id: 'admin',
    name: 'Drs. Hendro Wibowo, M.T.',
    subtitle: 'Pengelola Fasilitas & Sarpras',
    identifier: '197905202008011002',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 'mhs',
    name: 'Rian Pratama',
    subtitle: 'Mahasiswa · BEM Fakultas Teknik',
    identifier: '2101001',
    password: 'mhs123',
    role: 'Mahasiswa',
  },
  {
    id: 'dosen',
    name: 'Dr. Sri Wahyuni, M.Kom.',
    subtitle: 'Dosen Pembina · Laboratorium AI',
    identifier: '198501152010122001',
    password: 'dosen123',
    role: 'Dosen',
  },
];

const demoRoleIcon: Record<string, React.ElementType> = {
  ADMIN: ShieldCheck,
  Mahasiswa: GraduationCap,
  Dosen: Briefcase,
};

function resolveRedirect(user: User, next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    if (user.role === 'ADMIN') return next;
    if (!next.startsWith('/admin')) return next;
  }
  return user.role === 'ADMIN' ? '/admin' : '/katalog';
}

export const LoginPage: React.FC = () => {
  const { user, isBootstrapping } = useAuthSession();
  const login = useLogin();
  const register = useRegister();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const next = searchParams.get('next');
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('BORROWER');
  const [regRoleCategory, setRegRoleCategory] = useState<'Mahasiswa' | 'Dosen' | 'Pengelola'>('Mahasiswa');
  const [regOrganization, setRegOrganization] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  if (isBootstrapping && !user) return <ScreenLoader label="Memeriksa sesi" />;
  if (user) return <Navigate to={resolveRedirect(user, next)} replace />;

  const completeAuth = (loggedInUser: User) => {
    toast.success(`Selamat datang, ${loggedInUser.name.split(',')[0]}`, {
      description:
        loggedInUser.role === 'ADMIN'
          ? 'Anda masuk ke Portal Pengelola Fasilitas Kampus.'
          : `Masuk sebagai ${loggedInUser.organization}.`,
    });
    navigate(resolveRedirect(loggedInUser, next), { replace: true });
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const identifier = loginIdentifier.trim();
    const password = loginPassword.trim();

    if (!identifier) {
      setLoginError('Masukkan NIM, NIP, atau Email Anda.');
      return;
    }
    if (!password) {
      setLoginError('Masukkan kata sandi akun Anda.');
      return;
    }

    setLoginError(null);
    try {
      const response = await login.mutateAsync({ identifier, password });
      completeAuth(response.user);
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Identitas atau kata sandi tidak cocok. Silakan periksa kembali.',
      );
    }
  };

  const handleFillDemo = (demo: DemoCredential) => {
    setActiveTab('login');
    setLoginIdentifier(demo.identifier);
    setLoginPassword(demo.password);
    setLoginError(null);
    toast.info(`Kredensial ${demo.role} dimuat`, {
      description: 'Klik tombol "Masuk ke Sistem" untuk melanjutkan verifikasi.',
    });
  };

  const handleQuickDemoLogin = async (demo: DemoCredential) => {
    setActiveTab('login');
    setLoginIdentifier(demo.identifier);
    setLoginPassword(demo.password);
    setLoginError(null);

    try {
      const response = await login.mutateAsync({
        identifier: demo.identifier,
        password: demo.password,
      });
      completeAuth(response.user);
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Kredensial demo tidak dapat digunakan.',
      );
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = regName.trim();
    const identifier = regIdentifier.trim();
    const organization = regOrganization.trim();
    const email = regEmail.trim();
    const phone = regPhone.trim();
    const password = regPassword;

    if (!name || name.length < 3) {
      setRegisterError('Nama lengkap wajib diisi minimal 3 karakter.');
      return;
    }
    if (!identifier || identifier.length < 4) {
      setRegisterError('NIM atau NIP wajib diisi minimal 4 karakter.');
      return;
    }
    if (!organization) {
      setRegisterError('Organisasi, Himpunan, atau Unit Kerja wajib diisi.');
      return;
    }
    if (!email || !email.includes('@')) {
      setRegisterError('Alamat email kampus tidak valid.');
      return;
    }
    if (password.length < 4) {
      setRegisterError('Kata sandi minimal 4 karakter.');
      return;
    }
    if (password !== regConfirmPassword) {
      setRegisterError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setRegisterError(null);
    try {
      const response = await register.mutateAsync({
        name,
        identifier,
        role: regRole,
        organization,
        email,
        phone: phone || undefined,
        password,
      });
      toast.success('Pendaftaran akun berhasil!', {
        description: 'Akun Anda telah terdaftar dan otomatis masuk.',
      });
      completeAuth(response.user);
    } catch (err) {
      setRegisterError(
        err instanceof Error
          ? err.message
          : 'Pendaftaran gagal. Periksa apakah NIM/NIP atau email sudah digunakan.',
      );
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setSearchParams(tab === 'register' ? { mode: 'register' } : {});
    setLoginError(null);
    setRegisterError(null);
  };

  return (
    <div className="page-container py-8 sm:py-12">
      <div className="overflow-hidden rounded-3xl border border-ink-border bg-white shadow-card">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          {/* Editorial panel - Pine Teal Theme */}
          <div className="relative overflow-hidden bg-sibiru-900 p-7 text-white sm:p-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08] bg-dot-grid"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-gold-400/20"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-gold-400/[0.07]"
              aria-hidden="true"
            />

            <div className="relative">
              <p className="inline-flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-gold-400">
                <span className="h-px w-6 bg-gold-400/70" />
                Akses Terpadu Kampus
              </p>
              <h1 className="mt-4 font-display text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
                Satu akun, seluruh ruang kampus.
              </h1>
              <p className="mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-white/60">
                Masuk untuk mengajukan peminjaman, memantau persetujuan sarpras, atau mengelola
                fasilitas secara terkoordinasi dan aman.
              </p>

              <div className="relative mx-auto mt-8 max-w-[19rem]">
                <span
                  className="absolute inset-x-6 bottom-2 top-4 rounded-[50%] bg-gold-400/20 blur-2xl"
                  aria-hidden="true"
                />
                <img
                  src="/assets/ilustrasi/ruang-kuliah.webp"
                  alt="Ilustrasi fasilitas kampus"
                  className="relative z-10 w-full object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.35)]"
                />
              </div>

              <ul className="relative mt-8 space-y-2.5 border-t border-white/10 pt-5 text-[0.6875rem] text-white/65">
                {[
                  'Autentikasi terenkripsi SHA-256 + Salt',
                  'Pencegahan bentrok jadwal real-time',
                  'Riwayat persetujuan transparan',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="shrink-0 text-gold-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form panel with Tab Selector */}
          <div className="p-7 sm:p-10">
            <div className="mx-auto max-w-md">
              {/* Tabs Switcher */}
              <div className="flex rounded-2xl border border-ink-border bg-ink-soft/60 p-1.5">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-white text-sibiru-900 shadow-subtle'
                      : 'text-ink-muted hover:text-ink-heading'
                  }`}
                >
                  <LogIn size={14} />
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white text-sibiru-900 shadow-subtle'
                      : 'text-ink-muted hover:text-ink-heading'
                  }`}
                >
                  <UserPlus size={14} />
                  Daftar Baru
                </button>
              </div>

              {/* Tab 1: LOGIN */}
              {activeTab === 'login' && (
                <div className="mt-6">
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-heading">
                      Masuk ke Sistem SIBIRU
                    </h2>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      Masukkan identitas terdaftar beserta kata sandi Anda.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="mt-6 space-y-3.5">
                    <Field
                      label="NIM / NIP / Alamat Email"
                      htmlFor="login-identifier"
                      required
                      hint="Contoh: 2101001 atau 197905202008011002"
                    >
                      <input
                        id="login-identifier"
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder="NIM, NIP, atau Email terdaftar"
                        className="input input-mono"
                        autoComplete="username"
                        autoFocus
                        required
                      />
                    </Field>

                    <Field label="Kata Sandi" htmlFor="login-password" required>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="Masukkan kata sandi"
                          className="input pr-10"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-heading"
                          aria-label={showLoginPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </Field>

                    {loginError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.6875rem] leading-relaxed text-red-800">
                        {loginError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-2"
                      isLoading={login.isPending}
                    >
                      <LogIn size={16} />
                      Masuk ke Sistem
                    </Button>
                  </form>

                  {/* Dummy Credentials Section */}
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-ink-border" />
                    <span className="text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
                      atau gunakan akun demo uji coba
                    </span>
                    <span className="h-px flex-1 bg-ink-border" />
                  </div>

                  <div className="space-y-2">
                    {DEMO_CREDENTIALS.map((account) => {
                      const Icon = demoRoleIcon[account.role] ?? Sparkles;
                      const isSelected =
                        loginIdentifier === account.identifier &&
                        loginPassword === account.password;

                      return (
                        <div
                          key={account.id}
                          className={`group flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-sibiru-400 bg-sibiru-50/60 ring-2 ring-sibiru-200'
                              : 'border-ink-border bg-white hover:border-sibiru-200 hover:bg-sibiru-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sibiru-100 bg-sibiru-50 text-sibiru-600">
                              <Icon size={16} strokeWidth={1.8} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="block truncate text-[0.75rem] font-bold text-ink-heading">
                                  {account.name}
                                </span>
                                <span className="shrink-0 rounded bg-ink-soft px-1.5 py-0.2 font-mono text-[0.5625rem] font-semibold text-ink-muted">
                                  {account.role}
                                </span>
                              </div>
                              <span className="mt-0.5 block truncate text-[0.625rem] text-ink-muted">
                                ID: <span className="font-mono text-ink-heading">{account.identifier}</span> · Sandi: <span className="font-mono text-ink-heading">{account.password}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleFillDemo(account)}
                              className="rounded-lg border border-ink-border px-2 py-1 text-[0.625rem] font-semibold text-ink-muted hover:border-sibiru-300 hover:text-sibiru-600 hover:bg-white"
                            >
                              Isi Form
                            </button>
                            <button
                              type="button"
                              disabled={login.isPending}
                              onClick={() => void handleQuickDemoLogin(account)}
                              className="inline-flex items-center gap-1 rounded-lg bg-sibiru-50 px-2.5 py-1 text-[0.625rem] font-bold text-sibiru-700 hover:bg-sibiru-100 disabled:opacity-50"
                            >
                              Masuk
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: REGISTER */}
              {activeTab === 'register' && (
                <div className="mt-6">
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-heading">
                      Daftar Akun Baru
                    </h2>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      Pendaftaran akun peminjam fasilitas kampus secara langsung.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3">
                    <Field label="Nama Lengkap" htmlFor="reg-name" required>
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          setRegisterError(null);
                        }}
                        placeholder="Contoh: Ahmad Fauzi"
                        className="input"
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="NIM / NIP" htmlFor="reg-identifier" required>
                        <input
                          id="reg-identifier"
                          type="text"
                          value={regIdentifier}
                          onChange={(e) => {
                            setRegIdentifier(e.target.value);
                            setRegisterError(null);
                          }}
                          placeholder="2201099"
                          className="input input-mono"
                          required
                        />
                      </Field>

                      <Field label="Peran Kampus" htmlFor="reg-role" required>
                        <select
                          id="reg-role"
                          value={regRoleCategory}
                          onChange={(e) => {
                            const val = e.target.value as 'Mahasiswa' | 'Dosen' | 'Pengelola';
                            setRegRoleCategory(val);
                            setRegRole(val === 'Pengelola' ? 'ADMIN' : 'BORROWER');
                          }}
                          className="input"
                        >
                          <option value="Mahasiswa">Mahasiswa</option>
                          <option value="Dosen">Dosen</option>
                          <option value="Pengelola">Staf Sarpras (Admin)</option>
                        </select>
                      </Field>
                    </div>

                    <Field
                      label="Organisasi / Program Studi / Unit"
                      htmlFor="reg-org"
                      required
                      hint="Contoh: BEM Fakultas Teknik, HIMA TI, atau Prodi Informatika"
                    >
                      <input
                        id="reg-org"
                        type="text"
                        value={regOrganization}
                        onChange={(e) => {
                          setRegOrganization(e.target.value);
                          setRegisterError(null);
                        }}
                        placeholder="Nama organisasi / lembaga"
                        className="input"
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Email Kampus" htmlFor="reg-email" required>
                        <input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            setRegisterError(null);
                          }}
                          placeholder="nama@kampus.ac.id"
                          className="input"
                          required
                        />
                      </Field>

                      <Field label="No. WhatsApp / HP" htmlFor="reg-phone">
                        <input
                          id="reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="08123456789"
                          className="input input-mono"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Kata Sandi" htmlFor="reg-password" required hint="Min. 4 karakter">
                        <div className="relative">
                          <input
                            id="reg-password"
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => {
                              setRegPassword(e.target.value);
                              setRegisterError(null);
                            }}
                            placeholder="Kata sandi"
                            className="input pr-9"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-heading"
                          >
                            {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </Field>

                      <Field label="Konfirmasi Sandi" htmlFor="reg-confirm" required>
                        <input
                          id="reg-confirm"
                          type={showRegPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            setRegisterError(null);
                          }}
                          placeholder="Ulangi sandi"
                          className="input"
                          required
                        />
                      </Field>
                    </div>

                    {registerError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.6875rem] leading-relaxed text-red-800">
                        {registerError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-2"
                      isLoading={register.isPending}
                    >
                      <UserPlus size={16} />
                      Daftar & Masuk Sekarang
                    </Button>
                  </form>
                </div>
              )}

              <p className="mt-6 text-center text-[0.625rem] leading-relaxed text-ink-muted">
                Ingin melihat jadwal tanpa masuk?{' '}
                <Link to="/katalog" className="font-semibold text-sibiru-600 hover:text-sibiru-700">
                  Katalog tetap terbuka untuk publik
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};