/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#C4531A', light: '#E8763A', dark: '#8B3A0F' },
        secondary: '#2C4A35',
        cream: { DEFAULT: '#FAF3E8', dark: '#F5ECD7', warm: '#EDE0C4' },
        text: { dark: '#1A0F00', medium: '#5C3D11', light: '#8B6B3D' },
        border: '#D4B896',
        sidebar: '#8B3A0F',
        mz: { night: '#1E120A', brown: '#3B2314', gold: '#D9A441', 'gold-light': '#F3E3C3', ivory: '#FBF6EE' },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(139,58,15,0.12)',
        hover: '0 8px 24px rgba(139,58,15,0.18)',
        btn: '0 4px 12px rgba(196,83,26,0.3)',
      },
    },
  },
  plugins: [],
}


