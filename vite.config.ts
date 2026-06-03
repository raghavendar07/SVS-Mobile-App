import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

const alias = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Don't auto-register the workbox SW: this prototype uses MSW's service
      // worker (mockServiceWorker.js) at scope '/' to serve mock data in prod.
      // Two SWs at the same scope conflict, so the PWA SW stays unregistered
      // until a real backend replaces MSW. Manifest (installability) is kept.
      injectRegister: false,
      // Phase 6/9 will switch to injectManifest for Background Sync + FCM push.
      manifest: {
        name: 'SVS Driver',
        short_name: 'SVS Driver',
        description: 'Smart Vendor Solutions — Driver Mobile App',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@app': alias('app'),
      '@core': alias('core'),
      '@shared': alias('shared'),
      '@services': alias('services'),
      '@features': alias('features'),
      '@store': alias('store'),
      '@db': alias('db'),
      '@routes': alias('routes'),
      '@hooks': alias('hooks'),
      '@components': alias('components'),
      '@utils': alias('utils'),
      '@assets': alias('assets'),
      '@test': alias('test'),
    },
  },
});
