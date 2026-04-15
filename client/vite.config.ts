import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const BUILD_DATE = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
  plugins: [react()],
  resolve: {
    alias: {
      'shared/types': path.resolve(__dirname, '../shared/types.ts'),
      'shared/schemas': path.resolve(__dirname, '../shared/schemas.ts'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
