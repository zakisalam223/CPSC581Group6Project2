import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/CPSC581Group6Project2/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        puzzle: resolve(__dirname, 'puzzle/puzzle.html'),
        // ADD MORE AS NEEDED
      },
    },
  },
});