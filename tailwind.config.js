/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        euro: {
          purple: '#7C3AED',
          'purple-dark': '#5B21B6',
          'purple-light': '#A78BFA',
          gold: '#F59E0B',
          'gold-light': '#FCD34D',
          pink: '#EC4899',
          'pink-light': '#F9A8D4',
          blue: '#3B82F6',
          'blue-dark': '#1D4ED8',
        }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(0.7)' },
        }
      },
      backgroundImage: {
        'euro-gradient': 'linear-gradient(135deg, #1a0533 0%, #0d0221 50%, #1a0533 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
      }
    },
  },
  plugins: [],
}
