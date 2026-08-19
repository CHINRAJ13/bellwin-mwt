/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'sm': '0px',
        DEFAULT: '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
      },
      colors: {
        erp: {
          dark: '#f0f4f8',       // Main background (light gray-white)
          card: '#ffffff',        // Card background (pure white)
          green: {
            light: '#22c55e',
            DEFAULT: '#16a34a',   // Primary brand color (green)
            dark: '#d1fae5',      // Used for borders — light mint
          },
          gold: {
            light: '#fbbf24',
            DEFAULT: '#d97706',   // Accent color (amber)
            dark: '#b45309',
          },
          text: {
            primary: '#111827',   // Near black
            secondary: '#6b7280', // Gray
          }
        }
      }
    },
  },
  plugins: [],
}
