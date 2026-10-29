import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SIBIRU brand — disciplined deep pine teal
        sibiru: {
          50: '#EFF8F6',
          100: '#DCEEEC',
          200: '#B9DEDA',
          300: '#8CC8C3',
          400: '#4FA39E',
          500: '#006569',
          600: '#00575A',
          700: '#00494B',
          800: '#003638',
          900: '#002A2B',
          950: '#001A1B',
        },
        // Warm institutional yellow / gold
        gold: {
          50: '#FDF9EC',
          100: '#FBF1CE',
          200: '#F7E29B',
          300: '#F2CF62',
          400: '#F5C542',
          500: '#E4B02F',
          600: '#C08B17',
          700: '#966813',
          800: '#7A5214',
          900: '#664416',
        },
        ink: {
          light: '#F7F9F8',
          soft: '#EEF3F2',
          border: '#E1E8E7',
          borderStrong: '#CFDCDA',
          muted: '#64748B',
          body: '#334155',
          heading: '#0F2E2F',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 42, 43, 0.04), 0 1px 3px rgba(0, 42, 43, 0.04)',
        card: '0 2px 6px rgba(0, 42, 43, 0.04), 0 10px 24px -12px rgba(0, 42, 43, 0.10)',
        lift: '0 18px 40px -18px rgba(0, 42, 43, 0.22), 0 4px 12px -4px rgba(0, 42, 43, 0.08)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.35s ease-out both',
        float: 'float 7s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'spin-slow': 'spin 2.6s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(0.92)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
