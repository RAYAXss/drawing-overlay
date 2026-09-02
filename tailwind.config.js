/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50:  '#FDFAF5',
          100: '#F7F3EC',
          200: '#F2EDE4',
          300: '#EDE8DF',
          400: '#DDD6C8',
          500: '#C8BCA8',
          600: '#A89880',
          700: '#8C7A62',
          800: '#6B5C45',
          900: '#2C2416',
        },
        ink: {
          DEFAULT: '#2C2416',
          soft: '#6B5C45',
          faint: '#A89880',
        },
        accent: {
          DEFAULT: '#A89880',
          light: '#C8BCA8',
          hover: '#8C7A62',
          muted: 'rgba(140,122,98,0.14)',
        },
        // Light "surface" scale used across components
        surface: {
          0: '#F2EDE4',
          1: 'rgba(255,255,255,0.35)',
          2: 'rgba(255,255,255,0.45)',
          3: 'rgba(255,255,255,0.6)',
          4: 'rgba(255,255,255,0.78)',
        },
        border: {
          subtle: 'rgba(140,122,98,0.18)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'system-ui', '"Helvetica Neue"', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
      },
    },
  },
  plugins: [],
}
