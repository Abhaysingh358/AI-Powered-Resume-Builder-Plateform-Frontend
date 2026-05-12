/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          50: '#F5F5F4',
          100: '#E8E8E6',
          200: '#C8C8C4',
          300: '#A0A09A',
          400: '#6B6B65',
          500: '#3D3D38',
          600: '#1F1F1C',
          700: '#0D0D0D',
        },
        accent: {
          DEFAULT: '#E8FF47',
          dark: '#C4D900',
          muted: '#F0FF9A',
        },
        surface: {
          DEFAULT: '#FAFAF8',
          card: '#FFFFFF',
          muted: '#F2F2EF',
        },
        danger: '#FF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        lifted: '0 4px 16px 0 rgba(0,0,0,0.08)',
        float: '0 8px 32px 0 rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [],
}
