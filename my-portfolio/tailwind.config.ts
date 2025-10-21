import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'twinkle': 'twinkle 10s linear infinite alternate',
        'twinkleSingle': 'twinkleSingle 2s infinite ease-in-out',
        'modalEnter': 'modalEnter 0.3s ease-out forwards',
        'modalExit': 'modalExit 0.2s ease-in forwards',
      },
    },
  },
  plugins: [],
};
export default config;
