import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  root: new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
  base: '/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  appType: 'spa',


  build: {
    // Vite 8 uses Rolldown/Oxc — use 'oxc' minifier (default in Vite 8) or omit for default
    // Do NOT use 'esbuild' as it requires esbuild to be installed separately in Vite 8
    minify: true, // Uses Rolldown's built-in Oxc minifier (fastest option in Vite 8)
    // Inline assets smaller than 4kb to avoid extra round-trips
    assetsInlineLimit: 4096,
    // Raise chunk warn limit (EarningPage is legitimately large)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Function form required by Rolldown (Vite 8)
        manualChunks: (id) => {
          // Core React runtime — almost never changes between releases
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Animation library (heavy) — cache independently
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          // Icon library
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // Socket.io client
          if (id.includes('node_modules/socket.io-client/') || id.includes('node_modules/engine.io-client/')) {
            return 'vendor-socket';
          }
          // Capacitor plugins
          if (id.includes('node_modules/@capacitor/') || id.includes('node_modules/@capacitor-community/')) {
            return 'vendor-capacitor';
          }
        },
      },
    },
    // No sourcemaps in production (saves build time and bundle size)
    sourcemap: false,
    // CSS code splitting (keep each lazy page's CSS in its own file)
    cssCodeSplit: true,
  },

  // Faster dev server — pre-bundle heavy deps at startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'socket.io-client',
    ],
  },
})
