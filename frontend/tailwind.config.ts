import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Signature SIBIRU: Pine Teal
        sibiru: {
          50: '#E6F3F3',
          100: '#CCE7E7',
          200: '#99CFCF',
          300: '#66B7B7',
          400: '#339F9F',
          500: '#006569', // Primary Base
          600: '#005457',
          700: '#004245',
          800: '#003133',
          900: '#002223',
          950: '#001213',
        },
        // Accent Warm Gold & Ochre
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Accent Base
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Neutral Slate
        ink: {
          light: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B',
          body: '#334155',
          heading: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        xl: '0.875rem',
        '2xl': '1rem',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 101, 105, 0.05), 0 1px 2px -1px rgba(0, 101, 105, 0.05)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        elevated: '0 10px 25px -5px rgba(0, 101, 105, 0.08), 0 8px 10px -6px rgba(0, 101, 105, 0.04)',
      },
      animation: {
        'spring-in': 'springIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        springIn: {
          '0%': { transform: 'scale(0.96) translateY(4px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
