/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom harmonized theme colors for a premium portfolio aesthetic
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a2ff',
          500: '#5673fc',
          600: '#3d52f6',
          700: '#2e3ee0',
          800: '#2632b7',
          900: '#242e91',
        },
      },
    },
  },
  plugins: [],
}
