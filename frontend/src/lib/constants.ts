export const APP_CONFIG = {
  NAME: 'SIBIRU',
  FULL_NAME: 'Sistem Informasi Peminjaman Ruangan Internal',
  TAGLINE: 'Ruang kampus, lebih pasti.',
  DESCRIPTION:
    'Satu tempat untuk menemukan ruang, memeriksa jadwal, dan mengajukan peminjaman tanpa bentrok.',
  VERSION: '1.0.0',
  OPERATING_HOURS: {
    START: 7,
    END: 21,
    LABEL: '07.00 – 21.00 WIB',
  },
} as const;

export const AUTH_TOKEN_KEY = 'sibiru_user_id';

export const PURPOSE_MIN_LENGTH = 10;
export const REJECTION_MIN_LENGTH = 3;

export const CAPACITY_OPTIONS = [
  { label: 'Semua', value: undefined },
  { label: '≥ 25 orang', value: 25 },
  { label: '≥ 50 orang', value: 50 },
  { label: '≥ 100 orang', value: 100 },
] as const;

export const FACILITY_OPTIONS = [
  'AC',
  'Proyektor',
  'Wi-Fi / LAN',
  'Whiteboard',
  'Sound System',
  'Komputer',
] as const;

export const REJECTION_PRESETS = [
  'Ruangan dialokasikan untuk kegiatan resmi universitas pada slot tersebut.',
  'Fasilitas ruangan sedang dalam perbaikan dan pemeliharaan berkala.',
  'Permohonan berada di luar jam operasional atau izin penggunaan gedung.',
  'Kapasitas ruangan tidak sesuai dengan estimasi peserta kegiatan.',
];

export const NAV_ITEMS = [
  { label: 'Beranda', to: '/' },
  { label: 'Katalog Ruangan', to: '/katalog' },
  { label: 'Pengajuan Saya', to: '/pengajuan-saya' },
] as const;
