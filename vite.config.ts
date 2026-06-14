import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Grievance Redressal System',
        short_name: 'GrievanceApp',
        description: 'Offline-first grievance collection system',
        theme_color: '#10b981',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache only built static assets (JS/CSS/images) - do not cache API calls
            urlPattern: /\/.*\.(?:js|css|png|jpg|svg|webp|woff2?)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets-cache', expiration: { maxEntries: 200 } }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
})
