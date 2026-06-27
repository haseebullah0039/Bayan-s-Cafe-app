import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4A017',
        'primary-dark': '#B8860B',
        background: '#1A1A2E',
        card: '#16213E',
        surface: '#1E1E3F',
        border: '#2D3748',
        'text-secondary': '#A0AEC0',
        'text-muted': '#4A5568',
        success: '#48BB78',
        error: '#FC8181',
        warning: '#F6AD55',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
