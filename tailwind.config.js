/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Exclusiva R&M Personaliza: Blanco, Negro y Dorado
        gold: {
          light: '#FBF8EE',
          300: '#DFC87A',
          400: '#E5C158',
          500: '#D4AF37', // Dorado Oficial
          600: '#B88E23',
          700: '#936E1B',
          glow: 'rgba(212, 175, 55, 0.25)',
        },
        brand: {
          50: '#FBF8EE',
          100: '#F5EFD3',
          400: '#E5C158',
          500: '#D4AF37', // Dorado Oficial
          600: '#B88E23',
          700: '#936E1B',
        },
        dark: {
          900: '#11141C',
          950: '#07090E',
        }
      }
    },
  },
  plugins: [],
}
