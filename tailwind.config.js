/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f2ff',
          100: '#ebe7ff',
          200: '#d8d2ff',
          300: '#beb0ff',
          400: '#a084ff',
          500: '#8B7FFF',
          600: '#5B47E0',
          700: '#4a3aba',
          800: '#3d2f94',
          900: '#322575',
        },
        accent: {
          50: '#ffe9e9',
          100: '#ffd1d1',
          200: '#ffb3b3',
          300: '#ff9494',
          400: '#ff7575',
          500: '#FF6B6B',
          600: '#e85e5e',
          700: '#d15050',
          800: '#ba4343',
          900: '#a33535',
        },
        surface: '#F8F9FC',
        background: '#FFFFFF',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'field': '0 1px 4px rgba(0, 0, 0, 0.08)',
        'field-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}