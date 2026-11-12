import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import sharp from 'sharp';

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || '/';

// Task 8: build ke waqt dist me emit hote saare images ko WebP (quality 80, max width 1920px) me recompress karo.
const compressImages = (): Plugin => ({
  name: 'bvps-compress-images',
  async generateBundle(_options, bundle) {
    for (const fileName of Object.keys(bundle)) {
      if (!/\.(webp|jpe?g|png|gif|svg)$/i.test(fileName)) continue;
      const asset = bundle[fileName];
      const src = typeof asset.source === 'function' ? await asset.source() : asset.source;
      const buf = Buffer.isBuffer(src) ? src : Buffer.from(src as ArrayBuffer | string);
      const out = await sharp(buf)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
      (asset as unknown as { source: unknown }).source = out;
    }
  },
});

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    compressImages(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        'src',
        'assets',
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
