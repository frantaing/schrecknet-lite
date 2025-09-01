/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",      // Scans the main index.html file in the root
    "./v20.html",        // Scans the v20.html file in the root
    "./src/**/*.{js,css}", // Scans your JS and CSS files inside src
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