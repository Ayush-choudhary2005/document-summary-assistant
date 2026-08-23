/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B231F',
          soft: '#2C3630',
        },
        paper: {
          DEFAULT: '#EDE6D6',
          dim: '#E2D9C6',
          dark: '#141A17',
          darkdim: '#1D2521',
        },
        manila: {
          DEFAULT: '#C9A66B',
          light: '#DCC391',
        },
        marker: {
          DEFAULT: '#FFC93C',
          soft: '#FFE29A',
        },
        moss: {
          DEFAULT: '#4B6858',
          light: '#6E8C7A',
        },
        redact: '#E4572E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(27,35,31,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,35,31,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
    },
  },
  plugins: [],
};
