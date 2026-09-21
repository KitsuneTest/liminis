import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Liminis — carnet de terrain',
        short_name: 'Liminis',
        description: 'Parcours interactif en réalité augmentée',
        lang: 'fr',
        theme_color: '#f6ecd9',
        background_color: '#f6ecd9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precached on first load: the app code itself
        globPatterns: ['**/*.{js,css,html,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // HTML5 history mode: any unknown URL must serve index.html, otherwise
        // reloading on /parcours gives a 404 while offline.
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Heavy assets (AR, artwork): cached on first request
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/ar/') || url.pathname.startsWith('/echelles/'),
            handler: 'CacheFirst',
            options: { cacheName: 'assets-lourds', expiration: { maxEntries: 200 } },
          },
          {
            // Map tiles served by the app itself (prepared offline mode)
            urlPattern: ({ url }) => url.pathname.startsWith('/tiles/'),
            handler: 'CacheFirst',
            options: { cacheName: 'tuiles-carte', expiration: { maxEntries: 3000 } },
          },
          {
            // OpenStreetMap tiles: cached as the visit goes, so the map stays
            // readable when the network drops.
            urlPattern: ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tuiles-osm',
              expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
