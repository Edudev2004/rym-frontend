/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Oficial R&M Personaliza: Negro, Blanco y Dorado (#D4AF37)
        brand: {
          50: '#fdfbf2',
          100: '#f9f5e1',
          200: '#f2e8bd',
          300: '#e8d691',
          400: '#dec266',
          500: '#d4af37', // Dorado Metálico Oficial
          600: '#b89128',
          700: '#936e20',
          800: '#79571e',
          900: '#66481d',
          950: '#3a270d',
        },
        dark: {
          900: '#121214',
          950: '#0a0a0c',
        }
      }
    },
  },
  plugins: [],
}
