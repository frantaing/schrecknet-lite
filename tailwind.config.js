/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './src/**/*.css', // Also include CSS files in case you reference classes there
  ],
  theme: {
    extend: {
      colors: {
        // Colors
        background: '#0D0D0D',
        foreground: '#161616',
        accent: '#951313',
        textPrimary: '#FFFFFF',
        textSecondary: '#4E4E4E',
      },
      // Typography
      // Font Family
      fontFamily: {
        heading: ['Gloock', 'serif'],
        body: ['Geist Mono', 'monospace'],
      },
      // Font Colors - These should be in colors, not textColor
      // textColor is deprecated in favor of colors
      // Border Radius
      borderRadius: {
        round: '5px',
      }
    },
  },
  plugins: [],
};