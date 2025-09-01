import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'src',
  plugins: [], // No Tailwind plugin needed - Tailwind will be processed via PostCSS
  css: {
    postcss: './postcss.config.js', // Make sure PostCSS config is found
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src', 'index.html'),
        v5: resolve(__dirname, 'src', 'v5.html'),
        v20: resolve(__dirname, 'src', 'v20.html'),
      },
    },
  },
});