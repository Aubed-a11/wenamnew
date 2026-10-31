/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Couleurs des logos Wenam et MIAWEZON : or bronze, or clair, espresso
        primary: { DEFAULT: '#946420', light: '#D9A84E', dark: '#3B2410' },
        gold: { DEFAULT: '#D9A84E', light: '#F2D28B', deep: '#946420' },
        secondary: '#2C4A35',
        cream: { DEFAULT: '#FAF3E8', dark: '#F5ECD7', warm: '#EDE0C4' },
        text: { dark: '#1A0F00', medium: '#5C3D11', light: '#8B6B3D' },
        border: '#D4B896',
        sidebar: '#3B2410',
        // Palette MIAWEZON : or du logo, espresso et ivoire
        mz: { night: '#1C120A', brown: '#3B2410', gold: '#E4B566', 'gold-light': '#F2D28B', ivory: '#FAF5EC' },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(59,36,16,0.12)',
        hover: '0 8px 24px rgba(59,36,16,0.18)',
        btn: '0 4px 12px rgba(148,100,32,0.3)',
      },
    },
  },
  plugins: [],
}


