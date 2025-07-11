import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: './index.html' 
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    proxy: {
      '/arweave': 'http://localhost:3001'
    }
  },
  publicDir: 'public'
});