import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Liminis',
        short_name: 'Liminis',
        description: 'Parcours interactif en réalité augmentée',
        theme_color: '#2a6f97',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Précache au 1er chargement : code de l'app
        globPatterns: ['**/*.{js,css,html,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Assets lourds (AR, illustrations) : mis en cache à la 1re demande
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/ar/') || url.pathname.startsWith('/echelles/'),
            handler: 'CacheFirst',
            options: { cacheName: 'assets-lourds', expiration: { maxEntries: 200 } },
          },
          {
            // Tuiles de carte
            urlPattern: ({ url }) => url.pathname.startsWith('/tiles/'),
            handler: 'CacheFirst',
            options: { cacheName: 'tuiles-carte', expiration: { maxEntries: 3000 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
