/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        sidebar: {
          bg: '#1e293b',
          hover: '#334155',
          active: '#3b82f6'
        },
        card: {
          bg: '#ffffff',
          border: '#e2e8f0'
        },
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    },
  },
  plugins: [],
}