import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',      // Use our custom SW (src/sw.ts)
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',           // Show "update available" banner — not silent
      includeAssets: ['favicon.svg', 'favicon-32.png', 'icons/*.png', 'og-image.png'],
      manifest: false,                   // We manage manifest.json manually in /public
      injectManifest: {
        // App shell: HTML + JS + CSS → precached by Workbox
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
