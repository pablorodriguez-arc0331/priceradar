import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',           // Show "update available" banner — not silent
      includeAssets: ['favicon.svg', 'favicon-32.png', 'icons/*.png', 'og-image.png'],
      manifest: false,                   // We manage manifest.json manually in /public
      workbox: {
        // App shell: HTML + JS + CSS → CacheFirst (cached on install)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime caching strategies
        runtimeCaching: [
          // Google Fonts — CacheFirst, 1 year
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Product images — CacheFirst, 30 days
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase price data — NetworkFirst with cache fallback
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(products|price_points|price_signals|retailers).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-price-data',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 6 * 60 * 60 }, // 6h
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase auth — NetworkOnly (never cache credentials)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: true,                   // Enable SW in dev mode for testing
        type: 'module',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        // Manual chunking — keeps vendor bundles separate for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer': ['framer-motion'],
          'charts': ['recharts'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-toast'],
        },
      },
    },
    // Generate source maps for Sentry (uploaded, not public)
    sourcemap: false,
    // Warn if any single chunk exceeds 500kB
    chunkSizeWarningLimit: 500,
  },
})
