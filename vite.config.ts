import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base ensures assets load accurately on GitHub Pages (https://HHD-Collections.github.io/)
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          'firebase-app': ['firebase/app', 'firebase/analytics'],
          'firebase-auth': ['firebase/auth'],
          'firebase-db': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
