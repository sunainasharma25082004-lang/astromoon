export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#fdf8f6', 100:'#f8ebe4', 200:'#f3dace', 300:'#e9c2a8', 400:'#db9f78', 500:'#c97d4d', 600:'#b3623e', 700:'#964e35', 800:'#7b4030', 900:'#65372b' },
        secondary: { 50:'#f5f3ff', 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9', 800:'#5b21b6', 900:'#4c1d95' },
        cosmic: { dark: '#0f0a1e', navy: '#1a1333', purple: '#2d1b4e', light: '#4a2c6a' },
        gold: { light: '#fcd34d', DEFAULT: '#f59e0b', dark: '#d97706' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Playfair Display', 'serif'] },
    },
  },
  plugins: [],
};
