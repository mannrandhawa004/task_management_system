/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: 'var(--chart-s2)',
          500: 'var(--primary)', // #0b573a in Light, #F69D39 in Dark
          600: 'var(--primary-hover)', // #083f2a in Light, #e69232 in Dark
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          green: 'var(--chart-s2)',
          yellow: '#facc15',
          blue: '#3b82f6',
          purple: '#a855f7',
        },
        dark: {
          bg: 'var(--bg)',
          card: 'var(--card)',
          hover: 'var(--hover)',
          border: 'var(--border)',
        },
        light: {
          bg: 'var(--bg)',
          card: 'var(--card)',
          hover: 'var(--hover)',
          border: 'var(--border)',
        }
      },
      boxShadow: {
        'soft': 'var(--shadow)',
        'soft-dark': 'var(--shadow)',
        'floating': '0 20px 40px -15px rgba(0, 0, 0, 0.12)',
        'floating-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
        'orange-glow': '0 10px 25px -5px var(--ring)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4.5s ease-in-out infinite',
        'float-fast': 'float 3.5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    }
  },
  plugins: [],
}
