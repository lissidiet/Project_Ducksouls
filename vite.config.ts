import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  publicDir: 'public',
});
