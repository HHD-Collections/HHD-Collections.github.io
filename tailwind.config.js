/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF6ED',
          100: '#F4EBD7',
          200: '#E9D7AF',
          300: '#DEC387',
          400: '#D3AF5F',
          500: '#C5A059', // Champagne Gold
          600: '#B38E46',
          700: '#8E7137',
          800: '#6B5529',
          900: '#47391B',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#636363',
          600: '#444444',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#121212',
          950: '#0A0A0A',
        },
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F5F1E8',
          300: '#EBE5D8',
          400: '#DDD4C1',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'luxury-lg': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 8px 12px -4px rgba(0, 0, 0, 0.06)',
        'gold-glow': '0 0 25px -5px rgba(197, 160, 89, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
};
