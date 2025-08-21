/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,css,js}"],
  theme: {
    extend: {
      colors: {
        // Colors
        background: '#0D0D0D',
        foreground: '#161616',
        accent: '#951313',
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
