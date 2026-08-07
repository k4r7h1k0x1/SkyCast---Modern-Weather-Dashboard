/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './dashboard.html',
    './compare.html',
    './404.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          bg: '#080B14',
          surface: '#0E1220',
          card: '#131A2B',
          'card-hover': '#1A2338',
          border: '#1E2740',
        },
        cloud: {
          bg: '#F4F7FC',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F5',
        },
        brand: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        accent: {
          rose: '#F472B6',
          amber: '#FBBF24',
          violet: '#A78BFA',
          emerald: '#34D399',
          orange: '#FB923C',
          cyan: '#22D3EE',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(59, 130, 246, 0.35)',
        card: '0 4px 24px -8px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'hero-radial': `
          radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.16), transparent 45%),
          radial-gradient(circle at 85% 12%, rgba(139, 92, 246, 0.12), transparent 45%),
          radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.07), transparent 40%)
        `,
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};