import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mulish: ['Mulish', 'sans-serif'],
      },
      fontSize: {
        '40px': '40px',
        '24px': '24px',
      },
      colors: {
        'custom-gray': '#e5e5e5',
      },
      spacing: {
        '1.5': '6.5px',
      },
    },
  },
  plugins: [
    scrollbar,
  ],
};
