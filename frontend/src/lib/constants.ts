export const APP_CONFIG = {
  NAME: 'SIBIRU',
  FULL_NAME: 'Sistem Informasi Peminjaman Ruangan Internal',
  VERSION: '1.0.0',
  OPERATING_HOURS: {
    START: 7, // 07:00
    END: 21,  // 21:00
  },
  COLORS: {
    PRIMARY: '#006569',
    PRIMARY_HOVER: '#005457',
    ACCENT_GOLD: '#F59E0B',
    ACCENT_GOLD_HOVER: '#D97706',
    CANVAS: '#F8FAFC',
    SURFACE: '#FFFFFF',
  },
  DEMO_USERS: [
    {
      id: 'usr_admin_01',
      name: 'Budi Santoso, S.Kom.',
      role: 'ADMIN',
      identifier: '197905202008011002',
    },
    {
      id: 'usr_mhs_01',
      name: 'Ahmad Zaki',
      role: 'BORROWER',
      identifier: '2101001',
    },
    {
      id: 'usr_dosen_01',
      name: 'Dr. Siti Rahma, M.T.',
      role: 'BORROWER',
      identifier: '198501152010122001',
    },
  ],
};
