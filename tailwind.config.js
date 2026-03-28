/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        surface: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a26',
          600: '#22222f',
          500: '#2e2e40',
        },
        accent: {
          DEFAULT: '#6c63ff',
          light: '#8b84ff',
          dark: '#4d45cc',
          glow: 'rgba(108,99,255,0.35)',
        },
        success: '#22d3a0',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108,99,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(108,99,255,0.7)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'inner-glow': 'inset 0 0 30px rgba(108,99,255,0.1)',
        'outer-glow': '0 0 30px rgba(108,99,255,0.25)',
      },
    },
  },
  plugins: [],
}
