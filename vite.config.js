import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  // ─── Build Output ─────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',         // explicit: hosting platforms must serve from /dist
    sourcemap: false,        // disable sourcemaps in production
    chunkSizeWarningLimit: 1000,
  },

  // ─── Dev Server Proxy (development only) ──────────────────────────────────
  // In production the frontend is served from the same origin as the backend,
  // so /api/* and /socket.io requests go directly to the backend.
  server: {
    proxy: {
      '/api': {
        target: 'https://api.support4funtalk.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://api.support4funtalk.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
