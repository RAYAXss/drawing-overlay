/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm paper-craft sheet scale
        paper: {
          50:  '#FDFBF6',
          100: '#FBF7EF',
          200: '#F4EFE6',
          300: '#EDE7DA',
          400: '#E9E2D4',
          500: '#D8CDB9',
          600: '#BBAB90',
          700: '#8B7A60',
          800: '#6E6048',
          900: '#2E2717',
        },
        // Legacy alias kept so existing `sand-*` usages don't break
        sand: {
          50:  '#FDFBF6',
          100: '#FBF7EF',
          200: '#F4EFE6',
          300: '#EDE7DA',
          400: '#E9E2D4',
          500: '#D8CDB9',
          600: '#BBAB90',
          700: '#8B7A60',
          800: '#6E6048',
          900: '#2E2717',
        },
        ink: {
          DEFAULT: '#2E2717',
          soft: '#6E6048',
          faint: '#A99A80',
        },
        accent: {
          DEFAULT: '#B08968',
          light: '#C9A987',
          hover: '#8B6B4E',
          muted: 'rgba(176,137,104,0.14)',
        },
        border: {
          subtle: 'rgba(120,100,70,0.16)',
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
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--tw-rotate, 0deg))' },
          '50%': { transform: 'translateY(-10px) rotate(var(--tw-rotate, 0deg))' },
        },
        'draw-dash': {
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
