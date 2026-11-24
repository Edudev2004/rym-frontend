/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          500: '#e11d48', // Color corporativo R&M Personaliza
          600: '#be123c',
          700: '#9f1239',
        }
      }
    },
  },
  plugins: [],
}
