/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,css,js}",    // This catches everything in all folders
    "*.{html,css,js}",         // This catches files in root
    "./src/**/*.{html,css,js}" // This catches everything in src folder
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
      // Typography!
      // Font Family
      fontFamily: {
        heading: ['Gloock', 'serif'],   // All Headings
        body: ['Geist Mono', 'monospace'], // Body Text
      },
      // Font Colors
      textColor: {
        textSecondary: '#4E4E4E',
        textPrimary: '#FFFFFF',
        accent: '#951313',
      },
      // Border Radius
      borderRadius: {
        round: '5px',
      }
    },
  },
  plugins: [],
}
