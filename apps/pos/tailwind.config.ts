import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        verde: { DEFAULT: '#00C851', dark: '#007E33' },
        rojo: { DEFAULT: '#FF4444', dark: '#CC0000' },
        negro: { DEFAULT: '#222222', dark: '#000000' },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
