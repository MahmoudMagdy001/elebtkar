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
          DEFAULT: '#004561',
          light: '#005f80',
          dark: '#00253a',
        },
        accent: {
          DEFAULT: '#c9952a',
          light: '#f0c060',
        },
        secondary: '#0077a8',
        green: '#1b5e20',
        gray: {
          50: '#f8faff',
          100: '#eef2f7',
          200: '#dde4ee',
          600: '#4a5568',
          800: '#1a202c',
        },
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #004561 0%, #00253a 100%)',
        'accent-gradient': 'linear-gradient(135deg, #c9952a, #f0c060)',
      },
      fontFamily: {
        almarai: ['Almarai', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        'DEFAULT': '16px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,69,97,0.10)',
        'md': '0 8px 32px rgba(0,69,97,0.15)',
        'lg': '0 20px 60px rgba(0,69,97,0.20)',
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
