/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Todo mapeado estrictamente a Dorado, Negro y Blanco
        brand: {
          50: '#FBF8EE',
          100: '#F5EFD3',
          400: '#E5C158',
          500: '#D4AF37', // Dorado Oficial
          600: '#B88E23',
          700: '#936E1B',
        },
        gold: {
          light: '#F5EFD3',
          DEFAULT: '#D4AF37',
          hover: '#E5C158',
          dark: '#B88E23',
        },
        dark: {
          bg: '#07090E',
          sidebar: '#0A0A0C',
          card: '#12151E',
          border: '#242938',
        }
      }
    },
  },
  plugins: [],
}
