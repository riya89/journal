/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        shantell: ['"Shantell Sans"', 'sans-serif'],
      },
      colors: {
        cream: '#FFFBEA',
        leaf: '#7A916C',
        leaf2: '#94A786',
        darkbg: '#0A0A0A',
        darktext: '#EBDDBF',
        deepbrown: '#662B15',
        sage: '#565D56',
      },
      boxShadow: {
        soft: '0 6px 18px rgba(63,63,63,.08)',
        modal: '0 28px 60px rgba(0,0,0,.18)',
      },
      borderRadius: {
        soft: '18px',
      },
    },
  },
  plugins: [],
};
