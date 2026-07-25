/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fdfbf7', // Warm off-white
        primary: {
          DEFAULT: '#8b4a2b', // Warm earthy brown for buttons
          hover: '#733c21',
        },
        text: {
          DEFAULT: '#2a2015', // Dark brown/black for text
          muted: '#6b5e52',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
