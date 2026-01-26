import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import typescript from '@vitejs/plugin-typescript';

export default defineConfig({
  plugins: [vue(), typescript()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
