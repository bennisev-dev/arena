import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/services/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#F5F5F5',
        panel: '#FFFFFF',
        ink: '#111111',
        muted: '#8B8B8B'
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.05), 0 8px 30px rgba(15, 23, 42, 0.06)'
      }
    }
  },
  plugins: []
};

export default config;
