// vite.config.js

import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({

  base: '/schrecknet-lite/', 

  // DO NOT set the 'root' option here. 
  // The default is the project root, which is now correct.

  build: {
    rollupOptions: {
      input: {
        // These paths are relative to the project root
        main: resolve(__dirname, 'index.html'),
        v20: resolve(__dirname, 'v20.html'),
        v5: resolve(__dirname, 'v5.html'),
      },
    },
  },
})