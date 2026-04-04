import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/schrecknet-lite/', 
  build: {
    rollupOptions: {
      input: {
        // Relative to project roo
        main: resolve(__dirname, 'index.html'),
        v20: resolve(__dirname, 'v20.html'),
        v5: resolve(__dirname, 'v5.html'),
      },
    },
  },
})