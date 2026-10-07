import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, '../../dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Pehle sab kuch ek hi ~1MB chunk me jata tha. Ab vendor libraries alag
        // chunks me aati hain, jisse app code change hone par sirf wahi chunk
        // dobara download hota hai (browser cache baaki ko serve karta hai).
        manualChunks: {
          react: ['react', 'react-dom'],
          helmet: ['react-helmet-async'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
