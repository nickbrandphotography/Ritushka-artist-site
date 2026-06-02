import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a18',
        bone: '#f6f4ef',
        sand: '#e8e3da',
        sea: '#3a5a6b',
        accent: '#9a6b4f',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '1280px' },
    },
  },
  plugins: [],
};
export default config;
