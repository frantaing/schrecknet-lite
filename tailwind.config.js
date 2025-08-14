/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Colors
        background: '#0D0D0D',
        foreground: '#161616',
        textSecondary: '#4E4E4E',
        textPrimary: '#FFFFFF',
        accent: '#951313',
      },
      // Typography!
      // Font Family
      fontFamily: {
        heading: ['Gloock', 'serif'],   // All Headings
        body: ['Geist Mono', 'monospace'], // Body Text
      },
      // Font Sizes
      fontSize: {
        // Gloock Heading Sizes
        headingXL: ['128px', { lineHeight: '140px' }],
        headingL: ['64px', { lineHeight: '72px' }],
        headingM: ['27px', { lineHeight: '32px' }],
        // Geist Mono Body Sizes
        bodyL: ['27px', { lineHeight: '32px' }],
        bodyM: ['19px', { lineHeight: '24px' }],
        bodyS: ['16px', { lineHeight: '20px' }],
      }
    },
  },
  plugins: [],
}
