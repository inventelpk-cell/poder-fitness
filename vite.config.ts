import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('gym-visual.es.json')) return 'gym-visual-data';
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png', 'pwa-192-maskable.png', 'pwa-maskable-512.png'],
      manifest: {
        name: 'Poder Fitness',
        short_name: 'Poder',
        description: 'Entreno personal, plan y nivel de poder. Sin cuenta y sin red.',
        display: 'standalone',
        start_url: '/',
        lang: 'es',
        background_color: '#07090F',
        theme_color: '#07090F',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest,json,txt}'],
        globIgnores: ['**/gym-visual/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/gym-visual\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gym-visual-media',
              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 60 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
