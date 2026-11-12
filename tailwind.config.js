/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          950: '#0D0415',
          900: '#14061F',
          800: '#1B0A2A',
          700: '#221032',
          600: '#2E1540',
          500: '#3D2652',
          400: '#5C3E73',
          300: '#7B5594',
        },
        gold: {
          DEFAULT: '#C89A3D',
          dark: '#A07830',
          light: '#E3BC5E',
          muted: '#8A6A2A',
          faint: '#F5E6C0',
        },
        lavender: {
          DEFAULT: '#A77BFF',
          dark: '#9A6DF4',
          light: '#B996FF',
          faint: '#EDE5F8',
          mid: '#C4AEFF',
        },
        ink: {
          DEFAULT: '#F5F2F7',
          muted: '#EAE5F2',
          soft: '#A89BB8',
          dim: '#9485A8',
          deep: '#6B5589',
        },
        sand: {
          50: '#FBF6EE',
          100: '#F7EFE2',
          200: '#EFE3CE',
          300: '#E2D2B5',
          400: '#C9B895',
          500: '#A8946A',
          600: '#8A7250',
          700: '#6B5A3E',
          800: '#4A3D2A',
          900: '#2E251A',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-up-delay': 'fadeUp 0.6s 0.15s ease-out forwards',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
