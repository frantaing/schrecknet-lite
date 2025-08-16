/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Colors
        background: '#0D0D0D',
        foreground: '#161616',
        accent: '#951313',
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
      // Font Sizes
      fontSize: {
        // Geist Mono (body / headers)
        body: ['1.6875rem', { lineHeight: '2rem' }], // 27px → 32px
        header: ['1.1875rem', { lineHeight: '1.5rem' }], // 19px → 24px
        version: ['1rem', { lineHeight: '1.25rem' }], // 16px → 20px

        // Gloock (headings)
        headingXL: ['8rem', { lineHeight: '9rem' }],   // 128px → 144px
        headingL: ['4rem', { lineHeight: '4.5rem' }], // 64px → 72px
        headingM: ['1.6875rem', { lineHeight: '2rem' }], // 27px → 32px
      },
      // Border Radius
      borderRadius: {
        round: '5px',
      }
    },
  },
  plugins: [],
}
