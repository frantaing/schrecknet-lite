/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", "./v20.html", "./v5.html", "./src/**/*.{js,css}" ],
  theme: {
    extend: {
      colors: {
        // Colors
        background: 'var(--color-background, #0D0D0D)',
        foreground: 'var(--color-foreground, #161616)',
        accent: 'var(--color-accent, #951313)',
        textPrimary: 'var(--color-text-primary, #FFFFFF)',
        textSecondary: 'var(--color-text-secondary, #4E4E4E)',
      },
      // Typography
      // Font Family
      fontFamily: {
        heading: ['Gloock', 'serif'],
        body: ['Geist Mono', 'monospace'],
      },
      // Border Radius
      borderRadius: {
        round: '5px',
      }
    },
  },
  plugins: [],
};