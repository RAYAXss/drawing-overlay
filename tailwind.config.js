/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50:  '#FDFAF5',
          100: '#F7F2E8',
          200: '#EDE8DF',
          300: '#DDD6C8',
          400: '#C8BCA8',
          500: '#A89880',
          600: '#8C7A62',
          700: '#6B5C45',
          800: '#4A3D2C',
          900: '#2C2416',
        },
        accent: {
          DEFAULT: '#8C7A62',
          light: '#A89880',
          muted: 'rgba(140,122,98,0.12)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}