/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        mash: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          surface2: '#F4F4F5',
          border: '#E4E4E7',
          borderMd: '#D1D1D6',
          text1: '#0A0A0B',
          text2: '#3F3F46',
          text3: '#71717A',
          text4: '#A1A1AA',
          brand: '#0A0A0B',
          champagne: '#C9B99A',
          champagneBg: '#EDE3D5',
          olive: '#4A5240',
          oliveBg: '#EEF0EB',
        },
      },
      boxShadow: {
        mash: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        mashLg: '0 4px 12px rgba(0,0,0,0.08)',
        mashXl: '0 24px 48px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        mash: '10px',
      },
    },
  },
  plugins: [],
};
