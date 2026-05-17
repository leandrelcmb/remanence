import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // PWA precaches tout → la taille d'un chunk individuel n'impacte pas le TTI.
    // 700 kB évite le warning trompeur sur le chunk timetable+app.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-i18n':  ['i18next', 'react-i18next'],
          'vendor-idb':   ['idb'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false }, // SW désactivé en dev → hot-reload propre sans cache

      manifest: {
        name: 'Rémanence',
        short_name: 'Rémanence',
        description: 'Journal d’exploration musicale',

        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',

        theme_color: '#000000',
        background_color: '#000000',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }

    })
  ]
})