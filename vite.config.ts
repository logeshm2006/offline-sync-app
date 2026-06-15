import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      filename: 'sw.js',

      includeAssets: ['favicon.svg', 'robots.txt', 'icon-192.png', 'icon-512.png'],

      manifest: {
        name: 'Grievance Redressal System',
        short_name: 'GrievanceApp',
        description: 'Offline-first grievance collection system',
        theme_color: '#10b981',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        scope: '/', 
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // 🔥 FULL CACHE
        navigateFallback: '/index.html', // 🔥 FIX BLANK SCREEN (VERY IMPORTANT)

        runtimeCaching: [
          {
            // API requests → do NOT fully cache (important for sync)
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5
            }
          }
        ]
      }
    })
  ],

  server: {
    port: 5173
  }
})