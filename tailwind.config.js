/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        jordan: {
          50: '#FFF8E7',
          100: '#FFE5B4',
          200: '#FDB913',  // Amarillo principal
          300: '#FF8C42',  // Naranja
          400: '#E63946',  // Rojo/Coral
          500: '#2D3436',  // Gris oscuro
          600: '#000000',  // Negro
        },
        primary: '#FDB913',
        secondary: '#FF8C42',
        accent: '#E63946',
      },
    },
  },
  plugins: [],
}
